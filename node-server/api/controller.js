const express = require('express');
const router = express.Router();
const logic = require("../services/logic");
const models = require("../models/index");
const nodemailer = require('nodemailer');
const crypto = require('../security/crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'madresmilrd@gmail.com',
        pass: 'madresmil3101'
    }
});
let mailOptions = {
    from: 'Madres Mil RD <madresmilrd@gmail.com>',
    to: 'madresmilrd@gmail.com',
    // to: 'edison22_1997@live.com',
    subject: '',
    html: ''
};


router.post("/sendMail", async (req, res) => {
    try {
        let {form} = req.body;
        let m = logic.noPointer(mailOptions);
        m.subject = `Mensaje de "${form.nombre.toUpperCase()}"`;
        m.html = `Nombre completo: <b>${form.nombre.toUpperCase()}</b><br>
                    E-mail: <b>${form.email.toLowerCase()}<br></b>
                    Mensaje: ${form.mensaje.toLowerCase()}
                    `;
        transporter.sendMail(m, async function (error, info) {
            if (error) {
                res.json({status: false, message: 'Ha ocurrido un error en el proceso'});
            } else {
                res.json({status: true});
            }
        });
    } catch (e) {
        console.log(e);
        res.json({status: false, message: 'Ha ocurrido un error en el proceso'});
    }
});

router.post("/manageFormulario", async (req, res) => {
    try {
        let {form} = req.body;
		logic.cleanObjectProperties(form, ['santiago', 'modalidad', 'date', 'nombre', 'area', 'servicio', 'email', 'telefono']);
        let finalDate = new Date(form.date), initialDate = new Date(form.date);
        finalDate.setMinutes(finalDate.getMinutes() + 179);
		let RDDate = new Date(initialDate);
		RDDate.setHours(RDDate.getHours() - 4);
		let citas = await models.cita.count({
			where: models.Sequelize.literal(`'${initialDate.toISOString()}' between fecha_inicio and fecha_fin
				or '${finalDate.toISOString()}' between fecha_inicio and fecha_fin `)
		});
		if (citas > 0) {
			res.json({status: false, message: `Esta cita choca con ${citas} cita(s)`});
			return;
		}
		if (form.santiago === "no" && form.modalidad === "Servicio a Domicilio") {
			res.json({status: false, message: 'No se ofrece servicio a domicilio fuera de Santiago'});
			return;
		}
		if (RDDate.getDay() === 0) {
			res.json({status: false, message: 'No laboramos los domingos'});
			return;
		}
		if (RDDate.getDay() === 6 && RDDate.getHours() > 11) {
			res.json({status: false, message: 'Solo laboramos los sábados hasta las 12 del medio día'});
			return;
		}
        await models.cita.create({
			nombre_paciente: form.nombre,
			fecha_inicio: initialDate,
			fecha_fin: finalDate,
			tipo_cita: form.area
		});
		await models.formulario.create({json: form});
		let m = logic.noPointer(mailOptions);
		m.subject = `Asesoría en lactancia materna para  "${form.nombre.toUpperCase()}"`;
		let cita = new Date(form.date);
		m.html = `
			Hola Genesis, ¡En buena hora! tienes una cita nueva, a continuación los datos de la misma:
			<br>
			<br>

		  Nombre completo: <b>${form.nombre.toUpperCase()}</b><br>
		  Asesoría en:: <b>${form.servicio.toUpperCase()}</b><br>
		  Modalidad: <b>${form.modalidad.toUpperCase()}</b><br>
		  Área: <b>${form.area.toUpperCase()}</b><br>
		  E-mail: <b>${form.email.toLowerCase()}<br></b>
		  Teléfono: <b>${form.telefono.toLowerCase()}<br></b>
		  Fecha y hora de la cita: <b>${form.fechaEnString}<br></b>
		`;
		transporter.sendMail(m, async function (error, info) {
			if (error) {
				console.log(error);
				res.json({status: false, message: 'Ha ocurrido un error en el proceso'});
			} else {
				let m = logic.noPointer(mailOptions);
				m.subject = `Genesis Nouel – Asesora Lactancia Materna `;
				m.to = form.email;

				m.html = `
          <hr class="mt-0 mb-60 " style="color: #F2B2B0"/>
        <div class="footer-made" style="text-align:center;color:#ffffff; font-size:22px; background-color: #F2B2B0">
          Genesis Nouel<br>
          <h2 class="hs-line-3 mb-0">
              Asesora de Lactancia Materna    &bull;   Alimentación Complementaria
          </h2>
        </div>
        <br><br>
        <div style="text-align:justify">
        Luego de un cordial y afectuoso saludo ${form.nombre.toUpperCase()}, me complace que formes parte de nuestra hermosa comunidad de madres que se interesan y preocupan  por educarse en cuanto al tema de la Lactancia Materna y cuidados del recién nacido
          </div>
						<br><br>
            <div style="text-align:justify">
            Soy Genesis Nouel, Asesora de Lactancia Materna y Alimentación Complementaria, fundadora del proyecto Madres Mil.
            </div>
						<br><br>
            <div style="text-align:justify">
					Esta será una de las formas en que estaremos conectadas y mi WhatsApp, ya sea para algún pormenor con tu cita o cualquier inquietud que tengas en cuanto a nuestros servicios.
  </div>
          	<br>

            <h2 class="section-title font-alt align-center mb-70 mb-sm-40" style="color: #FB605B ; font-size: 30px; text-align:center;" >
                ¡Bienvenida! Y gracias por ser parte de esta comunidad.
            </h2>
            <br>
            <div style="text-align:justify">
						Esta es la fecha de nuestro encuentro: <b>${form.fechaEnString}<br></b>
						Esta es la asesoría que elegiste: <b>${form.servicio.toUpperCase()}</b><br>
						<br><br>
					Para Fines de pago me estaré comunicando contigo para enviarte mis cuentas o un link de pago mediante el cual puedes pagar con tarjetas de crédito/débito o PayPal Nos puedes contactar por WhatsApp o llamarnos al: 849-215-9555 Para cualquier aclaración
  </div>
<br><br>
					</p>  <footer class="small-section bg-gray-lighter footer pb-60" id="contact" style="background-color: #F2B2B0">
          <div style="background-color: #FCFEEC">
                      <h2 class="section-title font-alt align-center mb-70 mb-sm-40" style="color: #FB605B ; font-size: 45px;text-align:center;" >

                          <a href="https://wa.me/18492159555" target="_blank"> Contáctame por WhatsApp</a>
                      </h2>
</div>
                            <hr class="mt-0 mb-60 " style="color: #F2B2B0"/>




                            <!-- End Social Links -->

                            <!-- Footer Text -->
                            <div class="footer-text">

                                <!-- Copyright -->

                                <!-- End Copyright -->

                                <div class="footer-made" style="text-align:center;color:#ffffff; font-size:22px; background-color: #F2B2B0">
                                  Gracias por ser parte de nuestra familia<br>
                                  <a href="http://madresmilrd.com/" target="_blank"> Madresmilrd.com</a>
                                </div>

                            </div>
                            <!-- End Footer Text -->

                         </div>
`;
				transporter.sendMail(m, async function (error, info) {
					if (error) {
						res.json({
							status: true,
							message: `Cita creada exitósamente. ${form.modalidad === 'Online' ? `Sin embargo, el correo suministrado es inválido, no recibirá su correo de confirmación` : ''}`
						});
					} else {
						res.json({status: true});
					}
				});
			}
		});
    } catch (e) {
        console.log(e);
        res.json({status: false, message: 'Ha ocurrido un error en el proceso'});
    }
});

router.post("/login", async (req, res) => {
    try {
        let {username, password} = req.body;
        if (logic.compare(username) && logic.compare(password) && typeof username === "string" && typeof password === "string") {
            let uss = await models.usuario.findOne({where: {nombre_usuario: username.trim().toLowerCase()}});
            if (logic.compare(uss)) {
                let cPass = crypto.decrypt(uss.password);
                if (cPass === password) {
                    res.json({
                        status: true,
                        token: crypto.encrypt(JSON.stringify({...logic.noPointer(uss), offTime: new Date()}))
                    });
                } else res.json({status: false, message: 'Credenciales inválidas'});
            } else res.json({status: false, message: 'Credenciales inválidas'});
        } else res.json({status: false, message: 'Credenciales inválidas'});
    } catch (e) {
        console.log(e);
        res.json(null);
    }
});

router.post("/encode", async (req, res) => {
	res.json(crypto.encrypt(req.body.text));
});

router.post("/decode", async (req, res) => {
	res.json(crypto.decrypt(req.body.text));
});

try {
    (async function f() {
        let count = await models.usuario.count({where: {nombre_usuario: 'jp22'}});

        count = await models.usuario.count({where: {nombre_usuario: 'luis'}});
        if (count === 0) {
            await models.usuario.create({
                nombre: 'Luis',
                apellido: 'Trinidad',
                nombre_usuario: 'luis',
                email: 'doesntmatter@prueba.com',
                password: 'b1663c90335d3667d702b695b4cca944:dc1b7a0514a4cd476f2e851ded8ddcfc6688c05f1f1eafc8bcc32a8c2c1b0669'
            });
        }
        count = await models.usuario.count({where: {nombre_usuario: 'alejandra'}});
        if (count === 0) {
            await models.usuario.create({
                nombre: 'genesis',
                apellido: 'nouel',
                nombre_usuario: 'genesis',
                email: 'madresmilrd@gmail.com',
                password: 'af820ff32fa3665728c911973809fc7f:55761daaa97b41d5f1f02eefbcc8a717'
            });
        }
    })();
} catch (e) {
    console.log(e);
}

module.exports = {
    router: router,
    func: function (io1) {

    }
};
