class App {
	constructor(musicList,playListList){

		// 변수 선언
		this.musicList = musicList;
		this.playListList = playListList;
		this.audio = document.querySelector("#main-audio");
		this.queue = [];
		this.playingStatus = false;
		this.nowIndex = 0;
		// %3 == 1 : 반복안함, 2 : 음악 반복, 0 : 대기열 반복
		this.repeatStatus = 1;
		this.repeatDom = document.querySelector("#repeat");
		this.soundRange = document.querySelector('#sound-range');
		this.ppBtn = document.querySelector("#play-stop");
		this.musicRange = document.querySelector("#music-range");
		// 변수 선언 끝

		// 네비게이션 관련
		document.querySelectorAll("nav > li").forEach((x,index)=>{
			x.addEventListener("click",(e)=>{
				this.loadingPage(index);
			});
		});
		document.querySelector("#logo").addEventListener("click",()=>{
			document.querySelectorAll("nav > li")[0].click();
		});
		// 네비게이션 관련 끝

		//로그인 팝업
		document.querySelector(".login-close").addEventListener("click",()=>{
			$("#login").fadeOut();
			document.querySelector("nav > li:last-child").classList.remove("on");
		});
		//로그인 팝업 끝

		//처음 한번만
		this.loadingPage(0);
		this.audio.volume = this.soundRange.value/100;
		//처음 한번만 끝

		//오디오 이벤트 리스너
		this.audio.addEventListener("timeupdate",(e)=>{
			let duration_m = this.audio.duration/60;
			let duration_s = this.audio.duration%60;
			if(isNaN(duration_s) || isNaN(duration_s)) return;
			document.querySelector(".total-time").innerHTML = this.pre0(duration_m)+":";
			document.querySelector(".total-time").innerHTML += this.pre0(duration_s);
			let current_m = this.audio.currentTime/60;
			let current_s = this.audio.currentTime%60;
			document.querySelector(".current-time").innerHTML = this.pre0(current_m)+":";
			document.querySelector(".current-time").innerHTML += this.pre0(current_s);
			this.musicRange.value = this.audio.currentTime/this.audio.duration*1000;
		});

		this.audio.addEventListener("ended",(e)=>{
			let mod = this.repeatStatus%3;
			if(mod==1) this.pauseMusic(); // 반복 안함
			else if(mod==2){ // 음악 반복
				this.pauseMusic();
				this.audio.currentTime = 0;
				this.playMusic();
			}else if(mod==0){ // 대기열 반복
				if(this.nowIndex+1 >= this.queue.length) this.nowIndex = 0;
				else this.nowIndex++;
				this.audio.src = document.querySelectorAll("video > source")[this.queue[this.nowIndex].idx].src;
				this.playMusic();
			}
		});
		//오디오 이벤트 리스너 끝

// 재생영역

	// 음악위치 조절

	this.musicRange.addEventListener("input",(e)=>{
		let percent = this.musicRange.value / 1000;
		this.audio.currentTime = this.audio.duration*percent;
	});


	// 음악위치 조절 끝

		//반복 바꿔주기
		this.repeatDom.addEventListener("click",()=>{
			this.repeatStatus++;
			let mod = this.repeatStatus%3;
			if(mod==1){ // 반복안함
				$(this.repeatDom).removeClass();
				this.repeatDom.classList.add("no");
				this.repeatDom.innerText = "반복 안함";
			}else if(mod==2){ // 음악 반복
				$(this.repeatDom).removeClass();
				this.repeatDom.classList.add("music");
				this.repeatDom.innerText = "음악 반복";
			}else if(mod==0){ // 대기열 반복
				$(this.repeatDom).removeClass();
				this.repeatDom.classList.add("queue");
				this.repeatDom.innerText = "대기열 반복";
			}
		});
		// 반복 바꿔주기 끝

		// 볼륨 조절
		this.soundRange.addEventListener("input",(e)=>{
			let value = this.soundRange.value;
			document.querySelector(".volume-span").innerText = value+'%';
			this.audio.volume = value/100;
		});	
		// 볼륨 조절 끝

		// 재생버튼
		this.ppBtn.addEventListener("click",(e)=>{
			if(this.audio.currentSrc == ""){
				this.msgNoMusic();
				return;
			}
			if(this.playingStatus) this.pauseMusic();
			else this.playMusic();
		});
		// 재생버튼 끝

// 재생영역 끝
}

pre0(word){
	word = "0"+Math.floor(word);
	return word.substring(word.length-2,word.length);
}

msgNoMusic(){
	alert("대기열이 비었습니다. 음악을 추가해주세요.");
}
pauseMusic(){
	this.audio.pause();
	this.ppBtn.classList.remove("fa-pause");
	this.ppBtn.classList.add("fa-play");
	this.playingStatus = false;
}

playMusic(){
	this.audio.play();
	this.ppBtn.classList.remove("fa-play");
	this.ppBtn.classList.add("fa-pause");
	this.playingStatus = true;
	let msc = this.queue[this.nowIndex];
	document.querySelector("#cover").setAttribute('src',`covers/${msc.albumImage}`);
	document.querySelector(".music-title").innerHTML = msc.name;
	document.querySelector(".music-singer").innerHTML = msc.artist;
}

loadingPage(idx){
	if(idx == 3){
		this.loginPopup();
		return;
	}
	$(".active").removeClass("active");
	document.querySelectorAll("#main > div").forEach(x=>{
		x.style.display = "none";
	});
	if(idx == 0) this.loadingIndex();
	else if(idx == 1) this.loadingQueue();
	else if(idx == 2) this.loadingLibrary();
}

loadingIndex(){
	$("nav > li").eq(0).addClass('active');
	$(".main-index").fadeIn();
	let list = this.musicList.slice(0,5);
	let listDom = document.querySelector(".list-recommend > .list-bottom");
	listDom.innerHTML = "";
	list.forEach(x=>{
		let div = document.createElement("div");
		div.classList.add("music");
		div.style.backgroundImage = `url(../covers/${x.albumImage})`;
		div.innerHTML = this.getIndexForm(x);
		let i = div.querySelector("div > i");
		i.addEventListener("click",(e)=>{
			this.addMusicToQueue(x);
		});
		listDom.appendChild(div);
	});
	listDom = document.querySelector(".list-ballad > .list-bottom");
	this.putList(listDom,"발라드");
	listDom = document.querySelector(".list-dance > .list-bottom");
	this.putList(listDom,"댄스");
	listDom = document.querySelector(".list-hiphop > .list-bottom");
	this.putList(listDom,"랩/힙합");
	listDom = document.querySelector(".list-fb > .list-bottom");
	this.putList(listDom,"포크/블루스");
	listDom = document.querySelector(".list-pop > .list-bottom");
	this.putList(listDom,"POP");
	listDom = document.querySelector(".list-rm > .list-bottom");
	this.putList(listDom,"록/메탈");
	listDom = document.querySelector(".list-rnb > .list-bottom");
	this.putList(listDom,"R&B/Soul");
}



putList(listDom,kind){
	let list = this.musicList.filter(x=> {
		return x.genre === kind;
	});
	list = list.length > 5 ? list.slice(0,5) : list;
	listDom.innerHTML = "";
	list.forEach(x=>{
		let div = document.createElement("div");
		div.classList.add("music");
		div.style.backgroundImage = `url(../covers/${x.albumImage})`;
		div.innerHTML = this.getIndexForm(x);
		let i = div.querySelector("div > i");
		i.addEventListener("click",(e)=>{
			this.addMusicToQueue(x);
		});
		listDom.appendChild(div);
	});
}

addMusicToQueue(music){
	this.queue.push(music);
	this.nowIndex = this.queue.length-1;
	this.audio.pause();
	this.audio.src = this.audio.querySelectorAll("source")[music.idx].src;
	this.playMusic();
}

getIndexForm(music){
	return `
	<div class="music-dark">
	<div class="show-box">
	<span class="show-title">${music.name}</span>
	<br>
	<span class="show-singer">${music.artist}</span>
	</div>
	<i class="far fa-play-circle dark-play"></i>
	</div>
	`;
}

loadingQueue(){
	$("nav > li").eq(1).addClass('active');
	$(".main-queue").fadeIn();
}

loadingLibrary(){
	$("nav > li").eq(2).addClass('active');
	$(".main-library").fadeIn();
}

loadingPlayList(){
	$("nav > li").eq(2).addClass('active');
	$(".main-playList").fadeIn();
}

loginPopup(){
	$("#login").fadeIn();
	document.querySelector("#login").style.display = "flex";
	document.querySelector("nav > li:last-child").classList.add("on");
}
}

window.onload = function(){
	$.getJSON('/music_list.json', function(data){
		data.forEach(x=>{
			document.querySelector("#main-audio").innerHTML += `<source src="music/${x.url}">`;
		});
		$.getJSON("../playlists.json",function(data2){
			let app = new App(data,data2.list);
		});
	});
}

function log(c){
	console.log(c);
}