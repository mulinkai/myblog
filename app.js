var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var mysql = require('mysql');
var whitelist = require('./whitelist');
console.log(whitelist)

var connection = mysql.createConnection ({
	host : 'localhost',
	user : 'root',
	password : '123456',
	database : 'myblog'
});

var app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//使用express-session中间件
app.use(session({
	resave: false,
	saveUninitialized: true,
    secret: 'secret',
    cookie:{
      maxAge: 1000*60*30
    }
}));

// check login
app.use(function (req,res,next) {
	var token = req.session.token;
	//console.log(req.session);
  	if(token) {
    	// 已登录
    	res.locals.user_name = req.session.user_name;
    	res.locals.isLogin = true;
    	next();
  	} else {
    	// 未登录
    	res.locals.isLogin = false;
    	next();
  	}
});

//使用body-parser中间件
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//首页
app.get('/',function (req,res,next) {

	var sql = "SELECT article_id,title,content FROM article LIMIT 0,10";
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
	/*if (email == req.session.email && password == req.session.password) {
		req.session.token = true;
		res.redirect('/');
	} else {
		res.render('login', { title: 'login' });
	}*/

	
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
		console.log('注册成功！')
	});
	res.redirect('/login');
	//res.render('login', { title: 'login' });
});

//登出
app.get('/logout',function (req, res) {
	req.session.token = false;
	res.redirect('/');
});

//发表文章
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
app.get('/article/:id?', function (req, res) {
	var sql = "SELECT * FROM ARTICLE WHERE ARTICLE_ID=" + req.params.id;
	connection.query( sql, { }, function (err, result) {
		if (err) throw err;
		res.locals.article = result[0];
		if (result[0].author == req.session.user_name)
			res.locals.isSelf = true;
		else
			res.locals.isSelf = false;
		res.render('article_detail', { title: 'article_detail' });
	});
});

//删除博客
app.get('/article/delete/:id?', function (req, res) {
	var sql = "delete from article where article_id=" + req.params.id;
	connection.query(sql, { }, function (err) {
		if (err)	throw err;
		console.log('删除成功');
		res.redirect('/');
	});
});

//修改博客
app.get('/article/edit/:id?', function (req, res) {
	//需判断登录否以及当前用户和文章作者一致否
	//
	//
	//
	//

	var sql = "SELECT * FROM ARTICLE WHERE ARTICLE_ID=" + req.params.id;
	connection.query( sql, { }, function (err, result) {
		if (err) throw err;
		res.locals.article = result[0];
		res.render('article_edit', { title: 'article_edit',operation: '修改博客' });
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

/*function findArticleById (id){
	var sql = "SELECT TITLE,AUTHOR,PUBLISH_TIME,CONTENT FROM ARTICLE WHERE ARTICLE_ID=" + id;
	connection.query(sql, { }, function (err, result) {
		if (err) throw err;
		console.log(result);
		return result;
	});
}*/

module.exports = app;

//启动程序
var server = http.createServer(app);
server.listen(3000, function (err) {
	console.log(' - Server start at *:3000');
});

connection.connect(function (err) {
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
	console.log('connected as id ' + connection.threadId);
});