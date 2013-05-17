(function(hoo, player){
	
	if(!hoo && !(player = hoo.player)) return;
	
	var isLogin = localStorage.getItem('user') > 0,
		cb = function(){};
	
	function setUserLogin(){
		isLogin = true;
		sessionId = localStorage.getItem('user');
	}
	function launchPlayer(list){
		list.forEach(function(v){
			v.songId = v._id;
			v.collectId = -1;
			v.userId = -1;
			v.hasFavor = false;
		});
		player.setList(list);
		player.play(0);
		hoo.switchView('songdetailview');
		cb(sessionId);
	}
	function init(callback){
		if(typeof callback == 'function') cb = callback;
		if(isLogin){
			setUserLogin();
			hoo.switchView('albumlist', { userId: sessionId });
			cb(sessionId);
		} else {
			hoo.requestAPI('/user/create', {}, function(data){
				localStorage.setItem('user', data._id);
				setUserLogin();
				hoo.requestAPI('/song/random', {}, launchPlayer);
			});
		}
	}
	
	this.sessionId = 0;
	hoo.authorize = init;
	
})(this.HearU);