module.exports = function (app) {
	

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

	
	var Blog = require('../app/controller/blog');
	var User = require('../app/controller/user');
	var Index = require('../app/controller/index');
	var Comment = require('../app/controller/comment');
	var Captcha = require('../app/controller/captcha');
	var Mailer = require('../app/controller/mailer');

	// index
	app.get('/', Index.index);
	app.get('/index', Index.index);
	app.get('/index/:page', Index.index);

	//邮箱验证
	app.get('/sendEmail', Mailer.sendEmail);
	
	//获取验证码
	app.get('/captcha/get', Captcha.get);

	// User
	app.post('/login', User.login);
	app.post('/signup', User.signup);
	app.get('/logout', User.logout);
	app.get('/queryInfo', User.queryInfo);
	app.get('/managePass', User.loginRequired, User.managePass);
	app.post('/managePass', User.loginRequired, User.changePass);
	app.post('/managePassByEmail', User.loginRequired, User.changePassByEmail);

	// Blog
	app.get('/article/create/:id?', User.loginRequired, Blog.showCreate);
	app.post('/article/create/:id?', Blog.create);
	app.get('/article/:id', Blog.showBlog);
	app.post('/article/delete/:id', User.loginRequired, Blog.delete);
	app.post('/article/recommend/:id', Blog.recommend);
	app.post('/article/collect/:id', Blog.collect);
	app.post('/article/uploadCover', Blog.uploadCover);

	// Comments
	app.post('/article/comment/:id?', Comment.create);
	app.post('/article/reply/:id?', Comment.reply);
	app.post('/comment/delete/:comment_id', Comment.delete);
};