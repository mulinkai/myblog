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

exports.findAll = function (orderBy, keyword, handle) {
	orderBy = (orderBy == 'latest') ? 'publish_time' : 'visited';
	var sql ='',
		options = [];
	if(keyword == undefined || !keyword) {
		sql = "SELECT * FROM article ORDER BY " + orderBy + " DESC";
	}
	else {
		sql = "SELECT * FROM article WHERE title LIKE ? OR author = ? ORDER BY " + orderBy + " DESC";
		options.push('%' + keyword + '%');
		options.push(keyword);
	}
	connection.query(sql, options, function (err, result){
		if (err) throw err;
		handle(result);
	});

};

exports.findCollection = function (user_id, handle) {
	var sql;
	sql = "SELECT article_id FROM collection WHERE user_id = ?";
	connection.query(sql, [user_id], function (err, result) {
		if(err)	throw err;
		var blogs = [],
			length = result.length,
			t = length;
		if(!length)
			handle(blogs);
		while(length){
			var article_id = result[length-1].article_id
			length--;
			sql = 'SELECT * FROM article WHERE article_id = ?';
			connection.query(sql, [article_id], function (err, result) {
				if(err)	throw err;
				blogs.push(result[0]);
				t--;
				if(t === 0) {
					handle(blogs);
				}
			});
		}
	});
}

exports.search = function (keyword, handle) {
	var sql = 'SELECT * FROM article WHERE title LIKE ? OR author = ? ORDER BY publish_time DESC';
	connection.query(sql, ['%' + keyword + '%', keyword], function (err, result) {
		if(err)	throw err;
		handle(result);
	});
}

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

exports.findHotBlog = function (length, handle) {
	var sql = "SELECT title,article_id FROM article ORDER BY recommend DESC LIMIT 0,?";
	connection.query(sql, [length], function (err, result){
		if (err) throw err;
		handle(result);
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

exports.queryAccount = function (user_id, handle) {
	var sql = "SELECT user_name FROM user WHERE user_id = ?";
	connection.query(sql, [user_id], function (err, result) {
		var user_name = result[0].user_name;
		sql = "SELECT article_id FROM article WHERE  author= ?";
		connection.query(sql, [user_name], function (err, result) {
			if(err)	throw err;
			handle(result.length);
		});
	});
};