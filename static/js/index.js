$(document).ready(function() {
	if($('#welcome')[0] != undefined) {
		var id = $('#welcome').attr('data-user-id');
		$.get('/queryOld?id=' + id, function(data) {
			$('#old').html(data);
		});
	}
});