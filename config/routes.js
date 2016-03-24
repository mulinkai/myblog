module.exports = function (app) {
	
	var Blog = require('../app/controller/blog');
	var User = require('../app/controller/user');
	var Index = require('../app/controller/index');
	var Comment = require('../app/controller/comment');

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
	app.get('/:keyword?', Index.index);

	// USer
	app.get('/login', User.showLogin);
	app.post('/login', User.login);
	app.get('/signup', User.showSignup);
	app.post('/signup', User.signup);
	app.get('/logout', User.logout);


	// Blog
	app.get('/article/create/:id?', User.loginRequired, Blog.showCreate);
	app.post('/article/create/:id?', Blog.create);
	app.get('/article/:id', Blog.showBlog);
	app.post('/article/delete/:id', User.loginRequired, Blog.delete);
	app.post('/article/recommend/:id', Blog.recommend);
	app.post('/article/collect/:id', Blog.collect);

	// Comments
	app.post('/article/comment/:id?', Comment.create);
	app.post('/article/reply/:id?', Comment.reply);
	app.post('/comment/delete/:comment_id', Comment.delete);
}