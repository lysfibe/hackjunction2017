$(document).foundation()

$( document ).ready(function() {
    /* give the page some time to load the resources without looking crap */
    setTimeout(function() {
        $( '.submissions-screen' ).show();
    }, 100);
});
