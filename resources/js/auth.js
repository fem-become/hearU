(function(hoo, player){
	
	if(!hoo && !(player = hoo.player)) return;
	
	var user = JSON.parse(localStorage.getItem('h_user')),
		isLogin = user != null,
		cb = function(){};
	
	function setUserLogin(){
		isLogin = true;
		user = JSON.parse(localStorage.getItem('h_user'));
	}

	var timer = null;

	function launchPlayer(list){
		list.forEach(function(v){
			v.songId = v._id;
		});

		setTimeout(function(){
			hoo.player.setList(list);
			hoo.player.play();
			
	        cb(user.id, user.name);

			hoo.switchView('songdetail', {random: true});
			$('#launch').hide();
		},1000); 
		//alert("playing:" + hoo.player.getPlayState());
	}

	function playTheSong() {
		hoo.player.play();	

		if(hoo.player.getPlayState() == false) {
			timer = setTimeout(playTheSong, 100);
		}else {
			timer = null;
		}
	}

	function init(callback){
		if(typeof callback == 'function') cb = callback;
        
		if(isLogin) {
			setUserLogin();
            cb(user.id, user.name);
            
            hoo.requestAPI("/collect/list", {"userId": user.id, "visitorId": user.id}, function(d) {
                var total = 0;
                hoo.albumRecord = d;
                for (var i = 0, l = d.length; i < l; i++) {
                    total += d[i].songs.length;
                    if (total > 0) {
                        break;
                    }
                }
                if (total > 0) {
                    setTimeout(function(){
                    	hoo.switchView('albumlist', { userId: user.id, userName: user.name });
						$('#launch').hide();
					},1000); 
                } else {
                    hoo.requestAPI('/song/random', { userId: user.id }, launchPlayer);
                }
            });
		} else {
			hoo.requestAPI('/user/create', {}, function(data){
				localStorage.setItem('h_user', JSON.stringify({
					id: data._id,
					name: data.userName
				}));
				setUserLogin();
				init(callback);
				//hoo.requestAPI('/song/random', { userId: data._id }, launchPlayer);
			});
		}
	}
	
	hoo.authorize = init;
	
})(this.HearU);
