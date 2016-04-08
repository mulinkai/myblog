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
		return date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
	},
	oldFormat: function(old) {
		var start = new Date(old).getTime(),
			end = new Date().getTime(),
			days = Math.floor((end-start)/1000/60/60/24);
			return days + '天';
	}

	/*getArticleById: function (db, articleId, res) {
		// query article
		var date = new Date(dateString);
		return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	}*/
}