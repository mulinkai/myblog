var helper = require('./helper');
var blogDao = require('../dao/blogDao');

exports.index = function (req, res, next) {
	blogDao.findAll(function (blogs) {
		blogs.forEach(function (blog) {
			if(blog.content.length > 200)
				blog.content = blog.content.substr(0, 198) + '...';
			blog.publish_time = helper.dateFormat(blog.publish_time);
		});
		res.render('index',{ 'title': 'home', 'articles': blogs, 'count': blogs.length});
	});
}