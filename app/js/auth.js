(function(hoo, player){
	
	if(!hoo && !(player = hoo.player)) return;
	
	var isLogin = localStorage.getItem('user') > 0,
		cb = function(){};
	
	function setUserLogin(){
		isLogin = true;
		hoo.sessionId = localStorage.getItem('user');
	}
	function launchPlayer(list){
		player.setList(list);
		player.play(0);
		hoo.switchView('songdetailview');
		cb(hoo.sessionId);
	}
	function init(callback){
		if(typeof callback == 'function') cb = callback;
		if(isLogin){
			setUserLogin();
			hoo.switchView('albumlist', { userId: hoo.sessionId });
			cb(hoo.sessionId);
		} else {
			createUser.send({}, function(userId){
				localStorage.setItem('user', userId);
				setUserLogin();
				getSongList.send({ userId: -1, albumId: -1 }, launchPlayer);
			});
		}
	}
	
	hoo.authorize = init;
	
})(this.HearU);
