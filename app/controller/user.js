var userDao = require('../dao/userDao');
var blogDao = require('../dao/blogDao');
var collectDao = require('../dao/collectDao');
var helper = require('./helper');

//用户注册
/*exports.showSignup = function (req, res, next) {
	res.render('signup',{'title': 'signup', 'msg': ''});
}*/
exports.signup = function (req, res, next) {
	var user_name = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	if(!user_name || !email || !password) {
		res.send({ 
			'status': 0,
			'msg': '输入不能为空'
		});
	}else if(req.body.captcha != req.session.captcha) {
		res.send({ 
			'status': 4,
			'msg': '验证码错误'
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
/*exports.showLogin = function (req, res, next) {
	res.render('login',{title: 'login'});
}*/

exports.login = function (req, res, next) {
	var user_name = req.body.username;
	var pass = req.body.password;
	if(req.body.captcha != req.session.captcha) {
		res.send({ 
			'status': 4,
			'msg': '验证码错误'
		});
	}else {
		userDao.login(user_name, pass, function (user) {
			if (user) {
				req.session.user = user;
				req.session.token = true;
				res.send({ 
					'status': 2,
					'msg': '登录成功'
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
};

//查询用户信息
exports.queryInfo = function (req, res, next) {
	var user_id = req.query.id,
		info = {},
		myres = res;
		/*console.log(111);
		res.send({old: 32});*/
	Promise.all([queryOld(user_id, info), queryAccount(user_id, info), queryCollectionAccout(user_id, info)]).then(function (res) {
		myres.send(info);
	});
};

//查询用户注册时间
function queryOld (user_id, info) {
	return new Promise(function(resolve, reject) {
		userDao.queryOld(user_id, function (old) {
			info.old = helper.oldFormat(old);
			resolve(1);
		});
	});
}

//查询用户发表文章数
function queryAccount (user_id, info) {
	return new Promise(function(resolve, reject) {
		blogDao.queryAccount(user_id, function (account) {
			info.account = account;
			resolve(2);
		});
	});
}

//查询用户收藏文章数
function queryCollectionAccout (user_id, info) {
	return new Promise(function(resolve, reject) {
		collectDao.queryCollectionAccout(user_id, function (account) {
			info.collection = account;
			resolve(3);
		});
	});
}

//登录检测
exports.loginRequired = function (req, res, next) {
	if(!req.session.user)
		return res.redirect('/');
	next();
};