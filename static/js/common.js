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