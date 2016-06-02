var connetor = require('./connection');
var connection = connetor.connection || connetor.createConnection();

//验证用户名是否可用
exports.validateUsername = function (user_name, handle) {
	var sql = "SELECT user_id FROM user WHERE user_name = ?"
	connection.query(sql, [user_name], function (err, result) {
		if (err) throw err;
		handle(result);
	});
}

//新建用户
exports.create = function (user_name, email, password, handle) {
	var sql = "INSERT INTO user set ?";
	connection.query(sql, { 'user_name': user_name, 'email': email, password: password, signup_time: new Date() }, function (err, result) {
		if(err) throw err;
		handle();
	});
}

//验证用户名密码
exports.login = function (user_name, pass, handle) {
	var sql = "SELECT user_id,user_name,email,role FROM USER WHERE user_name = ? && password = ?";
	connection.query(sql,[user_name,pass],function (err, result){
		if(err) throw err;
		handle(result[0]);
	});
}

//查询用户注册时间
exports.queryOld = function (user_id, handle) {
	var sql = "SELECT signup_time FROM user WHERE user_id = ?";
	connection.query(sql, [user_id], function (err, result) {
		if (err) throw err;
		handle(result[0].signup_time);
	});
};

//更新用户密码
exports.updatePass = function (user_name, newPass, handle) {
	var sql = "UPDATE user SET ? WHERE user_name = ?";
	connection.query(sql, [{password: newPass}, user_name], function (err, result) {
		if(err)	throw err;
		handle(result);
	});
};

//查询所有用户
exports.findAllUser = function (handle) {
	var sql = "SELECT * FROM user WHERE role = 0";
	connection.query(sql, [], function (err, result) {
		if(err)	throw er;
		handle(result);
	});
};

//删除用户
exports.deleteById = function(user_id, handle) {
	var sql = 'DELETE FROM user WHERE user_id = ?';
	connection.query(sql, [user_id], function (err, result) {
		if(err)	throw err;
		handle(true);
	});
};