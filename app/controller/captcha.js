var captchapng = require('captchapng');
exports.get = function (req, res, next) {
    var width=!isNaN(parseInt(req.query.width))?parseInt(req.query.width):120;
    var height=!isNaN(parseInt(req.query.height))?parseInt(req.query.height):35;

    var code = parseInt(Math.random()*9000+1000);
    req.session.captcha = code;

    var p = new captchapng(width,height, code);
    p.color(parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255), 80); 
    p.color(parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255), 255);

    var img = p.getBase64();
    var imgbase64 = new Buffer(img,'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png'
    });
    res.end(imgbase64);
}