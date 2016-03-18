var helper = require('./helper');
var blogDao = require('../dao/blogDao');
var commentDao = require('../dao/commentDao');

//发表博客
exports.showCreate = function (req, res, next) {
	res.render('article_create', { title: 'article_create', operation: '发表博客', isEdit: false });
}

exports.create = function (req, res, next) {
	var title = req.body.title,
		content = req.body.content,
		author = req.session.user.user_name;
		content = content.replace(/\n/g, '<br>');
		blogDao.create(title, content, author, function (id){
			res.redirect('/article/' + id);
		});
}

//阅读博客
exports.showBlog = function (req, res, next) {
	var article_id = req.params.id;
	blogDao.findById(article_id, function (article) {
		if (!article) {
			res.redirect('/');
		} else{
			var data = {};
			data.article = article;
			data.isSelf = req.session.user? article.author == req.session.user.user_name : false;
			commentDao.findByArticle(article.article_id, function (result){
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
				data.comments = comments;
				res.render('article_detail', {'title': article.title, 'data': data});
			});
		};
	});

}

//删除博客
exports.delete = function (req, res, next) {
	var article_id = req.params.id;
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

//修改博客
exports.showUpdate = function (req, res, next) {
	var article_id = req.params.id;
	blogDao.validateAuthor(req.session.user.user_name, article_id, function (status){
		if (status) {
			blogDao.findById(article_id, function (article) {
				res.render('article_edit', {
					'title': 'article_edit',
					'operation': '修改博客',
					'article': article
				});
			});
		} else{
			res.redirect('/');
		};
	});
}
exports.update = function (req, res, next) {
	var article_id = req.params.id,
		title = req.body.title,
		content = req.body.content;
	blogDao.update(article_id, title, content, function () {
		console.log("修改成功");
		var url = '/article/' + article_id;
		res.redirect(url);
	});
}

//通过标题或作者查询博客
exports.search = function (req, res, next) {
	var keyword = req.body.keyword;
	blogDao.search(keyword, function (blogs) {
		blogs.forEach(function (blog) {
			if(blog.content.length > 200)
				blog.content = blog.content.substr(0, 198) + '...';
			blog.publish_time = helper.dateFormat(blog.publish_time);
		});
		res.render('index',{ 'title': 'serch', 'articles': blogs, 'count': blogs.length});
	});
}