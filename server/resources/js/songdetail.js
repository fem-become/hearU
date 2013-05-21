(function(hoo, player){

	var _inited=false;
	function init () {
		if(_inited){
			return;
		}
		_inited=true;

		if( !(player = hoo.player)) return;

		var inited,
			curIdx = 0,
			ldata = [],
			info = { currentSong: null, prevSong: null, nextSong: null };
		
		function SongDetail(){
			if(!inited){
				inited = true;
				return (ldata = player.list)[curIdx] ? _refresh() : info;
			} else {
				return  _refresh();
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
			player.prev();
			return _refresh();
		}
		function goNext(){
			player.next();
			return _refresh();
		}
		function favorSong(callback){
			hoo.openSelect(info.currentSong.songId, info.currentSong.collectId);
		}
		function trashSong(callback){
			hoo.requestAPI('/collect/removeSong', {
				collectId: info.currentSong.collectId,
				songId: info.currentSong.songId
			}, callback);
		}
		function searchByArtist(){
			hoo.requestAPI('/song/search', {
				key: player.getSongInfo().artist
			}, function (data) {
				hoo.switchView('songlist',{songs:data});
			});
		}
		function getListByOwner(){
			hoo.switchView('albumlist', { userId: info.currentSong.userId });
		}
		function guessUllLike(){
			hoo.requestAPI('/song/random', {userId:sessionId}, function(list){
				list.forEach(function(v){
					v.songId = v._id;
				});
				hoo.switchView('songlist', { songs: list });
			});
		}
		
		hoo.SongDetail = SongDetail;
	}
	hoo._initDetail=init;
})(this.HearU);
