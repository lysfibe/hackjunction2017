$( document ).foundation()

$( document ).ready(function() {

    window.audioPreviews = {}

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
                if (res.trim() == '') {
                    $( '.playlist-suggestions' ).html('<p class="white-text" style="text-align:center; margin-top:10px;">:( Oh Boo!<br>We couldn\'t find any matches.</p>');
                } else {
                    // res = html of playlist suggestions, chuck them into the dom
                    $( '.playlist-suggestions' ).html(res);
                    // render the recent activity times
                    var timesToConvert = document.querySelectorAll('.convert-time');

                    timesToConvert.forEach(function(timeToConvert) {
                        console.log(timeToConvert);
                        console.log('converting time:' + timeToConvert.dataset.datetime);
                        var time = Date.parse(timeToConvert.dataset.datetime);
                        console.log('converted time : ' + time);
                        timeToConvert.innerText = timeago().format(Date.parse(timeToConvert.dataset.datetime));
                    }, this);
                }
                // fade out the previous screen
                $( '.interstitial-screen' ).fadeOut();

                // fade in the playlist suggestions screen
                setTimeout(function() {
                    $( '.suggestions-screen' ).fadeIn();
                    
                    $( '.playlist-suggestion__show-more-info-button' ).click(function() {
                        var playlistId = $( this ).data('playlist-id') || $( this ).closest('button').data('playlist-id');
                        // show more info on the playlist
                        $( '.playlist-suggestion__more-info-container[data-playlist-id="' + playlistId + '"]' ).css({
                            'max-height': '500px'
                        });
                        // hide this button
                        $( this ).closest('button').hide();
                    });
                }, 500);
            },
            error: function(err) {
                $( '.playlist-suggestions' ).html('<p class="white-text" style="text-align:center; margin-top:10px;">:( Oh Boo!<br>We couldn\'t find any matches.</p>');
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

                    // var trackURL = 'https://open.spotify.com/track/2pxAohyJptQWTQ5ZRWYijN';

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

    $('body').on('click', '.track-preview', function(e) {
        const url = $(this).data('preview-url')
        console.log($(this).find('.fa'))
        if (window.audioPreviews.hasOwnProperty(url)) {
            window.audioPreviews[url].pause()
            delete window.audioPreviews[url]
            $(this).find('.fa').addClass('fa-play')
            $(this).find('.fa').removeClass('fa-pause')
        } else {
            const audio = new Audio(url)
            window.audioPreviews[url] = audio
            audio.play()
			$(this).find('.fa').removeClass('fa-play')
			$(this).find('.fa').addClass('fa-pause')
        }
    })
}); 
