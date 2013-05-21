/**
 * 歌曲管理
 * @author : yu.yuy
 * @createTime : 2012-08-15
 */
 (function(){
	var db = require("./config.js").db,
	song = db.collection('song'),
	user = db.collection('user'),
	collect = db.collection('collect'),
	ObjectID = require('mongoskin').ObjectID,
	turnToObjectId = function(a){
		var ret = [];
		console.info(a);
		for(var i=0,l=a.length;i<l;i++){
			if(!a[i]){
				return;
			}
			ret.push(ObjectID(a[i]));
		}
		return ret;
	},
	getRandom = function(n){
		return parseInt(Math.random()*n);
	},
	getRandomArray = function(a,time){
    console.info(a);
		var ret = [],
		l = Math.min(time,a.length);
		for(var i=0;i<l;i++){
			ret.push(a.splice(getRandom(a.length-1),1)[0]);
		}
		return ret;
	},
	richSong = function(songs,index,res,callback){
		var song = songs[index],
		songId = song._id.toString(),
		collectId;
		song.hasFavor = false;
		collect.findOne({songs:{$in:[songId]}},function(err,item){
			if(item){
				collectId = item._id.toString();
				song.collectId = collectId;
				song.collectName = item.name;
				user.findOne({collects:{$in:[collectId]}},function(err,item){
					song.userId = item._id.toString();
					song.userName = item.name;
					if(index === songs.length-1){
						callback(songs,res);
						return;
					}
					else{
						richSong(songs,++index,res,callback);
					}
				});
			}
			else{
				callback(null,res,true);
			}
		});
		return songs;
	};
	exports.random = function(userId,callback,res){
		var ret;
		var collects,
		mySongs = [];
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects || [];
				collect.find({_id:{$in : turnToObjectId(collects)}}).toArray(function(err,items){;
					for(var i=0,l=items.length;i<l;i++){
						mySongs = mySongs.concat(items[i].songs || []);
					}
                    console.info('----------------------');
                    console.info(mySongs);
                    console.info('----------------------');
					song.find({_id:{$nin : turnToObjectId(mySongs)}}).toArray(function(err,items){
						ret = getRandomArray(items,30);
						var index = 0
						richSong(ret,index,res,callback);
					});
				});
			}
		});
	};
	exports.findSongList = function(collectId,visitorId,callback,res){
		var songs,
		mySongs = [],
		songId;
		collect.findOne({_id:ObjectID(collectId)},function(err,item){
			if(item){
				songs = item.songs || [];
				song.find({_id:{$in : turnToObjectId(songs)}}).toArray(function(err,items){
					if(visitorId){
						user.findOne({_id:ObjectID(visitorId)},function(err,item){
							if(item){
								collects = item.collects || [];
								collect.find({_id:{$in : turnToObjectId(collects)}}).toArray(function(err,collects){
									for(var i=0,l=collects.length;i<l;i++){
										mySongs = mySongs.concat(collects[i].songs);
									}
									for(var i=0,l=items.length;i<l;i++){
										songId = items[i]._id.toString();
										if(mySongs.indexOf(songId)>-1){
											items[i].hasFavor = true;
										}
									}
									callback(items,res);
								});
							}
						});
					}
					else{
						callback(items,res);
					}
				});
			}
		});
	};
	exports.find = function(songId,callback,res){
		song.findOne({_id:ObjectID(songId)},function(err,doc){
			callback(doc,res);
		});
	};
	exports.search = function(key,callback,res){
		var condition = {$or:[{name:{$regex:key}},{artist:{$regex:key}}]},
		item,
		songIds = [],
		index = 0; 
		song.find(condition).toArray(function(err,items){
            if(items.length){
                richSong(items,index,res,callback);
            }
			else{
                callback([],res,true);
            }
		});
	};
})();