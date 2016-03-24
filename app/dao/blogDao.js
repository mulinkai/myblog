var connetor = require('./connection');
var connection = connetor.connection || connetor.createConnection();

exports.create = function (title, content, author, handle){
	var sql = "INSERT INTO ARTICLE SET ?";
	connection.query(sql, {
		title: title, 
		author: author, 
		content: content, 
		publish_time: new Date(), 
		recommend: 0,
		visited: 0,
		comments: 0
	}, function (err, result) {
		if(err) throw err;
		console.log("发表成功");
		handle(result.insertId);
	});
}

exports.findAll = function (handle) {
	var sql = "SELECT * FROM article ORDER BY publish_time DESC LIMIT 0,30 ";
	connection.query(sql, function (err, result){
		if (err) throw err;
		handle(result);
	});
};

exports.findById = function (article_id, handle){
	var sql = "SELECT * FROM article WHERE article_id = ?";
	connection.query(sql, [article_id], function (err, result) {
		if(err)	throw err;
		if (result.length < 1) {
			handle(false);
		} else{
			handle(result[0]);
		};
	});
}

exports.validateAuthor = function (username, article_id, handle) {
	var sql = "SELECT author FROM article WHERE article_id = ?";
	connection.query(sql, [article_id], function (err, result) {
		if(err)	throw err;
		if(result.length > 0 && result[0].author == username)
			handle(true);
		else
			handle(false);
	});
}

exports.deleteById = function (article_id, handle) {
	var sql = "DELETE FROM article WHERE article_id = ?";
	connection.query(sql, [article_id], function (err, result) {
		if(err)	throw err;
		handle();
	});
}

exports.update = function (article_id, title, content, handle) {
	var sql = "UPDATE article SET ? WHERE article_id = ?";
	connection.query(sql, [ {title: title, content: content}, article_id ], function (err, result) {
		if(err)	throw err;
		handle();
	});
}

exports.search = function (keyword, handle) {
	var sql = 'SELECT * FROM article WHERE title LIKE ? OR author = ?';
	connection.query(sql, ['%' + keyword + '%', keyword], function (err, result) {
		if(err)	throw err;
		handle(result);
	});
}

exports.recommend = function (article_id, recommend, handle) {
	var sql = "UPDATE article SET ? WHERE article_id = ?";
	recommend = recommend + 1;
	connection.query(sql, [{recommend: recommend}, article_id], function (err, result) {
		if(err) throw err;
		handle();
	});
}

exports.addVisitedCounts = function (article_id, visited) {
	var sql = "UPDATE article SET ? WHERE article_id = ?";
	connection.query(sql, [ {visited: visited+1}, article_id ], function (err, result) {
		if(err)	throw err;
	});
}

exports.addCommentCounts = function (article_id, comments) {
	var sql = "UPDATE article SET ? WHERE article_id = ?";
	connection.query(sql, [ {comments: comments+1}, article_id ], function (err, result) {
		if(err)	throw err;
	});
}