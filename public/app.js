$( document ).foundation()

$( document ).ready(function() {
    /**
     * Transforms the get started button into an input text field
     * for the user to insert a track URL
     */
    function getStarted() {
        $( '#get-started-btn' ).css({
            'width': '600px',
            'color': 'rgba(0,0,0,0)',
            'background-color': 'rgba(0, 0, 0, 0)'
        });

        setTimeout(function() {
            $( '.submissions__demo-input' ).show();
            $( '#get-started-btn' ).hide();

            $( '.submissions__demo-input' ).focus();
        }, 250);
    }
    
    /* give the page some time to load the resources without looking crap */
    setTimeout(function() {
        $( '.full-screen' ).show();
    }, 100);

    $( '#get-started-btn' ).click(getStarted);
}); 
