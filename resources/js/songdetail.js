(function(hoo, player){

	var _inited=false, _F = function(){};
	function init () {
		if(_inited){
			return;
		}
		_inited=true;

		if( !(player = hoo.player)) return;

		function parseTime(ms){
			var m=Math.floor(ms/60);
			var _ms=parseInt(ms-m*60);
			if(m<10){
				m='0'+m;
			}
			if(_ms<10){
				_ms='0'+_ms;
			}
			return m+':'+_ms;
		}

		player.on('timeupdate',function(ev) {
	        var playTime = $('.J_PlayTime');
	        if(playTime){
	            //console.log(ev);
	            playTime.html(parseTime(ev.target.currentTime));
	        }
	    });
		
		player.on('play',function() {
			var currentSong=player.getSongInfo();
			var items=$('.play-list-item');
			if(items){
				$('img',items[1]).attr('src',currentSong.cover);
			}
		});

		var inited,
			curIdx = 0,
			ldata = [],
			info = { currentSong: null, prevSong: null, nextSong: null };
		
		function SongDetail(){
			if(!inited){
				inited = true;
				return player.list[curIdx] ? _refresh() : info;
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
            ldata = player.list;
			info.currentSong = ldata[curIdx];
			info.prevSong = ldata[(curIdx||ldata.length)-1];
			info.nextSong = ldata[curIdx+1==ldata.length?0:curIdx+1];
			return info;
		}
		function playUp(){
			!player.getPlayState() && player._play(curIdx);
		}
		function pauseUp(){
			player.getPlayState() && player.pause();
		}
		function goPrev(){
			player._play((curIdx||ldata.length)-1);
			return _refresh();
		}
		function goNext(){
			player._play(curIdx+1==ldata.length?0:curIdx+1);
			return _refresh();
		}
		function favorSong(callback){
			hoo.openSelect(
				info.currentSong._id,
				info.currentSong.collectId,
				_F, _F,
				info.currentSong.hasFavor = player.list[curIdx].hasFavor = !info.currentSong.hasFavor
			);
		}
		function trashSong(){
			hoo.requestAPI('/collect/removeSong', {
				collectId: info.currentSong.collectId,
				songId: info.currentSong._id
			}, function() {
				goNext();
			});
		}
		function searchByArtist(){
			hoo.requestAPI('/song/search', {
				key: player.getSongInfo().artist,
				userId: info.currentSong.userId
			}, function (data) {
				hoo.switchView('songlist',{
						songs:data,userId: info.currentSong.userId,
						userName:info.currentSong.userName,
						userId: -1,
						collectId:info.currentSong.collectId,
						title: info.currentSong.artist + ' 的歌曲'
				});
			});
		}
		function getListByOwner(){
			hoo.switchView('albumlist', { userId: info.currentSong.userId,userName:info.currentSong.userName });
		}
		function guessUllLike(){
			hoo.requestAPI('/song/random', {userId:sessionId}, function(list){
				list.forEach(function(v){
					v.songId = v._id;
				});
				hoo.switchView('songlist', { 
                    userId: -1,
                    title: '每日推荐',
                    songs: list 
                });
			});
		}
		
		hoo.SongDetail = SongDetail;
	}
	hoo._initDetail=init;
})(this.HearU);
