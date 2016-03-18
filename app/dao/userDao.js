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
exports.create = function (user_name, email, password, handle){
	var sql = "INSERT INTO user set ?";
	connection.query(sql, { 'user_name': user_name, 'email': email, password: password, signup_time: new Date() }, function (err, result) {
		if(err) throw err;
		handle();
	});
}

//验证用户名密码
exports.login = function (user_name, pass, handle) {
	var sql = "SELECT user_id,user_name FROM USER WHERE user_name = ? && password = ?";
	connection.query(sql,[user_name,pass],function (err, result){
		if(err) throw err;
		handle(result[0]);
	});
}