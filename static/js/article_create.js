$(document).ready(function () {
	var editor = new wangEditor('content');
    editor.create();
});
function checkContent () {
	console.log($('.wangEditor-txt').html().length);
	if($('.wangEditor-txt').html().length < 100) {
		showMessage('文章内容过少');	
		return false;
	} else{
		return true;
	}
}