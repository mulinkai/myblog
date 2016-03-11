var blogDao = require('../dao/blogDao');

exports.index = function (req, res, next) {
	blogDao.findAll(function (blogs) {
		res.render('index',{ 'title': 'home', 'articles': blogs, 'count': blogs.length});
	});
}