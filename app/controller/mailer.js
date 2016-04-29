var nodemailer = require('nodemailer');
exports.sendEmail = function (req, res, next) {
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
        to: '1814207398@qq.com', // list of receivers
        subject: '欢迎注册MyBlog ✔', // Subject line
        text: 'Hello world', // plaintext body
        html: '<b>Hello world</b><b><a href="http://127.0.0.1:3000/EmailValidate?id=123&num=456">点此处完成邮箱验证</a></b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
};
exports.emailValidate = function (req, res, next) {
    console.log(req.query.id);
    console.log(req.query.num);
    res.redirect('/');
}