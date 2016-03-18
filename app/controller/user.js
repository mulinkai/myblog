var userDao = require('../dao/userDao');

//用户注册
exports.showSignup = function (req, res, next) {
	res.render('signup',{'title': 'signup', 'msg': ''});
}
exports.signup = function (req, res, next) {
	var user_name = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	if(!user_name || !email || !password) {
		res.send({ 
			'status': 0,
			'msg': '输入不能为空'
		});
	}else {
		userDao.validateUsername(user_name, function (result) {
			if(result.length > 0) {
				res.send({ 
					'status': 0,
					'msg': '用户名已存在'
				 });
			}else {
				userDao.create(user_name, email, password, function () {
					res.send({ 
						'status': 1,
						'msg': '注册成功'
					});
					console.log(user_name + '注册成功！');
				});
			}
		});
	}
}

//用户登录
exports.showLogin = function (req, res, next) {
	res.render('login',{title: 'login'});
}

exports.login = function (req, res, next) {
	var user_name = req.body.username;
	var pass = req.body.password;
	userDao.login(user_name, pass, function (user) {
		if (user) {
			req.session.user = user;
			req.session.token = true;
			res.send({ 
				'status': 2,
				'msg': '登录成功，等待跳转...'
			});
			var date = new Date();
			console.log(user.user_name + ' 登录成功：' + date);
		} else{
			res.send({ 
				'status': 0,
				'msg': '用户名或密码不正确'
			});
		};
	});
}

//用户登出
exports.logout = function (req, res, next) {
	if(req.session.user) {
		var username = req.session.user.user_name;
		req.session.user = '';
		req.session.token = false;
		console.log(username + ' 退出登录成功：' + new Date());
		res.redirect('/');
	} else {
		res.redirect('/');
	}
}

//登录检测
exports.loginRequired = function (req, res, next) {
	if(!req.session.user)
		return res.redirect('/login');
	next();
}