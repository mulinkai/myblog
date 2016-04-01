$(document).ready(function () {
	var editor = new wangEditor('content');
    editor.create();
});
function checkContent () {
	var length = $('.wangEditor-txt').html().length;
	console.log($('.wangEditor-txt').html().length);
	if(length < 100) {
		showMessage('文章内容过少');	
		return false;
	} else if(length > 17900) {
		showMessage('博客内容过长，建议分多次发表');	
		return false;
	} else {
		return true;
	}
}
$('#upload').on('click', function () {
	$(this).siblings('input').click();
});