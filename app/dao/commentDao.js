var connetor = require('./connection');
var connection = connetor.connection || connetor.createConnection();

exports.create = function (comment, handle) {
	var sql = "INSERT INTO COMMENT SET ?";
	connection.query(sql, comment, function (err, result) {
		if(err) throw err;
		handle(result.insertId);
	});
}

exports.findByArticle = function (article_id, handle) {
	var sql = "SELECT * FROM comment WHERE article_id = ?";
	connection.query(sql, [article_id], function (err, result) {
		if(err)	throw err;
		handle(result);
	});
}

exports.deleteByArticle = function (article_id) {
	var sql = "DELETE FROM comment WHERE article_id = ?";
	connection.query(sql, [article_id], function (err, result) {
		if(err)	throw err;
		if (result.affectedRows < 1) {
			console.log('该博客无评论需删除');
		} else{
			console.log('删除该博客所有评论');};
		});
}

exports.deleteById = function (comment_id, handle) {
	var sql = "SELECT article_id FROM comment WHERE comment_id = ? OR relative_comment = ?";
	connection.query(sql, [comment_id, comment_id], function (err, result) {
		var article_id = result[0].article_id;
		sql = "DELETE FROM comment WHERE comment_id = ? OR relative_comment = ?";
		connection.query(sql, [comment_id, comment_id], function (err, result) {
			if(err)	throw err;
			var counts = result.affectedRows;
			sql = "SELECT comments FROM article WHERE article_id = ?";
			connection.query(sql, [article_id], function (err, result) {
				if(err)	throw	err;
				sql = "UPDATE article SET ? WHERE article_id = ?";
				connection.query(sql, [{ comments: result[0].comments-counts }, article_id], function (err, result) {
					if(err)	throw err;
				});
			});
			handle(article_id);
		});
	});
}