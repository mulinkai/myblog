var connetor = require('./connection');
var connection = connetor.connection || connetor.createConnection();

exports.create = function (title, content, author, handle){
	var sql = "INSERT INTO ARTICLE SET ?";
	connection.query(sql, { title: title, author: author, content: content, publish_time: new Date() }, function (err, result) {
		if(err) throw err;
		console.log("发表成功");
		handle(result.insertId);
	});
}

exports.findAll = function (handle) {
	var sql = "SELECT * FROM article LIMIT 0,20";
	connection.query(sql, function (err, result){
		if (err) throw err;
		handle(result);
	});
};