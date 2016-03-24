var helper = require('./helper');
var blogDao = require('../dao/blogDao');
var commentDao = require('../dao/commentDao');

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
}

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
	};
}

//阅读博客
exports.showBlog = function (req, res, next) {
	var article_id = req.params.id;
	blogDao.findById(article_id, function (article) {
		if (!article) {
			res.redirect('/');
		} else{
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

exports.recommend = function (req, res, next) {
	if (req.session.user) {
		var article_id = req.params.id;
		blogDao.findById(article_id, function (article) {
			blogDao.recommend(article_id, article.recommend, function () {
				console.log('推荐文章成功');
				res.send(true);
			});
		});
	} else {
		res.send(false);
	}
}