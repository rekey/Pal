var http = require('http'),
    url = require('url'),
    child_process = require('child_process'),
    fs = require('fs');

var config = {
    filePath: '/tmp/',
    fontPath: __dirname + '/aller-light.ttf'
};

function createImage(_config, callback) {
    var filePath = config.filePath + Date.now().toString(36) + '.png';
    var args = [];
    args.push('-background');
    args.push('"' + _config.background + '"');
    args.push('-fill');
    args.push('"' + _config.fill + '"');
    args.push('-font');
    args.push(config.fontPath);
    args.push('-size');
    args.push(_config.width + 'x' + _config.height);
    //args.push('-pointsize');
    //args.push('72');
    args.push('-gravity');
    args.push('center');
    args.push('label:' + _config.width + 'x' + _config.height);
    args.push(filePath);
    console.log(args.join(' '));
    //noinspection JSCheckFunctionSignatures
    child_process.exec('convert ' + args.join(' '), function (error) {
        if (error == null) {
            callback(filePath);
        }
    });
}

function parseParam(_url) {
    var arr = url.parse(_url).pathname.replace(/^\//, '').split('/'),
        ret;
    if (arr.length > 1) {
        ret = {
            width: parseInt(arr[0], 10),
            height: parseInt(arr[1], 10),
            fill: '#' + (color3to6(arr[2]) || 'dddddd'),
            background: '#' + (color3to6(arr[3]) || 'efefef')
        };
        ret.width = ret.width > 1000 ? 1000 : ret.width;
        ret.height = ret.height > 1000 ? 1000 : ret.height;
    }
    return ret;
}

function color3to6(color) {
    if (!color) {
        return '';
    }
    if (color.length == 6) {
        return color;
    }
    var str = '';
    [].forEach.call(color, function (s) {
        str += s;
        str += s;
    });
    return str;
}

//noinspection JSUnresolvedFunction
http.createServer(function (request, response) {
    var params = parseParam(request.url);
    if (!params || !params.width || !params.height) {
        //noinspection JSUnresolvedFunction
        response.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        //noinspection JSValidateTypes
        response.end('Field Error');
        return;
    }
    createImage(params, function (filePath) {
        //noinspection JSUnresolvedFunction
        var img = fs.readFileSync(filePath);
        //noinspection JSUnresolvedFunction
        response.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': img.length,
            'cache-control': 'max-age=' + 1000 * 3600 * 24 * 30,
            'Expires': new Date(Date.now() + 1000 * 3600 * 24 * 30)
        });

        //noinspection JSCheckFunctionSignatures
        response.write(img, 'buffer');
        response.end(filePath);
        child_process.exec('rm ' + filePath);
    });
}).listen(9527);

console.log('Server running at http://127.0.0.1:9527/');