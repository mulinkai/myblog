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
				if(user.role == 0) {
					res.send({ 
						'status': 2,
						'msg': '登录成功'
					});
				}else if(user.role == 1) {
					res.send({
						status: 5,
						msg: '管理员登陆成功'
					});
				}
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
	Promise.all([queryOld(user_id, info),
		queryAccount(user_id, info),
		queryCollectionAccout(user_id, info)]).then(function (res) {
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

//修改密码页面
exports.managePass = function (req, res, next) {
	res.render('managePass', {
		title:　"修改密码"
	});
};

//通过旧密码修改密码
exports.changePass = function (req, res, next) {
	var oldPass = req.body.oldPass,
		newPass = req.body.newPass,
		user_name = req.session.user.user_name;
	if(!oldPass || !newPass)
		res.send({
			status: 0,
			msg: '输入不能为空'
		});
	else
		userDao.login(user_name, oldPass, function (user) {
			if (user) {
				userDao.updatePass(user_name, newPass, function (data) {
					if(data.message) {
						req.session.user = '';
						req.session.token = false;
						res.send({
							status: 1,
							msg: '修改密码成功，请重新登录'
						});
					}
				});
			} else{
				res.send({ 
					'status': 0,
					'msg': '旧密码不正确'
				});
			};
		});
}

//通过绑定邮箱修改密码
exports.changePassByEmail = function (req, res, next) {
	console.log('123');
	var captcha = req.body.emailCaptcha,
		newPass = req.body.newPass,
		user_name = req.session.user.user_name;
	if(!captcha || !newPass) {
		res.send({
			status: 0,
			msg: '输入不能为空'
		});
	}else if(captcha == req.session.emailCaptcha){
		userDao.updatePass(user_name, newPass, function (data) {
					if(data.message) {
						req.session.user = '';
						req.session.token = false;
						res.send({
							status: 1,
							msg: '修改密码成功，请重新登录'
						});
					}
				});
	}else {
		res.send({
			status: 0,
			msg: '邮箱验证码错误'
		});
	}
};

//查询所有用户
exports.findAllUser = function (req, res, next) {
	if(req.session.user.role != 1){
		res.redirect('/');
	}else {
		userDao.findAllUser(function (users) {
			users.forEach(function (user) {
				var date = new Date(user.signup_time);
				user.signup_time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
			});
			res.render('manageUser', {
				title: '管理用户',
				users: users
			});
		});
	}
};

//删除用户
exports.deleteById = function (req, res, next) {
	var user_id = req.params.user_id;
	userDao.deleteById(user_id, function (status) {
		if(status)
			res.redirect('/manage');
	});
};