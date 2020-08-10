function compare(element) {
    return element !== null && element !== '' && typeof element !== "undefined";
}

function showFaltante(missing) {
    let str = 'Faltante: ';
    for(let [index, i] of missing.entries()){
        str += `${i.name}${index < missing.length - 1 ? ', ' : ''}`;
    }
    alert(str);
}

function getHourAndMeridian(date) {
    if (date.getHours() >= 1 && date.getHours() <= 11) return {hora: date.getHours(), meridiano: 'AM'};
    if (date.getHours() >= 13 && date.getHours() <= 23) return {hora: date.getHours()-12, meridiano: 'PM'};
    if (date.getHours() === 0) return {hora: 12, meridiano:'AM'};
    return {hora: 12, meridiano: 'PM'}
}

function formatCompleteDate(date) {
    return `${("00"+date.getDate()).slice(-2)}/${("00"+(date.getMonth()+1)).slice(-2)}/${date.getFullYear()} ${("00"+getHourAndMeridian(date).hora).slice(-2)}:${("00"+date.getMinutes()).slice(-2)}:${("00"+date.getSeconds()).slice(-2)} ${getHourAndMeridian(date).meridiano}`
}

function formatDate(date) {
    return `${("00"+date.getDate()).slice(-2)}/${("00"+(date.getMonth()+1)).slice(-2)}/${date.getFullYear()}`;
}

function verifyList(list){
    let status = 0, missing = [];
    for(let i of list){
        if (!compare(document.getElementById(i).value)) {
            status = 1;
            missing.push({name: document.getElementById(i).getAttribute('name')})
        }
    }
    if (status === 1) showFaltante(missing);
    return status;
}

function getPostStr(obj){
    try {
        let str = '';
        for(let i in obj){
            let s = JSON.stringify(obj[i]);
            str += `${i}=${s.substr(1, s.length - 2)}&`;
        }
        return str.substr(0, str.length - 1);
    }
    catch (e) {
        console.log(e);
        return "";
    }
}

function ajax(method, url, data){
    return new Promise(function (resolve) {
        try {
            let xhr = new XMLHttpRequest();
            xhr.open(method, `${location.protocol}//${location.hostname}:3032${url}`, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onload = function() {
                try {
                    if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
                    else resolve(null);
                }
                catch (e) {
                    console.log(e);
                    resolve(null);
                }
            };
            xhr.send(compare(data) ? getPostStr(data) : '');
        }
        catch (e) {
            console.log(e);
            resolve(null);
        }
    });
}

function ajax2(method, url, data) {
    return new Promise(function (resolve) {
        $.ajax ({
            type: method,
            url: `${location.protocol}//${location.hostname}:3032${url}`,
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (jsonData, textStatus, xhr) {
                if (xhr.status === 401) location.href = "login.html";
                resolve(jsonData);
            },
            error: function(xhr) {
                if (xhr.status === 401) location.href = "login.html";
                resolve(null);
            }
        });
    });
}
