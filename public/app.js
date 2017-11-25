$( document ).foundation()

$( document ).ready(function() {
    
    /**
     * 
     * @param {string} trackURL
     */
    function submitDemo(trackURL) {
        // split the track url and get the last thing
        var trackID = trackURL.split('/').pop();
        
        $.ajax({
            method: 'POST',
            url: '/api/demos',
            data: {
                trackID: trackID
            },
            success: function(res) {
                console.log(res);
            },
            error: function(err) {
                console.log(err);
            }
        });

        // ^ while all this is happening, show the fancy transitioning screen :D


        
        // alert(trackID);

        // https://open.spotify.com/track/2pxAohyJptQWTQ5ZRWYijN
    }
    
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

            $( ".submissions__demo-input" ).on("change paste keyup", function() {
                $( ".submissions__demo-submit" ).fadeIn();
                $( ".submissions__demo-input" ).off();
                $( "#demo-submission-form" ).submit(function(e) {
                    e.preventDefault();
                    var trackURL = $( ".submissions__demo-input" ).val();

                    if (trackURL != '') {
                        submitDemo(trackURL);
                    }
                });
            });
        }, 250);
    }
    
    /* give the page some time to load the resources without looking crap */
    setTimeout(function() {
        $( '.full-screen' ).show();
    }, 100);

    $( '#get-started-btn' ).click(getStarted);
}); 
