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
            method: 'GET',
            url: '/api/tracks/' + trackID + '/recommendations',
            success: function(res) {
                console.log(res);

                // res should be the HTML of a list of playlists
                // throw it into the DOM
                $( '.playlist-suggestions' ).html(res);

                $( '.interstitial-screen' ).fadeOut();
                setTimeout(function() {
                    $( '.suggestions-screen' ).fadeIn();
                }, 500);
            },
            error: function(err) {
                console.log(err);
            }
        });

        // ^ while all this is happening, show the fancy transitioning screen :D
        $( '.submissions-screen' ).fadeOut();
        setTimeout(function() {
            $( '.interstitial-screen' ).fadeIn();
        }, 500);

        

        
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
        $( '.full-screen:not(.interstitial-screen):not(.suggestions-screen)' ).show();
    }, 100);

    $( '#get-started-btn' ).click(getStarted);

    $('body').on('click', '.select-me-please-daddy', function(e) {
        const playlistId = $(this).data('playlist-id')
        const curatorId = $(this).data('curator-id')
		const trackId = $( '.submissions__demo-input' ).val().split('/').pop();
        console.log(playlistId)

        fetch('/api/demos', {
            method: 'POST',
            body: JSON.stringify({
                playlistId,
                trackId,
                curatorId,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => response.json())
            .then(console.log)
            .catch(console.error)
    })
}); 
