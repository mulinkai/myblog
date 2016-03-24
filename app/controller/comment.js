var commentDao = require('../dao/commentDao');
var blogDao = require('../dao/blogDao');
var helper = require('./helper');

//发表评论
exports.create = function (req, res, next) {
	var token = req.session.token;
	if (token) {
		var comment = {
			'article_id': req.params.id,
			'comment_text': req.body.comment_text,
			'comment_author': req.session.user.user_name,
			'comment_time': new Date(req.body.comment_time)
		}
		commentDao.create(comment, function (comment_id) {
			console.log('评论成功');
			blogDao.findById(comment.article_id, function (article) {
				blogDao.addCommentCounts(comment.article_id, article.comments);
			});
			comment.comment_time = helper.dateFormat(comment.comment_time);
			comment.comment_id = comment_id;
			res.send(comment);
		});
	} else{
		res.send("请先登录,再进行评论");
	}
}

//回复评论
exports.reply = function (req, res, next) {
	var token = req.session.token;
	if (token) {
		var comment = {
			'article_id': req.params.id,
			'comment_text': req.body.comment_text,
			'comment_author': req.session.user.user_name,
			'comment_time': new Date(req.body.comment_time),
			'reply_author': req.body.reply_author,
			'relative_comment': req.body.relative_comment
		}
		commentDao.create(comment, function (comment_id) {
			console.log('回复成功');
			blogDao.findById(comment.article_id, function (article) {
				blogDao.addCommentCounts(comment.article_id, article.comments);
			});
			comment.comment_time = helper.dateFormat(comment.comment_time);
			comment.comment_id = comment_id;
			res.send(comment);
		});
	} else{
		res.send('请先登录，再进行评论');
	}
}

//删除评论和回复
exports.delete = function (req, res, next){
	var comment_id = req.params.comment_id;
	commentDao.deleteById(comment_id, function (id) {
		console.log('删除评论成功');
		var url = '/article/' + id;
		res.redirect(url);
	});
}