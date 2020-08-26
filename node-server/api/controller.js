const express = require('express');
const router = express.Router();
const logic = require("../services/logic");
const models = require("../models/index");
const nodemailer = require('nodemailer');
const crypto = require('../security/crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lunchwithlovewebapp@gmail.com',
        pass: 'lunchwebapp'
    }
});
let mailOptions = {
    from: 'Lunch With Love RD <lunchwithlovewebapp@gmail.com>',
    to: 'lunchwithlovewebapp@gmail.com',
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
        console.log(req.body);
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
		m.subject = `Cita Dra Tahirih Hawa Lunch with Love  "${form.nombre.toUpperCase()}"`;
		let cita = new Date(form.date);
		m.html = `
			Hola Dra. Hawa, ¡En buena hora! tienes una cita nueva, a continuación los datos de la misma:
			<br>
			<br>

		  Nombre completo pasciente: <b>${form.nombreh.toUpperCase()}</b><br>
		  Peso:: <b>${form.peso.toUpperCase()}</b><br>
		  Estatura: <b>${form.estatura.toUpperCase()}</b><br>
		  Edad: <b>${form.edad.toUpperCase()}</b><br>
		  El niño tienes hermanos?: <b>${form.hermanos.toLowerCase()}<br></b>
		  Cantidad Hermanos: <b>${form.canther.toLowerCase()}<br></b>
		  Asiste a guarderia: <b>${form.guarderia.toLowerCase()}<br></b>
      Fecha de Nacimiento: <b>${form.fechaEnString}<br></b>
      Genero: <b>${form.genero.toLowerCase()}<br></b>
      Forma parto: <b>${form.parto.toLowerCase()}<br></b>
      Semanas del bebe al nacer: <b>${form.nacimiento.toLowerCase()}<br></b>
      Peso al nacer: <b>${form.peson.toLowerCase()}<br></b>
      Estatura al nacer: <b>${form.estaturan.toLowerCase()}<br></b>
      Complicaciones del parto: <b>${form.partoc.toLowerCase()}<br></b>
      Sufre el niño alguna enfermedad: <b>${form.enfermedad.toLowerCase()}<br></b>
      Si la respuesta anterior es SI especifica cuál es la patología: <b>${form.enfermedadd.toLowerCase()}<br></b>
      Cirugias previas: <b>${form.cirugiaspre.toLowerCase()}<br></b>
      Sufre el niño de alguna alergia: <b>${form.alergia.toLowerCase()}<br></b>
      Medicamento usado para la alergia: <b>${form.guarderia.toLowerCase()}<br></b>
      Fuente alimentacion primeros 6 meses: <b>${form.guarderia.toLowerCase()}<br></b>
      Comienzo alimentacion Complementaria: <b>${form.comple.toLowerCase()}<br></b>
      Metodo alimentacion Complementaria: <b>${form.alimentacionc.toLowerCase()}<br></b>
      Primeros alimentos ofrecido al bebe: <b>${form.primeros.toLowerCase()}<br></b>
      A qué edad se introdujeron comidas que contenían sal y azúcar?: <b>${form.salya.toLowerCase()}<br></b>
      Horarios de comidas establecidos actualmente: <b>${form.horariosc.toLowerCase()}<br></b>
      ¿Cuántas veces al día come el niño?: <b>${form.ingesc.toLowerCase()}<br></b>
      Cuál es el tiempo promedio que tu hijo/a dura en cada comida?: <b>${form.tiempop.toLowerCase()}<br></b>
      Quién alimenta al niño la mayoría de las veces?: <b>${form.quiena.toLowerCase()}<br></b>
      El niño como con la Familia: <b>${form.comefam.toLowerCase()}<br></b>
      Lugar donde comen: <b>${form.lugarc.toLowerCase()}<br></b>
      ¿Cuántas veces por semana le brinda alimentos tales como: carnes, pollo, hígado, pescado, morcilla?: <b>${form.cantal.toLowerCase()}<br></b>
      Alergia Alimentarias: <b>${form.alergiaa.toLowerCase()}<br></b>
      Si la respuesta anterior es SI cuéntame a cuál o cuáles alimentos es alérgico tu niño/a: <b>${form.alialer.toLowerCase()}<br></b>
      Cambias la alimentacion cuando el niño esta enfermo: <b>${form.cambioali.toLowerCase()}<br></b>
      Comenta datos de interés de la alimentación de tu hijo/a:: <b>${form.comena.toLowerCase()}<br></b>
      Nombre Tutor: <b>${form.nombret.toLowerCase()}<br></b>
      Telefono Tutor: <b>${form.telt.toLowerCase()}<br></b>
      Dirrecion Tutor: <b>${form.diret.toLowerCase()}<br></b>
      Email Tutor: <b>${form.emailt.toLowerCase()}<br></b>
      Trabajo Tutor: <b>${form.trabajot.toLowerCase()}<br></b>
      Cuántas horas de tu día dispones para dedicar a tu hijo/a?: <b>${form.horash.toLowerCase()}<br></b>
      Qué te motiva a consultar con nosotros o formar parte de uno de nuestros programas?: <b>${form.moti.toLowerCase()}<br></b>
      Comentarios o inquietudes: <b>${form.comenp.toLowerCase()}<br></b>
      Programa: <b>${form.servicio.toLowerCase()}<br></b>
      Modalidad: <b>${form.modalidad.toLowerCase()}<br></b>
    










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
        <div class="footer-made" style="text-align:center;color:#000; font-size:22px; background-color: #49A1D0">
          Dra. Tahirih Hawa - Lunch with Love RD<br>
          <h2 class="hs-line-3 mb-0">
              Doctora en medicina    &bull;   Especialidad Nutriologa
          </h2>
        </div>
        <br><br>
        <div style="text-align:justify">
        Luego de un cordial y afectuoso saludo ${form.nombre.toUpperCase()}, me complace que formes parte de nuestra hermosa comunidad de padres que se interesan y preocupan  por educarse en cuanto al tema de la Lactancia Materna y cuidados del recién nacido
          </div>
						<br><br>
            <div style="text-align:justify">
            Hola, soy Tahirih Hawa, doctora en medicina, cursando la especialidad de Nutrición Clínica Hospitalaria y un Máster en Nutrición Clínica en Pediatría. Soy madre de una hermosa niña de 6 años y esposa del mejor hombre del mundo <br> <br>
            Tengo un profundo deseo por ayudar a padres y madres que luchan día tras día con problemas de la alimentación de sus hijos
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
						Esta es el servicio: <b>${form.servicio.toUpperCase()}</b><br>
						<br><br>
				Puedes realizar el pago de tus servicios mediante con PayPal mediante nuestra página si necesitas un numero de cuenta para pagar los servicios por favor contactarme al 829-716-1628
  </div>
<br><br>
					</p>  <footer class="small-section bg-gray-lighter footer pb-60" id="contact" style="background-color: #fff">
          <div style="background-color: #49A1D0">
                      <h2 class="section-title font-alt align-center mb-70 mb-sm-40" style="color: #49A1D0 ; font-size: 45px;text-align:center;" >

                          <a href="https://wa.me/18297161628" target="_blank"> Contáctame por WhatsApp</a>
                      </h2>
</div>
                            <hr class="mt-0 mb-60 " style="color: #49A1D0"/>




                            <!-- End Social Links -->

                            <!-- Footer Text -->
                            <div class="footer-text">

                                <!-- Copyright -->

                                <!-- End Copyright -->

                                <div class="footer-made" style="text-align:center;color:#ffffff; font-size:22px; background-color: #49A1D0">
                                  Gracias por ser parte de nuestra familia<br>
                                  <a href="http://lunchwirhloverd.com/" target="_blank"> lunchwithloverd.com</a>
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
