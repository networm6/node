const request = require('request');
const app = require('express')();
const http = require('http').Server(app);
const sha1 = require('sha1');
const schedule = require('node-schedule');
let ADDR = "";

const scheduleMission = () => {
    schedule.scheduleJob('55 * * * * *', () => {
        login();
        console.log("ADDR:" + ADDR);
        console.log("\n\n\n\n");
    });
}

scheduleMission();
login();
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
    const pwd = "ahuisealb109";
    request({
        url: "http://miwifi.com/cgi-bin/luci/api/xqsystem/login",
        method: "POST",
        json: true,
        strictSSL: false,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': 'miwifi.com',
            'Origin': 'http://miwifi.com',
            'Referer': 'http://miwifi.com/cgi-bin/luci/web',
            'X-Requested-With': 'XMLHttpRequest',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6'
        },
        body: "username=admin&password=" + oldPwd(pwd, simonNonce, simonKey) + "&logtype=2&nonce=" + simonNonce
    }, function (error, response, body) {
        if (error) {
            login();
        } else {
            try {
                var token = response.body.token;
                getAddress(token);
            } catch (e) {
                login();
            }

        }
    });
}

function getAddress(token) {
    request({
        url: "https://miwifi.com/cgi-bin/luci/;stok=" + token + "/api/xqnetwork/pppoe_status",
        method: "GET",
        strictSSL: false,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Host': 'miwifi.com',
            'Origin': 'http://miwifi.com',
            'Referer': 'http://miwifi.com/cgi-bin/luci/web',
            'X-Requested-With': 'XMLHttpRequest',
            'Connection': 'keep-alive',
            'Accept-Encoding': 'gzip, deflate',
            'Accept': '*/*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6'
        },
    }, function (error, response, body) {
        if (error) {
            getAddress(token);
        } else {
            try {
                const currentAddress = JSON.parse(body).ip.address;
                console.log("currentAddress:" + currentAddress);
                if (ADDR !== currentAddress) {
                    ADDR = currentAddress;
                    sendAddress(currentAddress);
                }
            } catch (e) {
                getAddress(token);
            }
        }
    });
}

function sendAddress(address) {
    request({
        url: "http://124.220.11.247:10800/address.php?url=http://" + address,
        method: "GET",
        strictSSL: false,
    }, function (error, response, body) {
        if (error) {
            sendAddress(address);
        } else {
            try {
                console.log("sendAddress");
            } catch (e) {
                sendAddress(address);
            }
        }
    });
}