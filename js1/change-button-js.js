
let fun = function () {
    let result = sessionStorage.getItem('token');
    if (result !== null) $("#iniciarSesion").html('<a href="agenda.html" style="height: 75px; line-height: 75px;">Ver agenda </a>');
    else $("#iniciarSesion").html('<a href="login.html" style="height: 75px; line-height: 75px;">Iniciar sesión </a>');
};

fun();

setInterval(fun, 15000);