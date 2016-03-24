var connetor = require('./connection');
var connection = connetor.connection || connetor.createConnection();

exports.create = function (article_id, user_id, handle) {
	var sql = 'INSERT INTO collection SET ?';
	connection.query(sql, [{article_id: article_id, user_id: user_id}], function (err, result) {
		if(err)	throw err;
		handle();
	});
}
exports.delete = function (id, handle) {
	var sql = 'DELETE FROM collection WHERE collection_id = ?';
	connection.query(sql, [id], function (err, result) {
		if(err)	throw err;
		handle();
	});
}

exports.find = function (article_id, user_id, handle) {
	var sql = 'SELECT collection_id FROM collection WHERE article_id = ? AND user_id = ?';
	connection.query(sql, [article_id, user_id], function (err, result) {
		if(err)	throw err;
		if(result.length > 0)
			handle(result[0].collection_id);
		else
			handle(-1);
	});
}