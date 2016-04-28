module.exports = function (app) {
	
	var Blog = require('../app/controller/blog');
	var User = require('../app/controller/user');
	var Index = require('../app/controller/index');
	var Comment = require('../app/controller/comment');
	var captchapng = require('captchapng');

	// check login
	app.use(function (req,res,next) {
		var token = req.session.token;
	  	if(token) {
	    	// 已登录
	    	res.locals.user = req.session.user;
	    	//res.session.user = null;
	    	res.locals.isLogin = true;
	    	next();
	  	} else {
	    	// 未登录
	    	res.locals.user = {};
	    	res.locals.isLogin = false;
	    	next();
	  	}
	});

	// index
	app.get('/', Index.index);
	app.get('/index', Index.index);
	app.get('/index/:page', Index.index);

	// User
	app.post('/login', User.login);
	app.post('/signup', User.signup);
	app.get('/logout', User.logout);
	app.get('/queryInfo', User.queryInfo);


	// Blog
	app.get('/article/create/:id?', User.loginRequired, Blog.showCreate);
	app.post('/article/create/:id?', Blog.create);
	app.get('/article/:id', Blog.showBlog);
	app.post('/article/delete/:id', User.loginRequired, Blog.delete);
	app.post('/article/recommend/:id', Blog.recommend);
	app.post('/article/collect/:id', Blog.collect);
	app.post('/article/uploadCover', Blog.uploadCover);

	app.get('/sendEmail', function (req, res, next) {
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
	});
	app.get('/EmailValidate', function (req, res, next) {
		console.log(req.query.id);
		console.log(req.query.num);
		res.redirect('/');
	});
	app.get('/captchar/get', function (req, res, next) {

		var width=!isNaN(parseInt(req.query.width))?parseInt(req.query.width):120;
    	var height=!isNaN(parseInt(req.query.height))?parseInt(req.query.height):35;

		var code = parseInt(Math.random()*9000+1000);
	    req.session.checkcode = code;

	    var p = new captchapng(width,height, code);
	    p.color(parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255), 80); 
	    p.color(parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255), 255);

	    var img = p.getBase64();
	    var imgbase64 = new Buffer(img,'base64');
	    res.writeHead(200, {
	        'Content-Type': 'image/png'
	    });
	    res.end(imgbase64);
	});

	// Comments
	app.post('/article/comment/:id?', Comment.create);
	app.post('/article/reply/:id?', Comment.reply);
	app.post('/comment/delete/:comment_id', Comment.delete);

	/*app.get('/captchar/get', function (req, res, next) {

	});*/
};