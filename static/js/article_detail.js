$(document).ready(function () {
	$('#ope-collect[collected]').css('color', 'red')
		.children('i')
		.removeClass('icon-star-empty')
		.addClass('icon-star');
});

$('span[name="reply-btn"]').on('click', function () {
	if(loginRequired()) {
		var reply_author = $(this).attr('reply_author'),
			relative_comment = $(this).attr('relative_comment'),
			article_id = $(this).attr('article_id');
		$('span[name="reply-cancel"]').click();
		$(this).parents('div').nextAll('.none').first().find('b.user').eq(1).html(reply_author);
		$(this).parents('div').nextAll('.none').first().find('span[name="reply-submit"]').attr({
				reply_author: reply_author,
				relative_comment: relative_comment,
				article_id: article_id
			});
		$(this).parents('div').nextAll('.none').first().fadeIn(200).find('textarea').focus();
	}
});
//取消回复
$('span[name="reply-cancel"]').on('click', function(event) {
	event.preventDefault();
	$(this).parents('div').find('textarea').val('');
	$(this).parents('div').fadeOut(100).addClass('none');
});
//提交回复
$('span[name="reply-submit"]').on('click', function(event) {
	var that = this;
	event.preventDefault();
	var $position = $(this).parents('div.reply');
	var content = $(this).siblings('textarea').val();
	if (content) {
		var reply_author = $(this).attr('reply_author'),
			relative_comment = $(this).attr('relative_comment'),
			article_id = $(this).attr('article_id'),
			username = $(this).attr('username'),
			time = new Date();
		$(that).siblings('span').click();
		$.post('/article/reply/' + article_id, { 
			'relative_comment': relative_comment, 
			'comment_text': content, 
			'comment_time': time, 
			'reply_author': reply_author 
		}, function(data) {
			var $reply = $('<div>').addClass('reply');
			var $span = $('<span>').append($('<b>').addClass('user').html(data.comment_author)).append('&nbsp;回复&nbsp;').append($('<b>').addClass('user').html(data.reply_author));
			var $p = $('<p>').append(data.comment_text)
				.append($('<br>'))
				.append($('<small>').html(data.comment_time))
				.append($('<span>')
					.attr({
						name: 'reply-delete',
						comment_id: data.comment_id
					})
					.addClass('right')
					.html('删除')
					.on('click', function(event) {
					event.preventDefault();
					$('.overlay').removeClass('hid');
					$('.confirm').attr('action', '/comment/delete/' + data.comment_id).removeClass('hid');
				}));
			$span.appendTo($reply);
			$p.appendTo($reply);
			$reply.insertBefore($position);
		});
	} else{
		$('#main-msg').find('span').html('回复不能为空').parent().slideDown(200);
		setTimeout(function () {
			$('#main-msg').fadeOut(1000);
		}, 2000);
	};
});

//评论提交
$('#comment-submit').on('click', function(event) {
	event.preventDefault();
	var $textarea = $(this).siblings('textarea');
		comment = $textarea.val(),
		$position = $(this).parents('div.comment');
	if(comment) {
		var	article_id = $(this).attr('article_id'),
			time = new Date(),
			author = $(this).attr('author');
		$.post('/article/comment/' + article_id, { 'comment_text': comment, 'comment_time': time }, function(data) {
			if (typeof data == 'string') {
				$('.message').html(data).fadeIn();
			} else{
				var $div = $('<div>').addClass('comment').append($('<b>').addClass('user').html(data.comment_author));
				var $p = $('<p>').html(data.comment_text)
					.append($('<br>'))
					.append($('<small>').html(data.comment_time))
					.append($('<span>')
						.attr({
							name: 'reply-delete',
							comment_id: data.comment_id
						})
						.addClass('right')
						.html('删除')
						.on('click', function(event) {
							event.preventDefault();
							$('.overlay').removeClass('hid');
							$('.confirm').attr('action', '/comment/delete/' + data.comment_id).removeClass('hid');
						}));
				$p.appendTo($div);
				$div.insertBefore($position);
				$textarea.val('');
			};
		});
	} else{
		$('#main-msg').find('span').html('评论不能为空').parent().slideDown(200);
		setTimeout(function () {
			$('#main-msg').fadeOut(1000);
		}, 2000);
	}
});

//删除评论或回复
$('span[name="reply-delete"]').on('click', function (event) {
	event.preventDefault();
	var id = $(this).attr('comment_id');
	$('.overlay').removeClass('hid');
	$('.confirm').attr('action', '/comment/delete/' + id).removeClass('hid');
});

//删除文章
$('#delete_blog').on('click', function (event) {
	event.preventDefault();
	var article_id = $(this).attr('article_id');
	$('.overlay').removeClass('hid');
	$('.confirm').attr('action', '/article/delete/' + article_id).removeClass('hid');
});

function loginRequired () {
	if ($('a[href="/logout"]')[0] == undefined) {
		$('#btn-login').click();
		return false;
	} else{
		return true;
	}
}
//推荐
$('#ope-recommend').on('click', function (){
	var that = this;
	var id = $(that).parents('header').attr('article_id');
	if ($(that).attr('recommended') == undefined) {
		$.post('/article/recommend/' + id, {}, function(data) {
			if(data) {
				$(that).attr('recommended', '').css('color', 'red');
				var $span = $('<span>');
				$span.html('+1')
					.css({
						position: 'absolute',
						left: $(that).position().left + 9,
						top: $(that).position().top-18,
						'font-size': '1.2em'
					})
					.appendTo($(that))
					.animate({
							top: $(that).position().top - 35,
							opacity: .4
						}, 800, function() {
						$span.remove();
					});
			} else{
				$('#btn-login').click();
			}
		});
	} else{
		showMessage('请勿重复推荐');
	};
});

//收藏
$('#ope-collect').on('click', function (){
	var that = this;
	var id = $(that).parents('header').attr('article_id');
	$.post('/article/collect/' + id, {}, function(data) {
		switch(data) {
			case '0':
				$('#btn-login').click();
				break;
			case '1':
				$(that).attr('collected', '')
					.css('color', 'red')
					.children('i')
					.removeClass('icon-star-empty')
					.addClass('icon-star');
				break;
			case '2':
				$(that).removeProp('collected')
					.css('color', '#333')
					.children('i')
					.removeClass('icon-star')
					.addClass('icon-star-empty');
				break;
		}
	});
});