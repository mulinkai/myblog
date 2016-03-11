var userDao = require('../dao/userDao');

exports.showSignup = function (req, res, next) {
	res.render('signup',{title: 'signup'});
}

exports.signup = function (req, res, next) {
	var user_name = req.body.user_name;
	var email = req.body.email;
	var password = req.body.password;

	userDao.create(user_name, email, password, function () {
		res.redirect('/login');
		console.log('注册成功！');
	});
}

exports.showLogin = function (req, res, next) {
	res.render('login',{title: 'login'});
}

exports.login = function (req, res, next) {
	var email = req.body.email;
	var pass = req.body.password;
	userDao.login(email, pass, function (user) {
		if (user) {
			req.session.user = user;
			req.session.token = true;
			res.redirect('/');
			var date = new Date();
			console.log(user.user_name + ' 登录成功：' + date);
		} else{
			res.render('login', { title: 'login' });
			console.log('登录失败！');
		};
	});
}

exports.logout = function (req, res, next) {
	req.session.user = {};
	req.session.token = false;
	res.redirect('/');
}

exports.loginRequired = function (req, res, next) {
	if(!req.session.user)
		return res.redirect('/login');
	next();
}