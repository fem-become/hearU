(function(hoo, player){
	
	if(!hoo && !(player = hoo.player)) return;
	
	var user = JSON.parse(localStorage.getItem('h_user')),
		isLogin = user != null,
		cb = function(){};
	
	function setUserLogin(){
		isLogin = true;
		user = JSON.parse(localStorage.getItem('h_user'));
	}
	function launchPlayer(list){
		list.forEach(function(v){
			v.songId = v._id;
		});
		hoo.player.setList(list);
		hoo.player.play(0);
        cb(user.id, user.name);
		hoo.switchView('songdetail', {random: true});
	}
	function init(callback){
		if(typeof callback == 'function') cb = callback;
		if(isLogin){
			setUserLogin();
            cb(user.id, user.name);
			hoo.switchView('albumlist', { userId: user.id, userName: user.name });
		} else {
			hoo.requestAPI('/user/create', {}, function(data){
				localStorage.setItem('h_user', JSON.stringify({
					id: data._id,
					name: data.userName
				}));
				setUserLogin();
				hoo.requestAPI('/song/random', { userId: data._id }, launchPlayer);
			});
		}
	}
	
	hoo.authorize = init;
	
})(this.HearU);
