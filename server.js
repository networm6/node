const request = require('request');
const app = require('express')();
const http = require('http').Server(app);
const sha1 = require('sha1');
const schedule = require('node-schedule');

const scheduleMission = () => {
    //每分钟的第30分钟定时执行一次:
    schedule.scheduleJob('* 1 * * * *', () => {
        login();
    });
}
login();
scheduleMission();
var ADDR = "";
app.get('/getIP', function (req, res) {
    res.send(ADDR);
});
http.listen(3000, function () {
    console.log('listening on *:3000');
});

function nonceCreat() {
    var type = 0;
    var deviceId = '42:78:82:3e:5c:29';
    var time = Math.floor(new Date().getTime() / 1000);
    var random = Math.floor(Math.random() * 10000);
    return [type, deviceId, time, random].join('_');
}

function oldPwd(pwd, nonce, key) {
    return sha1(nonce + sha1(pwd + key));
}

function login() {
    const simonKey = 'a2ffa5c9be07488bbb04a3a47d3c5f6a';
    const simonNonce = nonceCreat();
    const pwd = "ahuisealb1";
    request({
        url: "https://miwifi.com/cgi-bin/luci/api/xqsystem/login",
        method: "POST",
        json: true,
        strictSSL: false,
        body: "username=admin&password=" + oldPwd(pwd, simonNonce, simonKey) + "&logtype=2&nonce=" + simonNonce
    }, function () {
        getAddress();
    });
}

function getAddress() {
    request({
        url: "https://miwifi.com/cgi-bin/luci/;stok=95294fb312fe0a33da12d966e69d411c/api/xqnetwork/pppoe_status",
        method: "GET",
        strictSSL: false,
    }, function (error, response, body) {
        const currentAddress = JSON.parse(body).ip.address;
        console.log("currentAddress:" + currentAddress);
        ADDR = currentAddress;
        sendAddress(currentAddress);
    });
}

function sendAddress(address) {
    request({
        url: "http://1.12.224.42:3000/address?address=" + address,
        method: "GET",
        strictSSL: false,
    }, function (error, response, body) {
        console.log("sendAddress\n");
        console.log("error" + error + "\nresponse:" + response + "\nbody:" + body);
    });
}
