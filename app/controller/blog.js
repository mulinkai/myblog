var blogDao = require('../dao/blogDao');

//发表文章
exports.create = function (req, res, next) {
	var title = req.body.title,
		content = req.body.content,
		author = req.session.user_name;
		blogDao.create(title, content, author, function (id){
			res.redirect('/article/' + id);
		});
}

exports.showCreate = function (req, res, next) {
	res.render('article_create', { title: 'article_create', operation: '发表博客', isEdit: false });
}