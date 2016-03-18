//待删开始
$('.overlay').click(function (e) {
	if (e.target == e.currentTarget)
    	closeOverlay();
});

function checkForm () {
	if($('#title') == '' || $('#content' == ''))
		closeOverlay();
}
function closeOverlay () {
	$('#overlay').addClass('hide');
}
//待删结束

$('.row-self:first-child span').first().on('click', changeToSignup);
$('.row-self:first-child span').last().on('click', changeToLogin);
$('#btn-signup').on('click', changeToSignup);
$('#btn-login').on('click', changeToLogin);

$('.row-self input').on('focus', function(event) {
	$('#msg').html('');
	$(this).siblings('i').removeClass('icon-ok icon-remove');
});

$('.row-self input').on('change', function(event) {
	event.preventDefault();
	var name = $(event.target).attr('name');
	if (name == 'email') {
		if($(this).val().search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1) {
			$(this).attr('data-status', 'true');
			$('p#msg').html('');
			validateOk(this);
		}
		else {
			$(this).attr('data-status', 'false');
			$('p#msg').html('邮箱格式不正确');
			validateNo(this);
		}
	}
	if(name == 'username') {
		if($(this).val()) {
			$(this).attr('data-status', 'true');
			$('p#msg').html('');
			validateOk(this);
		}
		else {
			$(this).attr('data-status', 'false');
			$('p#msg').html('用户名不能为空');
			validateNo(this);
		}
	}
	if(name == 'password') {
		if($(this).val().length >= 6) {
			$(this).attr('data-status', 'true');
			$('p#msg').html('');
			validateOk(this);
		}
		else {
			$(this).attr('data-status', 'false');
			$('p#msg').html('密码不能少于6位');
			validateNo(this);
		}
	}
	if(name == 'repass') {
		$(this).attr('data-status', 'true');
		if($(this).val().length >= 6 && $(this).val() == $('#password').val()) {
			$('p#msg').html('');
			validateOk(this);
		}
		else {
			$(this).attr('data-status', 'false');
			$('p#msg').html('两次密码不一致');
			validateNo(this);
		}
	}
});
$('.row-self input').on('keydown',function (event) {
	if(event.keyCode == 13)
		$('#submit').click();
});

function validateOk (that) {
	$(that).siblings('i').css({ 'color': 'green', 'font-size': '1.5em' }).removeClass('icon-remove').addClass('icon-ok');
}
function validateNo (that) {
	$(that).siblings('i').css({ 'color': 'red', 'font-size': '1.5em' }).removeClass('icon-ok').addClass('icon-remove');
}

$('#submit').on('click', function(event) {
	event.preventDefault();
	var status = true;
	$('.row-self input').each(function() {
		if($(this).attr('data-status') == 'false') {
			$(this).siblings('i').css({ 'color': 'red', 'font-size': '1.5em' }).removeClass('icon-ok').addClass('icon-remove');
			status = false;
		}
	});
	if(status) {
		var username = $('#username').val(),
			email = $('#email').val(),
			password = $('#password').val();
		var url = $(this).attr('data-src'),
			reload = false;
		$.post(url, {
			'username': username,
			'email': email,
			'password': password
		}, function(data) {
			if(data.status == 0) {
				$('p#msg').html(data.msg);
			}
			if(data.status == 1) {
				$('.row-self:first-child span').last().click();
				$('#msg').html(data.msg);
			}
			if(data.status == 2) {
				$('#msg').html(data.msg);
				setTimeout(function () {
					window.location.href = '/'
				}, 300);
			}
		});
	}
});

$('.overlay, #cancel').on('click', function(event) {
	event.preventDefault();
	if(event.target == event.currentTarget) {
		$('.overlay').addClass('hid').children('.form').css('display', 'none');
	}
});

function changeToLogin () {
	$('.row-self:first-child span').removeClass('active').eq(1).addClass('active');
	$('.overlay').removeClass('hid').children('.form').slideDown(250);
	$('.row-self input[name="password"]').attr('placeholder', '');
	$('.row-self').has('input[name="email"]').addClass('hid');
	$('.row-self').has('input[name="repass"]').addClass('hid');
	$('.row-self button').last().html('登录').attr('data-src', '/login');
	$('.row-self i').removeClass('icon-remove icon-ok');
	$('.row-self input').val('').attr('data-status', 'false');
	$('.row-self input[name="email"]').attr('data-status', 'true');
	$('.row-self input[name="repass"]').attr('data-status', 'true');
	$('p#msg').html('');
}
function changeToSignup () {
	$('.row-self:first-child span').removeClass('active').eq(0).addClass('active');
	$('.overlay').removeClass('hid').children('.form').slideDown(250);
	$('.row-self').has('input[name="email"]').removeClass('hid');
	$('.row-self').has('input[name="repass"]').removeClass('hid');
	$('.row-self input[name="password"]').attr('placeholder', '不少于6个字符');
	$('.row-self button').last().html('注册').attr('data-src', '/signup');
	$('.row-self i').removeClass('icon-remove icon-ok');
	$('.row-self input').val('').attr('data-status', 'false');
	$('p#msg').html('');
}
$('.section li').on('click', function(event) {
	event.preventDefault();
	$(this).addClass('active').siblings('.active').removeClass('active');
});

function beforePublish (token) {
	if(token)
		location.href = '/article/create';
	else
		$('#btn-login').click();
}