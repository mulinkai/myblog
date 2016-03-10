module.exports = {
	getArticleById: function (db, articleId, res) {
		// query article
		var date = new Date(dateString);
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	}
}