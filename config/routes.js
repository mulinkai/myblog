module.exports = function (app) {

	var bodyParser = require('body-parser');
	var session = require('express-session');
	var connetor = require('../app/dao/connection');
	var connection = connetor.connection || connetor.createConnection();

	var Blog = require('../app/controller/blog');
	var User = require('../app/controller/user');
	var Index = require('../app/controller/index');
	//使用express-session中间件
	app.use(session({
		resave: false,
		saveUninitialized: true,
	    secret: 'secret',
	    cookie:{
	      maxAge: 1000*60*30
	    }
	}));

	//使用body-parser中间件
	app.use(bodyParser.urlencoded({ extended: false }));

	// check login
	app.use(function (req,res,next) {
		var token = req.session.token;
	  	if(token) {
	    	// 已登录
	    	res.locals.user = req.session.user;
	    	res.locals.isLogin = true;
	    	next();
	  	} else {
	    	// 未登录
	    	res.locals.user = {};
	    	res.locals.isLogin = false;
	    	next();
	  	}
	});

	// index
	app.get('/', Index.index);


	// USer
	app.get('/login', User.showLogin);
	app.post('/login', User.login);
	app.get('/signup', User.showSignup);
	app.post('/signup', User.signup);
	app.get('/logout', User.logout);


	// Blog
	app.get('/article/create', User.loginRequired, Blog.showCreate);
	app.post('/article/create', Blog.create);

	//阅读博客
	app.get('/article/:id', function (req, res) {
		var sql = "SELECT * FROM ARTICLE WHERE ARTICLE_ID=" + req.params.id;
		connection.query( sql, { }, function (err, result) {
			if (err) throw err;
			if (!result[0]) return res.send('page not found.');
			res.locals.article = result[0];
			if (result[0].author === req.session.user_name)
				res.locals.isSelf = true;
			else
				res.locals.isSelf = false;
			sql = "SELECT * FROM comment WHERE article_id = " + req.params.id;
			connection.query(sql, {}, function (err, result) {
				if (err) throw err;

				var comments = new Array();
				var length = result.length;
				for (var i = 0; i < length; i++) {
					var comment = result[i];
					if (!comment.relative_comment) {
						var commentObj = {};
						commentObj.commentHead = comment;
						commentObj.commentArray = new Array;
						for (var j = i+1; j < length; j++) {
							if (result[j].relative_comment == comment.comment_id) {
								commentObj.commentArray.push(result[j]);
							}	
						}
						comments.push(commentObj);
					}
				}
				res.locals.comments = comments;
				res.render('article_detail', { title: 'article_detail' });
			});
		});
	});

	//删除博客
	app.get('/article/delete/:id', function (req, res) {

		var sql = "SELECT author FROM article WHERE article_id = " + req.params.id;
		var username = req.session.user_name;
		connection.query(sql, { }, function (err, result) {
			if(err) throw err;
			if(username === result[0].author) {
				sql = "delete from article where article_id=" + req.params.id;
				connection.query(sql, { }, function (err) {
					if (err)	throw err;
					console.log('删除成功');
					res.redirect('/');
				});
			} else if(username){
				res.redirect("/");
			} else {
				res.redirect('/login');
			}
		});
	});

	//修改博客
	app.get('/article/edit/:id', function (req, res) {
		var sql = "SELECT author FROM article WHERE article_id = " + req.params.id;
		var username = req.session.user_name;
		connection.query(sql, { }, function (err, result) {
			if(err) throw err;
			if(username === result[0].author) {
				sql = "SELECT * FROM ARTICLE WHERE ARTICLE_ID=" + req.params.id;
				connection.query( sql, { }, function (err, result) {
					if (err) throw err;
					res.locals.article = result[0];
					res.render('article_edit', { title: 'article_edit',operation: '修改博客' });
				});
			} else if(username){
				res.redirect("/");
			} else {
				res.redirect('/login');
			}
		});
	});
	app.post('/article/edit/:id?', function (req, res) {
		var title = req.body.title;
		var content = req.body.content;
		var sql = "UPDATE article SET ? WHERE article_id=" +req.params.id;

		connection.query(sql, { title: title, content: content }, function (err, result) {
			if(err) throw err;
			console.log("修改成功");
			var url = '/article/' + req.params.id;
			res.redirect(url);
		});

	});

	// Comments
	//对博客发表评论
	app.post('/article/comment/:id?', function (req, res) {
		var token = req.session.token;
		if (token) {
			var article_id = req.params.id,
				comment_text = req.body.comment_text,
				comment_author = req.session.user_name,
				comment_time = new Date();
			var sql = "INSERT INTO COMMENT SET ?";
			connection.query(sql, { 'article_id': article_id, 'comment_text': comment_text, 'comment_author': comment_author, 'comment_time': comment_time }, function (err , result) {
				if(err)	throw err;
				console.log('评论成功');
				var comment = {
					comment_author: comment_author,
					comment_text: comment_text,
					comment_time: comment_time,
					comment_id: result.insertId,
					reply_author: comment_author
				};
				res.send(comment);
			});
		} else{
			res.send("请先登录,再进行评论");
		}
		
	});

	//回复评论
	app.post('/article/reply/:id?', function (req, res) {
		var token = req.session.token;
		if (token) {
			var article_id = req.params.id,
				comment_text = req.body.comment_text,
				comment_author = req.session.user_name,
				comment_time = req.body.comment_time,
				reply_author = req.body.reply_author,
				relative_comment = req.body.relative_comment;
				var comment_time = new Date();
			var sql = "INSERT INTO COMMENT SET ?";
			connection.query(sql, { article_id: article_id, comment_text: comment_text, comment_author: comment_author, comment_time: comment_time, reply_author: reply_author, relative_comment:relative_comment }, function (err , result) {
				if(err)	throw err;
				console.log('评论成功');
				res.send( { 'comment_id': result.insertId } );
			});
		} else{
			res.send('请先登录，再进行评论');
		}
		
	});

	//删除回复
	app.post('/comment/delete/:lot?', function (req, res) {
		deleteComments(req.body.comment_id, req.params.lot,res);
	});

	function deleteComments (comment_id, count, res) {
		var sql = "delete from comment where comment_id=" + comment_id;
		connection.query(sql, {}, function (err, result) {
			if(err)	throw err;
			if(count) {
				sql = "delete from comment where relative_comment=" + comment_id;
				connection.query(sql, function (err, result) {
					if (err) throw err;
					console.log('删除回复成功');
					res.send(true);
				});
			} else {
				console.log('删除回复成功');	
				res.send(true);
			}
		});
	}
}