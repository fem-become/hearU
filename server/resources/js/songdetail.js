(function(hoo, player){
	
	if(!hoo && !(player = hoo.player)) return;
	
	var inited,
		curIdx = 0,
		ldata = [],
		info = { currentSong: null, prevSong: null, nextSong: null };
	
	function SongDetail(){
		if(!inited){
			inited = true;
			return (ldata = player.list)[curIdx] ? _refresh() : info;
		} else {
			return _refresh();
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
		info.prevSong = ldata[curIdx-1] || ldata[ldata.length-1];
		info.nextSong = ldata[curIdx+1] || ldata[0];
		return info;
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
	}
	function goNext(){
		_refresh();
		player.next();
	}
	function favorSong(callback){
		hoo.openSelect(info.currentSong.songId, info.currentSong.collectId);
	}
	function trash(callback){
		hoo.requestAPI('/collect/removeSong', {
			collectId: info.currentSong.collectId,
			songId: info.currentSong.songId
		}, callback);
	}
	function searchByArtist(keyword){
		hoo.requestAPI('/song/search', {
			key: keyword
		}, callback);
	}
	function getListByOwner(){
		hoo.switchView('albumlist', { userId: info.currentSong.userId });
	}
	function guessUllLike(){
		hoo.requestAPI('/song/random', {}, function(list){
			list.forEach(function(v){
				v.songId = v._id;
				v.collectId = -1;
				v.userId = -1;
				v.hasFavor = false;
			});
			hoo.switchView('songlist', { songs: list });
		});
	}
	
	hoo.SongDetail = SongDetail;
	
})(this.HearU);
