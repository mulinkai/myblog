var commentDao = require('../dao/commentDao');

//发表评论
exports.create = function (req, res, next) {
	var token = req.session.token;
	if (token) {
		var comment = {
			'article_id': req.params.id,
			'comment_text': req.body.comment_text,
			'comment_author': req.session.user.user_name,
			'comment_time': new Date()
		}
		commentDao.create(comment, function () {
			console.log('评论成功');
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
		commentDao.create(comment, function () {
			console.log('回复成功');
			res.send(comment);
		});
	} else{
		res.send('请先登录，再进行评论');
	}
}

//删除评论和回复
exports.delete = function (req, res, next){
	var comment_id = req.body.comment_id,
		count = req.params.lot;
	commentDao.deleteById(comment_id, function () {
		console.log('删除评论成功');
		res.send(true);
	});
}