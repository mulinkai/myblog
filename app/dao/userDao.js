var connetor = require('./connection');
var connection = connetor.connection || connetor.createConnection();

//新建用户
exports.create = function (user_name, email, password, handle){
	var sql = "INSERT INTO user set ?";
	connection.query(sql, { user_name: user_name, email: email, password: password, signup_time: new Date() }, function (err, result) {
		if(err) throw err;
		handle();
	});
}

//验证用户名密码
exports.login = function (email, pass, handle) {
	var sql = "SELECT user_id,user_name FROM USER WHERE email = ? && password = ?";
	connection.query(sql,[email,pass],function (err, result){
		if(err) throw err;
		handle(result[0]);
	});
}