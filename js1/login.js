

async function login(){
    try {
        let err = verifyList(['username','password']);
        if (err === 0){
            let username = $("#username").val();
            let password = $("#password").val();
            let r = await ajax2('POST', `/api/login`, {username, password});
            if (r === null) {
                alert("Ha ocurrido un error en el proceso");
                return;
            }
            if (!r.status || compare(r.message)) alert(r.message);
            else {
                sessionStorage.setItem('token', r.token);
                location.href = "agenda.html";
            }
        }
    }
    catch (e) {
        console.log(e);
        alert("Ha ocurrido un error en el proceso");
    }
}