var helper = require('./helper');
var blogDao = require('../dao/blogDao');
var commentDao = require('../dao/commentDao');
var collectDao = require('../dao/collectDao');
var fs = require('fs');
var Busboy = require('busboy');

//发表博客
exports.showCreate = function (req, res, next) {
	if (!req.params.id) {
		res.render('article_create', { title: 'article_create', article: '' });
	} else{
		blogDao.findById(req.params.id, function (article) {
			if (!article) {
				res.redirect('/');
			} else{
				res.render('article_create', { title: 'article_edit', article: article });
			}
		});
	}
};

//发表博客
exports.create = function (req, res, next) {
	var article_id = req.params.id,
	 	title = req.body.title,
	 	content = req.body.content;
	if (article_id != undefined) {
		blogDao.update(article_id, title, content, function () {
			console.log("修改成功");
			var url = '/article/' + article_id;
			res.redirect(url);
		});
	} else{
		var author = req.session.user.user_name;
		blogDao.create(title, content, author, function (id){
			res.redirect('/article/' + id);
		});
	}

	/*var article_id = req.params.id,
		title = req.body.title,
		content = req.body.content;
	var busboy = new Busboy({ headers: req.headers });
	if (article_id != undefined) {
		blogDao.update(article_id, title, content, function () {
			console.log("修改成功");
			var url = '/article/' + article_id;
			res.redirect(url);
		});
	} else{
		var author = req.session.user.user_name;
		blogDao.create(title, content, author, function (id){
			busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
				var buffer = new Buffer('');
				file.on('data', function (data) {
					buffer = Buffer.concat([buffer, data]);
				});
				file.on('end', function () {
					var temp = filename.split('.'),
					path = '/static/images/blogs/' + id + '.' + temp[temp.length - 1];
					fs.writeFile(path, buffer, function (err) {
				  		if (err) return next(err);
				  		console.log('File successfully uploaded!');
					});
				});
			});
			req.pipe(busboy);
			res.redirect('/article/' + id);
		});
	};*/
};

exports.uploadCover = function (req, res, next) {
	var busboy = new Busboy({ headers: req.headers });
	busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
		var buffer = new Buffer('');
		file.on('data', function (data) {
			buffer = Buffer.concat([buffer, data]);
		});
		file.on('end', function () {
			var temp = filename.split('.'),
			path = '/static/images/blogs/' + id + '.' + temp[temp.length - 1];
			fs.writeFile(path, buffer, function (err) {
		  		if (err) return next(err);
		  		console.log('File successfully uploaded!');
			});
		});
	});
	req.pipe(busboy);
	res.send({
		msg: "success"
	});
}

//阅读博客
exports.showBlog = function (req, res, next) {
	var article_id = req.params.id;
	blogDao.findById(article_id, function (article) {
		if (!article) {
			res.redirect('/');
		} else{

			//增加文章浏览次数
			blogDao.addVisitedCounts(article_id, article.visited);

			var data = {};
			article.publish_time = helper.dateFormat(article.publish_time);
			data.article = article;
			data.isSelf = req.session.user? article.author == req.session.user.user_name : false;
			commentDao.findByArticle(article.article_id, function (result){
				var comments = new Array();
				var length = result.length;
				for (var i = 0; i < length; i++) {
					result[i].comment_time = helper.dateFormat(result[i].comment_time);
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
				data.comments = comments;
				if(req.session.user) {
					collectDao.find(article_id, req.session.user.user_id, function(id) {
						if (id != -1) {
							data.collect = true;
						} else{
							data.collect = false;
						};
						res.render('article_detail', {'title': article.title, 'data': data});
					});
				} else{
					res.render('article_detail', {'title': article.title, 'data': data});
				}
			});
		};
	});

}

//删除博客
exports.delete = function (req, res, next) {
	var article_id = req.params.id;
	if(req.session.user.role == 1) {
		blogDao.deleteById(article_id, function () {
			console.log('删除博客成功');
			res.redirect('/manageBlog');
		});
	}else {
		blogDao.validateAuthor(req.session.user.user_name, article_id, function (status){
			if (status) {
				blogDao.deleteById(article_id, function () {
					console.log('删除博客成功');
					res.redirect('/');
				});
				commentDao.deleteByArticle(article_id);
			} else{
				res.redirect('/');
			};
		});
	}
}
//查找博客
exports.search = function (req, res, next) {
	orderBy = req.query.orderBy || 'latest';
	if(req.params.page == undefined){
		blogDao.findAll(orderBy, function (blogs) {
			var counts = blogs.length;
			blogs = blogs.slice(0, 15);
			blogs.forEach(function (blog) {
				if(blog.content.length > 200)
					blog.content = blog.content.substr(0, 198) + '...';
				blog.publish_time = helper.dateFormat(blog.publish_time);
			});
			blogDao.findHotBlog(7, function (hots) {
				res.render('index',{ 
					'title': 'home', 
					'articles': blogs, 
					'counts': counts, 
					'index': 1, 
					'orderBy': orderBy,
					'hots': hots
				});
			});
		});
	} else {
		var index = req.params.page;
		blogDao.findAll(orderBy, function (blogs) {
			var counts = blogs.length;
			blogs = blogs.slice((index-1)*15, index*15);
			blogs.forEach(function (blog) {
				if(blog.content.length > 200)
					blog.content = blog.content.substr(0, 198) + '...';
				blog.publish_time = helper.dateFormat(blog.publish_time);
			});
			blogDao.findHotBlog(7, function (hots) {
				res.render('index',{ 
					'title': 'home', 
					'articles': blogs, 
					'counts': counts, 
					'index': index, 
					'orderBy': orderBy,
					'hots': hots
				});
			});
		});
	}

	
	var keyword = req.query.keyword;
	blogDao.search(keyword, function (blogs) {
		blogs.forEach(function (blog) {
			if(blog.content.length > 200)
				blog.content = blog.content.substr(0, 198) + '...';
			blog.publish_time = helper.dateFormat(blog.publish_time);
		});
		blogDao.findHotBlog(7, function (hots) {
			res.render('index',{ 
				'title': 'home', 
				'articles': blogs, 
				'counts': blogs.length,
				'hots': hots
			});
		});
	});
}

//推荐博客
exports.recommend = function (req, res, next) {
	var article_id = req.params.id;
	blogDao.findById(article_id, function (article) {
		blogDao.recommend(article_id, article.recommend, function () {
			console.log('推荐文章成功');
			res.send(true);
		});
	});

	//需要登录版本
	/*if (req.session.user) {
		var article_id = req.params.id;
		blogDao.findById(article_id, function (article) {
			blogDao.recommend(article_id, article.recommend, function () {
				console.log('推荐文章成功');
				res.send(true);
			});
		});
	} else {
		res.send(false);
	}*/
}
//收藏博客
exports.collect = function (req, res, next) {
	if (req.session.user) {
		var article_id = req.params.id,
			user_id = req.session.user.user_id;
		collectDao.find(article_id, user_id, function(id) {
			if (id != -1) {
				collectDao.delete(id, function (){
					console.log('取消收藏成功');
					res.send('2');
				});
			} else{
				collectDao.create(article_id, user_id, function (){
					console.log('添加收藏成功');
					res.send('1');
				})
			};
		});
	} else {
		res.send('0');
	}
}

//查看收藏
exports.collections = function (req, res, next) {
	var orderBy = req.query.orderBy || 'latest',
		keyword = req.query.keyword || '',
		index = req.params.page || 1;
	blogDao.findCollection(req.session.user.user_id, function (blogs) {
		var counts = blogs.length;
		blogs = blogs.slice((index-1)*15, index*15);
		blogs.forEach(function (blog) {
			if(blog.content.length > 200)
				blog.content = blog.content.substr(0, 198) + '...';
			blog.publish_time = helper.dateFormat(blog.publish_time);
		});
		blogDao.findHotBlog(7, function (hots) {
			res.render('index',{ 
				'title': 'home', 
				'articles': blogs, 
				'counts': counts, 
				'index': index, 
				'orderBy': orderBy,
				'hots': hots,
				'keyword': keyword
			});
		});
	});
};

//查询所有博客（用于管理员）
exports.findAllBlog = function (req, res, next) {
	if(req.session.user.role != 1) {
		res.redirect('/');
	}else {
		var orderBy = req.query.orderBy || 'latest',
			keyword = req.query.keyword || '',
			index = req.params.page || 1;
		blogDao.findAll(orderBy, keyword, function (blogs) {
			var counts = blogs.length;
			blogs = blogs.slice((index-1)*15, index*15);
			blogs.forEach(function (blog) {
				if(blog.content.length > 200)
					blog.content = blog.content.substr(0, 198) + '...';
				blog.publish_time = helper.dateFormat(blog.publish_time);
			});
			res.render('manageBlog', { 
				'title': '管理博客', 
				'blogs': blogs, 
				'counts': counts, 
				'index': index,
			});
		});
	}
}