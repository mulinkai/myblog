var nodemailer = require('nodemailer');
exports.sendEmail = function (req, res, next) {
    var s = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        captcha = '';
    for(var i = 0; i < 6; i++) {
        var temp = Math.floor(Math.random()*62);
        captcha += s.charAt(temp);
    }
    var nodemailer = require('nodemailer');

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport({
        host: 'smtp.126.com',
        secureConnection: true,
        port: 25,
        auth: {
            user: 'muyu10086@126.com',
            pass: 'myblog123456'
        }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"MyBlog" <muyu10086@126.com>', // sender address
        to: req.query.email, // list of receivers
        subject: '修改密码验证', // Subject line
        text: '邮箱验证码', // plaintext body
        html: '<b>邮箱验证码</b><b>尊敬的用户您好，本次修改密码的验证码为' + captcha + ',请勿将验证码告诉其他人，如果不是本人操作，请忽略此邮件</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
        req.session.emailCaptcha = captcha;
        res.send({
            status: 1
        });
    });
};