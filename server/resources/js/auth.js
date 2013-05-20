(function(hoo, player){
	
	if(!hoo && !(player = hoo.player)) return;
	
	var user = localStorage.getItem('h_user'),
		isLogin = user != null,
		cb = function(){};
	
	function setUserLogin(){
		isLogin = true;
		user = localStorage.getItem('h_user');
	}
	function launchPlayer(list){
		list.forEach(function(v){
			v.songId = v._id;
			v.collectId = -1;
			v.userId = -1;
			v.hasFavor = false;
		});
		hoo.player.setList(list);
		hoo.player.play(0);
		hoo.switchView('songdetailview');
		cb(user.id, user.name);
	}
	function init(callback){
		if(typeof callback == 'function') cb = callback;
		if(isLogin){
			setUserLogin();
			hoo.switchView('albumlist', { userId: user.id, userName: name });
			cb(user.id, user.name);
		} else {
			hoo.requestAPI('/user/create', {}, function(data){
				localStorage.setItem('h_user', {
					id: data._id,
					name: data.userName
				});
				setUserLogin();
				hoo.requestAPI('/song/random', { userId: data._id }, launchPlayer);
			});
		}
	}
	
	hoo.authorize = init;
	
})(this.HearU);
