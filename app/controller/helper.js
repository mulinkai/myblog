module.exports = {
	dateFormat: function(arg) {
		var date = new Date(arg),
			now = new Date(),
			monites = Math.ceil((now.getTime()-date.getTime())/(1000*60));
		if(monites < 60)
			return monites + '分钟前';
		if(monites < 60*24)
			return Math.floor(monites/60) + '小时前';
		if(monites < 60*24*2)
			return '昨天';
		if(monites < 60*24*3)
			return '两天前';
		if(monites < 60*24*4)
			return '三天前';
		return (date.getMonth()+1) + '月' + date.getDate() + '日';
	},

	/*getArticleById: function (db, articleId, res) {
		// query article
		var date = new Date(dateString);
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	}*/
}