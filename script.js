
const apiKeyList = ["AIzaSyBEY3hU4KrgZ4FqS6thCo-zYgWlj2mdDPI", "AIzaSyBoGjblXMVbTwB-pfvHLLhRrsT2XhTOLu4", "AIzaSyDlNfIgFRydJ8mB36DQ8u_LjkiffCSmZmM", "AIzaSyBGSXz7tLufr06FGxLTwEt5KuyDAPsu90A"];
let apiKey = apiKeyList[0];
let listVid = [];
let thumbnailItems = [];
let thumbnailUrl = [];
let listVideo;
let player;
let playerID = "PLRPGGQl2fDPBjEpZi-BwaU8pq0zQkffyb";

let bg = document.getElementsByClassName('bg')[0];
let musicPlayer = document.getElementsByClassName('player')[0];
let prev = document.getElementsByClassName('btn-prev')[0];
let next = document.getElementsByClassName('btn-next')[0];
let repeat = document.getElementsByClassName('btn-repeat')[0];
let form = document.getElementsByClassName('form')[0];
let newPlaylistId = document.getElementsByClassName('input')[0];
let ok = document.getElementsByClassName('ok')[0];
let body = document.getElementsByTagName('body')[0];

let tag = document.createElement('script');
let btn = document.getElementById('btn');
let btn2 = document.getElementById('btn2');
let icon = document.getElementById('icon');
let icon2 = document.getElementById('icon2');
let para = document.getElementById('title');

let rand;
let repeatStatus = 0;

//Request Playlist Item
const getPlayListItems = async playlistID => {
	let token;
	let resultArr = [];
	const result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
		params: {
			part: 'id,snippet',
			maxResults: 50,
			playlistId: playlistID,
			key: apiKey
		}
	})
	//Get NextPage Token
	token = result.data.nextPageToken;
	resultArr.push(result.data);
	while (token) {
		let result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
			params: {
				part: 'id,snippet',
				maxResults: 50,
				playlistId: playlistID,
				key: apiKey,
				pageToken: token
			}
		})
		token = result.data.nextPageToken;
		resultArr.push(result.data);
	}
	return resultArr;
};

/* const getThumbnailItems = () => {
	getPlayListItems(playerID).then(data => {
		data.forEach(item => {
			item.items.forEach(i => thumbnailItems.push({ thumbnail: i.snippet.thumbnails }));
		});
		thumbnailItems.forEach(url => {
			thumbnailUrl.push({ url: url.thumbnail.maxres });
		});
	});
	// console.log(thumbnailUrl);
};

getThumbnailItems(); */

//Get Title video and videoId
getPlayListItems(playerID)
	.then(data => {
		data.forEach(item => {
			item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId, thumbnail: i.snippet.thumbnails }));
		});
		//create random index
		rand = Math.floor(Math.random() * listVid.length);
		checkPrivate();
		tag.src = "https://www.youtube.com/iframe_api";
		let firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	})
	.catch(err => {
		changeAPIKey(apiKeyList[1], err);
	});


function changeAPIKey(newKey, err) {
	if (err.response.data.error.errors[0].reason == "dailyLimitExceeded") {
		apiKey = newKey;
		getPlayListItems(playerID)
			.then(data => {
				data.forEach(item => {
					item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId, thumbnail: i.snippet.thumbnails }));

					rand = Math.floor(Math.random() * listVid.length);
					checkPrivate();
					tag.src = "https://www.youtube.com/iframe_api";
					let firstScriptTag = document.getElementsByTagName('script')[0];
					firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
				});
			})
			.catch(err => {
				changeAPIKey(apiKeyList[2], err);
			});


	}
}


function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
		height: '0',
		width: '0',
		videoId: listVid[rand].idVid,
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}
	});
}

function onPlayerReady(event) {
	player.setPlaybackQuality("small");
	btn.style.display = "block";
	prev.style.display = "block";
	next.style.display = "block";
	btn2.style.display = "block";
	repeat.style.display = "block";
	form.style.display = "flex";
	para.innerHTML = listVid[rand].title;
	musicPlayer.style.backgroundImage = `url('${listVid[rand].thumbnail.high.url}')`;
	bg.style.backgroundImage = `url('${listVid[rand].thumbnail.standard.url}')`;
	playButton(player.getPlayerState() !== 5);
}

//On click button
btn.onclick = changeStatusPlay;
prev.onclick = prevSong;
next.onclick = nextSong;
repeat.onclick = repeatVideo;
ok.onclick = changePlaylistId;

function playButton(play) {
	icon.src = play ? "icon/pause.svg" : "icon/play.svg";
}

function changeStatusPlay() {
	if (player.getPlayerState() == 1 || player.getPlayerState() == 3) {
		pauseVideo();
		playButton(false);
	} else if (player.getPlayerState() != 0) {
		playVideo();
		playButton(true);

	}
}

function onPlayerStateChange(event) {
	if (event.data === 0) {
		playButton(false);
	}
}

function playVideo() {
	player.playVideo();
}

function pauseVideo() {
	player.pauseVideo();
}

function stopVideo() {
	player.stopVideo();
}

//previous song
function prevSong() {
	if (repeatStatus == 1) {
		repeat.style.opacity = "0.3";
		repeatStatus = 0;
	}
	playButton(false);
	stopVideo();
	if (rand - 1 < 0) {
		rand = listVid.length - 1;
	} else {
		rand -= 1;
	}
	checkPrivateBack();
	player.loadVideoById({ videoId: listVid[rand].idVid });
	para.innerHTML = listVid[rand].title;
	musicPlayer.style.backgroundImage = `url('${listVid[rand].thumbnail.high.url}')`;
	bg.style.backgroundImage = `url('${listVid[rand].thumbnail.standard.url}')`;
	playButton(true);
}

//next song
function nextSong() {
	if (repeatStatus == 1) {
		repeat.style.opacity = "0.3";
		repeatStatus = 0;
	}
	playButton(false);
	stopVideo();
	if (rand + 1 == listVid.length) {
		rand = 0;
	} else {
		rand += 1;
	}
	checkPrivate();
	player.loadVideoById({ videoId: listVid[rand].idVid });
	para.innerHTML = listVid[rand].title;
	musicPlayer.style.backgroundImage = `url('${listVid[rand].thumbnail.high.url}')`;
	bg.style.backgroundImage = `url('${listVid[rand].thumbnail.standard.url}')`;
	playButton(true);

}

// on Song end
function nextVideo() {
	if (repeatStatus == 1) {
		player.loadVideoById({ videoId: listVid[rand].idVid });
	} else {
		rand = Math.round(Math.random() * listVid.length);
		checkPrivate();
		player.loadVideoById({ videoId: listVid[rand].idVid });
		para.innerHTML = listVid[rand].title;
		musicPlayer.style.backgroundImage = `url('${listVid[rand].thumbnail.high.url}')`;
		bg.style.backgroundImage = `url('${listVid[rand].thumbnail.standard.url}')`;
	}

}

//Repeat
function repeatVideo() {
	if (repeatStatus == 0) {
		repeat.style.opacity = "0.8";
		repeatStatus = 1;
	} else {
		repeat.style.opacity = "0.3";
		repeatStatus = 0;
	}
}

//Check private or deleted video
function checkPrivate() {
	if (listVid[rand].title == "Private video" || listVid[rand].title == "Deleted video") {
		if (rand == listVid.length - 1) {
			rand = 0;
		} else {
			rand += 1;
		}
		checkPrivate();
	}
};

function checkPrivateBack() {
	if (listVid[rand].title == "Private video" || listVid[rand].title == "Deleted video") {
		if (rand == 0) {
			rand = listVid.length - 1;
		} else {
			rand -= 1;
		}
		checkPrivateBack();
	}
};

//on New Playlist
function changePlaylistId() {
	let newId = newPlaylistId.value;
	if (newId == "") {
		return;
	}

	listVid = [];
	btn.style.display = "none";
	prev.style.display = "none";
	next.style.display = "none";
	btn2.style.display = "none";
	repeat.style.display = "none";
	para.innerHTML = "Loading...";

	getPlayListItems(newId)
		.then(data => {
			data.forEach(item => {
				item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId }));
			});
			rand = Math.floor(Math.random() * listVid.length);
			checkPrivate();
			btn.style.display = "block";
			prev.style.display = "block";
			next.style.display = "block";
			btn2.style.display = "block";
			repeat.style.display = "block";
			para.innerHTML = listVid[rand].title;
			player.loadVideoById({ videoId: listVid[rand].idVid });
			playButton(true);
		});

}

//Check song end
setInterval(function () {
	if (player.getPlayerState() == 0) {
		nextVideo();
		playButton(true);
	}
}, 3000);
