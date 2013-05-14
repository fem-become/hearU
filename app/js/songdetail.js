(function(hoo, player){
	
	if(!hoo && !(player = hoo.player)) return;
	
	var inited,
		curIdx = 0,
		ldata = [],
		info = { currentSong: null, prevSong: null, nextSong: null };
	
	function SongDetail(){
		if(!inited){
			inited = true;
			(ldata = player.list)[curIdx] && _refresh();
		}
	}
	
	$.extend(SongDetail, {
	    play: playUp,
	    pause: pauseUp,
	    prev: goPrev,
	    next: goNext,
	    favor: favorSong,
	    trash: trashSong,
	    artist: searchByArtist,
	    ownerList: getListByOwner,
	    recommend: guessUllLike
	});
	
	function _refresh(){
		curIdx = player.playedIndex;
		info.currentSong = ldata[curIdx];
		info.prevSong = ldata[curIdx-1] || null; //ldata[ldata.length-1];
		info.nextSong = ldata[curIdx+1] || null; //ldata[0];
	}
	function playUp(){
		!player.playing && player.play(curIdx);
	}
	function pauseUp(){
		player.playing && player.pause();
	}
	function goPrev(){
		_refresh();
		player.prev();
		return info;
	}
	function goNext(){
		_refresh();
		player.next();
		return info;
	}
	function favorSong(callback){
		/* favorSong.send({
			userId:info.currentSong.userId,
			albumId:info.currentSong.albumId,
			songId:info.currentSong.songId
		}, callback); */
	}
	function trash(callback){
		/* removeSong.send({
			userId:info.currentSong.userId,
			albumId:info.currentSong.albumId,
			songId:info.currentSong.songId
		}, callback); */
	}
	function searchByArtist(keyword,callback){
		/* searchSongs.send({
			key:keyword
		}, callback); */
	}
	function getListByOwner(){
		hoo.switchView('albumlist', { userId: info.currentSong.userId });
	}
	function guessUllLike(){
		hoo.switchView('songlist', { userId: -1 });
	}
	
})(this.HearU);
