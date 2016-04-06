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
function addPicture () {
	var file = $("input[name='file']")[0].files[0];

	var r = new FileReader();
	r.readAsDataURL(file); //Base64
	if($('#thumbnail')[0] == undefined)
		$(r).load(function(){
			$('<div><img id="thumbnail" style="margin-left:78px;" src="'+r.result+'" width="80" height="80" /><i class="icon-plus" onclick="removeThumbnail(this)"></i></div>').insertAfter($('#upload').parent());
		})
	else
		$(r).load(function(){
			$('#thumbnail').attr('src', r.result);
		})
}
function removeThumbnail (remove) {
	$(remove).parent().remove();
}