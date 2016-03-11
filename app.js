var http = require('http');
var express = require('express');
/*var bodyParser = require('body-parser');
var session = require('express-session');*/
// var mysql = require('mysql');
// var whitelist = require('./whitelist');
// console.log(whitelist);

/*var connection = mysql.createConnection ({
	host : 'localhost',
	user : 'root',
	password : '123456',
	database : 'myblog'
});*/

var app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/app/views');

app.use('/public', express.static(__dirname + '/static'));

/*//使用express-session中间件
app.use(session({
	resave: false,
	saveUninitialized: true,
    secret: 'secret',
    cookie:{
      maxAge: 1000*60*30
    }
}));*/

/*// check login
app.use(function (req,res,next) {
	var token = req.session.token;
  	if(token) {
    	// 已登录
    	res.locals.user_name = req.session.user_name;
    	res.locals.isLogin = true;
    	next();
  	} else {
    	// 未登录
    	res.locals.user_name = '';
    	res.locals.isLogin = false;
    	next();
  	}
});*/

require('./config/routes')(app);

/*//使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }));*/

/*//首页
app.get('/',function (req,res,next) {

	var sql = "SELECT article_id,title,content FROM article LIMIT 0,20";
			connection.query(sql, function (err, result){
				if (result) {
					var i;
					for (i = 0; i < result.length; i++){
						result[i].content = result[i].content.slice(0,200);
					}
					res.locals.articles = result;
					res.locals.count = result.length;
				} else {
					res.locals.count = 0;
				}
				res.render('index',{title: 'home'});
			});
});

//登录
app.get('/login',function (req,res)  {
	res.render('login',{title: 'login'});
});
app.post('/login',function (req,res) {
	var email = req.body.email;
	var pass = req.body.password;

	var sql = "SELECT user_id,user_name FROM USER WHERE email = ? && password = ?";
	connection.query(sql,[email,pass],function (err, result){
		if(err) throw err;
		result = result[0];
		if(result){
			req.session.user_name = result.user_name;
			req.session.token = result.user_id;

			res.redirect('/');
			console.log('登陆成功！');
		}else{
			res.render('login', { title: 'login' });
			console.log('登录失败！');
		}
	});
});

//注册
app.get('/signup',function (req,res) {
	res.render('signup', { title: 'signup' });
});
app.post('/signup',function (req,res) {
	var user_name = req.body.user_name;
	var email = req.body.email;
	var password = req.body.password;

	var sql = "INSERT INTO user set ?";
	connection.query(sql, { user_name: user_name, email: email, password: password, signup_time: new Date() }, function (err, result) {
		if(err) throw err;
		console.log('注册成功！');
	});
	res.redirect('/login');
	//res.render('login', { title: 'login' });
});

//登出
app.get('/logout',function (req, res) {
	req.session.user_name = "";
	req.session.token = false;
	res.redirect('/');
});

//发表博客
app.get('/article/create', function (req, res) {
	if (req.session.user_name)
		res.render('article_create', { title: 'article_create', operation: '发表博客', isEdit: false });
	else 
		res.redirect('/login');
});
app.post('/article/create', function (req, res) {
	var title = req.body.title;
	var content = req.body.content;
	var author = req.session.user_name;

	var sql = "INSERT INTO ARTICLE SET ?";
	connection.query(sql, { title: title, author: author, content: content, publish_time: new Date() }, function (err, result) {
		if(err) throw err;
		console.log("发表成功");
		res.redirect('/article/'+result.insertId);
	});
});

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
}*/

module.exports = app;

//启动程序
var server = http.createServer(app);
server.listen(3000, function (err) {
	console.log(' - Server start at *:3000');
});

/*connection.connect(function (err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
	console.log('connected as id ' + connection.threadId);
});*/