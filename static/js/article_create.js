$(document).ready(function () {
	var editor = new wangEditor('content');
    editor.create();

    var labels = [
    	'Android',
    	'AngularJS',
    	'Bootstrap',
    	'C',
    	'C#',
    	'C++',
    	'Cocos2d-x',
    	'CSS3',
    	'Go',
        'Html/CSS',
        'Html5',
        'IOS',
        'JAVA',
        'Javascript',
        'JQuery',
        'Linux',
        'Maya',
        'MongoDB',
        'Mysql',
        'Node.js',
        'Oracle',
        'Photoshop',
        'Premiere',
        'Python',
        'SQL Server',
        'Unity 3D',
        'WebApp',
        'ZBrush',
        '云计算',
        '前端工具',
        '大数据',
        '数据结构',

    ];
    labels.forEach(function (label) {
        $('<label>').html(label).appendTo('#labels');
    });

    $('#labels>label').on('click', function(event) {
        event.preventDefault();
        var that = this,
            temp = $(that).html(),
            $label = $('input[name="label"]'),
            tag = true;
        var labelArray = $label.val().split(',');
        if(labelArray[0] === '')
            labelArray.shift();
        labelArray.forEach(function (label, index) {
            if(label === temp) {
                labelArray.splice(index, 1);
                $(that).toggleClass('label-active');
                tag = false;
            }
        });
        if(tag) {
            labelArray.push(temp);
            $(that).toggleClass('label-active');
        }
        if(labelArray.length > 3) {
            labels.forEach(function (label, index) {
                if(label === labelArray[0])
                    $('#labels>label').eq(index).toggleClass('label-active');
            });
            labelArray.shift();
        }
        $label.val(labelArray.join(','));
    });
});
$('input[type="file"]').on('change', function (e) {
    var files = e.target.files;
    var file = files[0];
    var data = new FormData();
    data.append('file', file);
    console.log(data);
    /*$.post('/article/uploadCover', data, function (data) {
        console.log(data);
    });*/
    /*$.ajax({
        url: '/article/uploadCover',
        type: 'POST',
        dataType: 'json',
        data: data
    }).done(function (res) {
        console.log(res);
    })*/
});
function checkContent () {
	/*var length = $('.wangEditor-txt').html().length;
	if(length < 100) {
		showMessage('文章内容过少');	
		return false;
	} else if(length > 17900) {
		showMessage('博客内容过长，建议分多次发表');	
		return false;
	} else {
		return true;
	}*/
    return false;
}
$('#upload').on('click', function () {
	$(this).siblings('input').click();
});
function addPicture () {
	var file = $("input[name='image']")[0].files[0];

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
	$('input[type="file"]').val('');
}