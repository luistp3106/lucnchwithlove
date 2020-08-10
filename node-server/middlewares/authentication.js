const crypto = require("../security/crypto");

function midAuthentication(){
    return function (req, res, next) {
        next();
    };
}

function realAuthentication(){
    return function (req, res, next) {
        if (!req.body['token']){
            return res.status(401).send("NOOOO!!");
        }
        try{
            let user = JSON.parse(crypto.decrypt(req.body['token']));
            let lastTime = new Date(user.offTime), date = new Date();
            if (date.getTime() - lastTime.getTime() > 3600000) return res.status(401).send("NOOOO!!");
        }
        catch (e) {
            return res.status(401).send("NOOOO!!");
        }
        if (req.cookies['os']) res.cookie('os', req.cookies['os'], { expires: new Date(Date.now() + 300000), httpOnly: true, secure: false });
        next();
    };
}

module.exports = {
    midAuthentication,
    realAuthentication
};
