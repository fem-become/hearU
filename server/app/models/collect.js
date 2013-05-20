/**
 * 歌单管理
 * @author : yu.yuy
 * @createTime : 2012-08-15
 */
 (function(){
	var db = require("./config.js").db,
	collect = db.collection('collect'),
	song = db.collection('song'),
	user = db.collection('user'),
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
	};
	exports.findCollectList = function(userId,visitorId,callback,res){
		var collects,
		myCollects,
		collectId;
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects || [];
				collect.find({_id:{$in : turnToObjectId(collects)}}).toArray(function(err,items){
					if(visitorId){
						user.findOne({_id:ObjectID(visitorId)},function(err,item){
							myCollects = item.collects || [];
							for(var i=0,l=items.length;i<l;i++){
								collectId = items[i]._id.toString();
								if(myCollects.indexOf(collectId)>-1){
									items[i].hasFavor = true;
								}
							}
							callback(items,res);
						});
					}
					else{
						callback(items,res);
					}
				});
			}
		});
		
	};
	exports.find = function(collectId,callback,res){
		collect.findOne({_id:ObjectID(collectId)},function(err,item){
			if(item){
				callback(item,res);
			}
		});
	};
	exports.moveSong = function(songId,oldCollectId,newCollectId,callback,res){
		var songs;
		collect.findOne({_id:ObjectID(oldCollectId)},function(err,item){
			if(item){
				songs = item.songs || [];
				for(var i=0,l=songs.length;i<l;i++){
					if(songId === songs[i]){
						songs.splice(i,1);
						break;
					}
				}
				collect.update({_id:ObjectID(oldCollectId)},{$set:{songs:songs}},function(){
					collect.findOne({_id:ObjectID(newCollectId)},function(err,item){
						if(item){
							songs = item.songs || [];
							if(songs.indexOf(songId)===-1){
								songs.push(songId);
								collect.update({_id:ObjectID(newCollectId)},{$set:{songs:songs}},function(){
									callback([],res);
								});
							}
						}
					});
				});
			}
		});
	};
	exports.addSong = function(songId,collectId,callback,res){
		var songs;
		collect.findOne({_id:ObjectID(collectId)},function(err,item){
			if(item){
				songs = item.songs || [];
				if(songs.indexOf(songId)===-1){
					songs.push(songId);
					collect.update({_id:ObjectID(collectId)},{$set:{songs:songs}},function(){
						callback([],res);
					});
				}
			}
		});
	};
	exports.removeSong = function(songId,collectId,callback,res){
		var songs;
		collect.findOne({_id:ObjectID(collectId)},function(err,item){
			if(item){
				songs = item.songs || [];
				for(var i=0,l=songs.length;i<l;i++){
					if(songId === songs[i]){
						songs.splice(i,1);
						collect.update({_id:ObjectID(collectId)},{$set:{songs:songs}},function(){
							callback([],res);
						});
					}
				}
			}
		});
	};
	exports.isCollected = function(userId,songId,callback,res){
		var collects,
		songs = [];
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects || [];
				collect.find({_id:{$in : turnToObjectId(collects)}}).toArray(function(err,items){
					for(var i=0,l=items.length;i<l;i++){
						songs = songs.concat(items[i].songs);
					}
					if(songs.indexOf(songId) === -1){
						callback([],res,true);
					}
					else{
						callback([],res);
					}
				});
			}
		});
	};
})();