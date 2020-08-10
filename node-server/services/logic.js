const crypto = require("../security/crypto");

function compare(element){
    return element !== null && typeof element !== "undefined" && element !== '';
}

function noPointer(obj){
    return JSON.parse(JSON.stringify(obj));
}

function formatDate(date) {
    return `${("00"+date.getDate()).slice(-2)}/${("00"+(date.getMonth()+1)).slice(-2)}/${date.getFullYear()} ${("00"+getHourAndMeridian(date).hora).slice(-2)}:${("00"+date.getMinutes()).slice(-2)}:${("00"+date.getSeconds()).slice(-2)} ${getHourAndMeridian(date).meridiano}`
}

function formatDateNoHour(date) {
    return `${("00"+date.getDate()).slice(-2)}/${("00"+(date.getMonth()+1)).slice(-2)}/${date.getFullYear()}`;
}

function listOnString(list, funName){
    try {
        let str = "";
        for(let [index, i] of list.entries()){
            str += `${i[funName]()}${index < list.length - 1 ? ', ' : ''}`;
        }
        return str;
    }
    catch (e) {
        console.log(e);
        return "";
    }
}

function getHourAndMeridian(date) {
    if (date.getHours() >= 1 && date.getHours() <= 11) return {hora: date.getHours(), meridiano: 'AM'};
    if (date.getHours() >= 13 && date.getHours() <= 23) return {hora: date.getHours()-12, meridiano: 'PM'};
    if (date.getHours() === 0) return {hora: 12, meridiano:'AM'};
    return {hora: 12, meridiano: 'PM'}
}

function resetTimeUser(token){
    let user = JSON.parse(crypto.decrypt(token));
    user.offTime = new Date();
    return crypto.encrypt(JSON.stringify(user));
}

module.exports = {
    compare,
    noPointer,
    formatDate,
    listOnString,
    formatDateNoHour,
    resetTimeUser
};