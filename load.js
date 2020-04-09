const default_url = 'https://git.io/g';
const try_again = 3;
let urls = ['raw.githubusercontent.com', 'raw.githack.com', ''];
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

function get_latest_url(url) {
    if (url.length > 0) {
        let urls = window.location.href.split('?')[0].replace("https://", "").split('/');
        console.log(urls);
        if (urls.length === 5) {
            urls[0] = url;
            urls[3] = 'master';
            urls[4] = 'latest.json';
            let latest = "https://";
            for (let i = 0; i < urls.length; i++) {
                latest += urls[i];
                if (i < 4) {
                    latest += "/"
                }
            }
            return latest
        }
    }
    return 'latest.json';
}


function show_message(m) {
    msg += m;
    document.getElementById("msg").innerHTML = msg;
}

function load(i) {
    let latest_url = get_latest_url(urls[i]);
    let request = new XMLHttpRequest();
    request.open('get', latest_url);
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
            console.log('read ' + latest_url + ' fail, request.status' + request.status);
            show_message('获取信息错误： ' + i + '返回状态码 ' + request.status + '<br>');
            if (i < urls.length) {
                load(++i);
            } else {
                go(default_url);
            }
        }
    };
    request.onerror = function () { // only triggers if the request couldn't be made at all
        console.log('onerror: ' + latest_url);
        show_message('获取信息错误： ' + i + '<br>');
        if (i < urls.length) {
            load(++i);
        } else {
            go(default_url);
        }
    };
}

function check(j, u) {
    let request2 = new XMLHttpRequest();
    request2.open('get', u);
    request2.send(null);
    request2.onload = function () {
        if (request2.status === 200) {
            go(u);
        } else {
            console.log('fail: ' + request.status);
            show_message('测试' + j + ": 返回状态码 " + request.status + '<br>');
            if (j < try_again) {
                check(++j, u);
            } else {
                go(default_url);
            }
        }
    };
    request2.onerror = function () {
        console.log('onerror:  ' + j + ' fail');
        show_message('测试' + j + ': 连接错误<br>');
        if (j < try_again) {
            check(++j, u);
        } else {
            go(default_url);
        }
    };
}

function go(url) {
    window.location.replace(url);
}

            
