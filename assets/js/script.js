// Wait for the DOM content to load
document.addEventListener('DOMContentLoaded', function() {
    // Get the audio element
    const audio = document.getElementById('audio');
    
    // Set the initial volume level (between 0 and 1)
    audio.volume = 0.1; // Example volume level (30% of maximum volume)
});


function showNextStanza(index) {
    const lyricsElement = document.getElementById('lyrics');
    const stanzas = lyricsElement.querySelectorAll('p');
    const totalStanzas = stanzas.length;

    // If not the last stanza, show the next stanza
    if (index < totalStanzas - 1) {
        stanzas[index].style.display = 'none'; // Hide current stanza
        stanzas[index + 1].style.display = 'block'; // Show next stanza
        currentStanzaIndex = index + 1; // Update current stanza index
    } else {
        // Loop back to the beginning if at the last stanza
        stanzas[index].style.display = 'none'; // Hide current stanza
        stanzas[0].style.display = 'block'; // Show the first stanza
        currentStanzaIndex = 0; // Reset current stanza index
    }
}

let accessToken = '';

async function getToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic NjZmZTYxMzNmZGE1NGQzYWE5YjkzYmQ1ZDNiMWY1NTY6NTQ4OTMxYjU1MmJiNDE1NGE2ZDE0ODU2MDg4Yzc0NDc=`
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    accessToken = data.access_token;
    console.log(data);
}

async function search() {
    
if (!accessToken) {
await getToken();
}

const searchInputSg = document.getElementById('search-sgs').value.trim();
if (!searchInputSg) {
console.error('Please enter a search query');
return;
}

const apiUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchInputSg)}&type=track`;

try {
const response = await fetch(apiUrl, {
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
});

if (response.ok) {
    const data = await response.json();
    console.log(data);
    displayResults(data.tracks.items);
} else {
    throw new Error('Failed to fetch data');
}
} catch (error) {
console.error('Error:', error);
}
}

let currentAudio = null; // Reference to the currently playing audio

function displayResults(tracks) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (tracks.length === 0) {
        resultsContainer.innerHTML = '<p>No results found</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.classList.add('song-results-list');
    ul.setAttribute('id', 'song-results');
    let count = 0;


    tracks.forEach(track => {
        if (count < 5) {

            if (!track.preview_url) return;

            const li = document.createElement('li');
            
            li.textContent = track.name + ' - ' + track.artists[0].name;
            li.onclick = function() {
                
                var volumeSlider = document.getElementById('volume-slider');
                volumeSlider.style.display = 'block';

                resultsContainer.removeChild(ul);

                document.getElementById('search-sgs').value = '';


                // Remove any existing audio elements from other li's
                const headAudios = document.querySelectorAll('#head audio');
                headAudios.forEach(function(audio) {
                    audio.parentNode.removeChild(audio);
                });
                
                // Create audio element
                const audio = document.getElementById('audio');
                audio.src = track.preview_url;

                
                // Autoplay if not already playing
                if (audio !== currentAudio) {
                    if (currentAudio) {
                        currentAudio.pause(); // Pause the currently playing audio
                    }
                    audio.play(); // Start playing the neqw audio
                    currentAudio = audio; // Update the reference to the currently playing audio
                }

                    // Populate np-artist and np-song elements
                const npArtistElement = document.getElementById('np-artist');
                const npSongElement = document.getElementById('np-song');
                npArtistElement.textContent = track.artists[0].name;
                npSongElement.textContent = track.name;


                function fetchLyrics() {
                    // Replace "artist" and "title" with your desired artist and song title
                    const artist = encodeURIComponent(track.artists[0].name);
                    const title = encodeURIComponent(track.name);
                
                    // Fetch lyrics from lyrics.ovh API
                    fetch(`https://api.lyrics.ovh/v1/${artist}/${title}`)
                        .then(response => response.json())
                        .then(data => {
                            const lyricsElement = document.getElementById('lyrics');
                            lyricsElement.innerHTML = ''; // Clear existing lyrics
                            
                            if (data.lyrics) {
                                const lines = data.lyrics.split('\r\n').slice(1);
                                // Join the remaining lines back into a single string
                                const cleanedLyrics = lines.join('\r\n');
                                // Split the cleaned lyrics into stanzas
                                const stanzas = cleanedLyrics.split('\n\n');
                                stanzas.forEach((stanza, index) => {
                                    const stanzaElement = document.createElement('p');
                                    stanzaElement.textContent = stanza;
                                    stanzaElement.style.display = index === 0 ? 'block' : 'none'; // Show the first stanza, hide others
                                    stanzaElement.onclick = () => showNextStanza(index); // Set onclick handler to show next stanza
                                    lyricsElement.appendChild(stanzaElement);
                                });
                            } else {
                                lyricsElement.textContent = "Lyrics not found.";
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching lyrics:', error);
                            document.getElementById('lyrics').textContent = "Error fetching lyrics.";
                        });
                }
                

                fetchLyrics();
            };
            ul.appendChild(li);
            count++;
        } else {
            return;
        }
    });

    const resultsDiv = document.getElementById('results');
    resultsDiv.appendChild(ul);
}

var API_KEY = '43005631-c2ca87ba477823d6f27abd8e4';


function fetchBgs() {
    const searchInputBg = document.getElementById('search-bgs').value.trim();
    var URL = "https://pixabay.com/api/videos/?key="+API_KEY+"&q="+searchInputBg;

    $.getJSON(URL, function(data) {
        if (parseInt(data.totalHits) > 0) {
            const bgList = document.getElementById('results-bgs');
            const hits = data.hits;
            const shuffledHits = shuffleArray(hits);
            const ul = document.createElement('ul');
            ul.setAttribute('id', 'list-bgs');
            const maxItems = Math.min(shuffledHits.length, 6); // Maximum of 5 list items

            for (let i = 0; i < maxItems; i++) {
                const hit = shuffledHits[i];
                const li = document.createElement('li');
                const img = document.createElement('img');
                img.src = hit.videos.tiny.thumbnail;
                img.alt = hit.tags;
                img.setAttribute('data-video-url', hit.videos.large.url); // Set data attribute for video URL
                img.onclick = function() { // Add onclick event handler
                    document.getElementById('search-bgs').value = '';
                    ul.remove(); // Remove the <ul> element from the DOM
                    const videoUrl = this.getAttribute('data-video-url');
                    $('#bg-fill').css('background-image', 'none');
                    $('#bg-fill').html('<video autoplay muted loop><source src="' + videoUrl + '" type="video/mp4"></video>');
                    
                    // Make the video fill the viewport
                    $('#bg-fill video').css({
                        'position': 'fixed',
                        'top': 0,
                        'left': 0,
                        'width': '100%',
                        'height': '100%',
                        'object-fit': 'cover'
                    });
                };
                li.appendChild(img);
                ul.appendChild(li);
            }
            bgList.innerHTML = ''; // Clear previous content
            bgList.appendChild(ul); // Append the <ul> element to the #results-bgs div
        } else {
            console.log('No hits');
        }
    });
}

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let volume = document.getElementById('volume-slider');
volume.addEventListener("change", function(e) {
    audio.volume = e.currentTarget.value / 100;
})

// Saving Selections
document.querySelector('#save-visualizers').addEventListener('submit', saveVisualizer);

// Trigger saveVisualizer function when the button is clicked
document.getElementById('save-visualizers-btn').addEventListener('click', saveVisualizer);

function saveVisualizer(event) {
    event.preventDefault(); // Prevent the default form submission
    const visualizerName = document.getElementById('save-vis-name').value;
    if (!visualizerName) {
        return;
    }

    // Get relevant data to save (e.g., selected song, artist, background video URL, audio URL)
    const selectedSong = document.getElementById('np-song').textContent;
    const selectedArtist = document.getElementById('np-artist').textContent;
    const selectedLyrics = document.getElementById('lyrics').innerHTML;
    const selectedVideoUrl = document.querySelector('#bg-fill video source').getAttribute('src');
    const selectedAudioUrl = document.getElementById('audio').getAttribute('src');

    // Construct an object containing the data to save
    const visualizerData = {
        name: visualizerName,
        song: selectedSong,
        artist: selectedArtist,
        lyrics: selectedLyrics,
        videoUrl: selectedVideoUrl,
        audioUrl: selectedAudioUrl // Include audio URL in the saved data
    };

    // Save the data to localStorage
    localStorage.setItem(visualizerName, JSON.stringify(visualizerData));

    // Update the list of saved selections in the first modal
    updateSavedVisualizersList();
}


// Loading Selections
document.querySelector('.saved-visualizers-list').addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
        const visualizerName = event.target.textContent;

        // Retrieve the data from localStorage
        const visualizerData = JSON.parse(localStorage.getItem(visualizerName));

        if (visualizerData) {
            // Populate the application with the retrieved data
            document.getElementById('np-song').textContent = visualizerData.song;
            document.getElementById('np-artist').textContent = visualizerData.artist;
            const bgFill = document.getElementById('bg-fill');
            bgFill.innerHTML = `<video autoplay muted loop><source src="${visualizerData.videoUrl}" type="video/mp4"></video>`;

            $('#bg-fill video').css({
                'position': 'fixed',
                'top': 0,
                'left': 0,
                'width': '100%',
                'height': '100%',
                'object-fit': 'cover'
            });

            // Update the audio element
            const audio = document.getElementById('audio');
            audio.setAttribute('src', visualizerData.audioUrl);
            audio.play(); // Start playing the audio
            var volumeSlider = document.getElementById('volume-slider');
            volumeSlider.style.display = 'block';


            const selectedLyrics = document.getElementById('lyrics');
            selectedLyrics.innerHTML = visualizerData.lyrics;
            const lyricsParagraphs = selectedLyrics.querySelectorAll('p');
            lyricsParagraphs.forEach((paragraph, index) => {
                paragraph.onclick = () => showNextStanza(index);
            });

            // Update the list of saved selections in the first modal
            updateSavedVisualizersList();
        } else {
            return;
        }
    }
});

// Function to update the list of saved selections in the first modal
function updateSavedVisualizersList() {
    const savedVisualizersList = document.querySelector('.saved-visualizers-list');
    savedVisualizersList.innerHTML = '';

    // Iterate over localStorage keys to populate the list
    for (let i = 0; i < localStorage.length; i++) {
        const visualizerName = localStorage.key(i);
        const listItem = document.createElement('li');
        listItem.textContent = visualizerName;
        savedVisualizersList.appendChild(listItem);
    }
}

// Call updateSavedVisualizersList once when the script loads
updateSavedVisualizersList();

audio.addEventListener('canplaythrough', function() {
    audio.play();
});