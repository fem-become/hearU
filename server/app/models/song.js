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
		var ret = [],
		l = Math.min(time,a.length);
		for(var i=0;i<l;i++){
			ret.push(a.splice(getRandom(a.length-1),1)[0]);
		}
		return ret;
	};
	exports.random = function(userId,callback,res){
		var ret;
		var collects,
		mySongs = [];
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects || [];
				collect.find({_id:{$in : turnToObjectId(collects)}}).toArray(function(err,items){
					for(var i=0,l=items.length;i<l;i++){
						mySongs = mySongs.concat(items[i].songs);
					}
					song.find({_id:{$nin : turnToObjectId(mySongs)}}).toArray(function(err,items){
						for(var j=0,len=items.length;j<l;j++){
							items[j].hasFavor = false;
						}
						ret = getRandomArray(items,5);
						callback(ret,res);
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
		var condition = {$or:[{name:{$regex:key}},{artist:{$regex:key}}]}; 
		song.find(condition).toArray(function(err,items){
			callback(items,res);
		});
	};
})();