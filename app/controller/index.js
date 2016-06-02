var helper = require('./helper');
var blogDao = require('../dao/blogDao');

exports.index = function (req, res, next) {
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
		blogDao.findHotBlog(7, function (hots) {
			res.render('index', { 
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
	/*if(req.params.page == undefined){
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
	}*/
}