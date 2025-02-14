// Declearing global variable
let currentSong = new Audio();
let songs;
let currFolder;

// Function to convert secondsToMinutesSeconds
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const formatedMinutes = String(minutes).padStart(2, '0')
    const formatedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formatedMinutes}:${formatedSeconds}`
}

async function getSongs(folder) {

    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/Spotify_Clone/songs/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all the songs in the PlayList
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = ""
    for (const song of songs) {
        if (!song) continue;
        songUl.innerHTML += `<li> 
                            <img class="invert" src="svgs/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>${folder.replaceAll("%20", " ")}</div>
                            </div>
                            <div id="playNow" class="playNow">
                                <span>Play Now</span>
                                <img class="invert" src="svgs/play.svg" alt="">
                            </div> </li>`

    }

    // Attach an event Listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })
    return songs

}

// Play music
const playMusic = (track, pause = false) => {
    currentSong.src = `songs/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "svgs/pause.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00/00:00"
}

// Display all the albums on the page
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/Spotify_Clone/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/Spotify_Clone/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="45" height="45"
                    color="#000000" fill="none">
                    <!-- Green background circle without border -->
                    <circle cx="12" cy="12" r="10" fill="#1fdf64" />
                    <!-- Original icon path -->
                    <path
                        d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                        fill="currentColor" />
                </svg>


            </div>
            <img src="/Spotify_Clone/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>

        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0], true)
        })
    })

}

async function main() {

    // Get the list of all the songs
    await getSongs("KK")
    playMusic(songs[0], true)


    // Calling displayAlbums function
    displayAlbums()


    // Attach an event Listener to play,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svgs/pause.svg"
        } else {
            currentSong.pause()
            play.src = "svgs/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;


        document.querySelector(".circle").style.left = (currentSong.currentTime * 100 / currentSong.duration) + "%";

    })
    // Add an event Listener to seekBar
    document.querySelector(".seekBar").addEventListener('click', (e) => {

        let percent = (Math.floor((e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100));
        percent = Math.max(0, Math.min(100, percent));
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = (currentSong.duration * percent) / 100
        if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
            currentSong.currentTime = (currentSong.duration * percent) / 100;
            console.log("Updated time:", currentSong.currentTime);
        }
        console.log("CurrentTime:", currentSong.currentTime);
    })







    // Add an event Listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    Array.from(document.getElementsByClassName("cardContainer")).forEach(e => {
        e.addEventListener("click", () => {
            document.querySelector(".left").style.left = "0"

        })
    })

    // Add an event Listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event Listener to previous button
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event Listener to next button
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].value = 100
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting Volume to", e.target.value, "/ 100");
        currentSong.volume = parseInt(e.target.value) / 100

    })

    // Add an event Listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("svgs/volume.svg")) {
            e.target.src = e.target.src.replace("svgs/volume.svg", "svgs/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        } else {
            e.target.src = e.target.src.replace("svgs/mute.svg", "svgs/volume.svg")
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}
main()
console.log("If you click anywhere on seekBar it will restart the music!!! It is an error!!!");

