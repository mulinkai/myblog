$(document).ready(function() {
	if($('#welcome')[0] != undefined) {
		var id = $('#welcome').attr('data-user-id');
		$.get('/queryInfo?id=' + id, function(data) {
            $('#info-old').html(data.old);
            $('#info-create').html(data.account);
			$('#info-collection').html(data.collection);
		});
	}
});