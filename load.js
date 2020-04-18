const DEFAULT_URL = 'https://git.io/g';
const TRY_AGAIN = 3;
const HOSTNAME_ARRAY = ['cdn.jsdelivr.net', ''];
const LATEST_FILENAME = 'latest.json';
let msg = '';

function get(name) {
    const parts = window.location.href.split('?');
    if (parts.length > 1) {
        name = encodeURIComponent(name);
        const params = parts[1].split('&');
        const found = params.filter(el => (el.split('=')[0] === name) && el);
        if (found.length) return decodeURIComponent(found[0].split('=')[1]);
    }
    return "";
}

function getLatestUrl(hostname) {
    if (hostname.length > 0) {
        let myURL = new URL(window.location.href);
        let pathname = myURL.pathname.split('/');
        if (pathname.length === 4) {
            myURL.hostname = hostname;
            pathname[1] = pathname[0];
            pathname[0] = 'gh';
            pathname[2] = 'cdn';
            pathname[3] = LATEST_FILENAME;
            let newPathname = '';
            for (let i = 0; i < pathname.length; i++) {
                newPathname += pathname[i];
                if (i < 3) {
                    newPathname += "/"
                }
            }
            myURL.pathname = newPathname;
            return myURL.href
        }
    }
    return LATEST_FILENAME;
}


function showMessage(m) {
    msg += m;
    document.getElementById("msg").innerHTML = msg;
}

function load(i) {
    let latestUrl = getLatestUrl(HOSTNAME_ARRAY[i]);
    let request = new XMLHttpRequest();
    request.open('get', latestUrl);
    request.send(null);
    request.onload = function () {
        if (request.status === 200) {
            console.log(request.responseText);
            let data = window.atob(request.responseText);
            let json = JSON.parse(data);
            console.log(json);
            let server = json.server;
            let p = get('p');
            let u = 'https://' + server;
            if (p === '') {
                u += '/ccc';
            } else {
                u += '/' + p;
            }
            check(0, u);
        } else {
            console.log('read ' + latestUrl + ' fail, request.status' + request.status);
            showMessage('获取信息错误： ' + i + '，返回状态码 ' + request.status + '<br>');
            if (i < HOSTNAME_ARRAY.length) {
                load(++i);
            } else {
                go(DEFAULT_URL);
            }
        }
    };
    request.onerror = function () { // only triggers if the request couldn't be made at all
        console.log('onerror: ' + latestUrl);
        showMessage('获取信息错误： ' + i + '<br>');
        if (i < HOSTNAME_ARRAY.length) {
            load(++i);
        } else {
            go(DEFAULT_URL);
        }
    };
}

function check(j, u) {
    let request = new XMLHttpRequest();
    request.open('get', u);
    request.send(null);
    request.onload = function () {
        if (request.status === 200) {
            go(u);
        } else {
            console.log('fail: ' + request.status);
            showMessage('测试' + j + ": 返回状态码 " + request.status + '<br>');
            if (j < TRY_AGAIN) {
                check(++j, u);
            } else {
                go(DEFAULT_URL);
            }
        }
    };
    request.onerror = function () {
        console.log('onerror:  ' + j + ' fail');
        showMessage('测试' + j + ': 连接错误<br>');
        if (j < TRY_AGAIN) {
            check(++j, u);
        } else {
            go(DEFAULT_URL);
        }
    };
}

function go(url) {
    let myURL = new URL(url);
    showMessage('正在等待 ' + myURL.hostname + ' 响应……<br>');

    function jump() {
        window.location.href = url;
    }

    setTimeout(jump, 2000);
}

window.onload = function () {
    load(0);
};
