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
	exports.findCollectList = function(userId,callback,res){
		var collects;
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects;
				collect.find({_id:{$in : turnToObjectId(collects)}}).toArray(function(err,items){
					callback(items,res);
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
				songs = item.songs;
				console.info(songs);
				console.info(songId);
				for(var i=0,l=songs.length;i<l;i++){
					if(songId === songs[i]){
						songs.splice(i,1);
						break;
					}
				}
				console.info(songs);
				collect.update({_id:ObjectID(oldCollectId)},{$set:{songs:songs}},function(){
					collect.findOne({_id:ObjectID(newCollectId)},function(err,item){
						if(item){
							console.info(item);
							songs = item.songs || [];
							console.info(songs);
							console.info(songs.indexOf(songId));
							if(songs.indexOf(songId)===-1){
								songs.push(songId);
								collect.update({_id:ObjectID(newCollectId)},{$set:{songs:songs}},function(){
									callback({isSuccess:true},res);
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
				console.info(songs);
				if(songs.indexOf(songId)===-1){
					songs.push(songId);
					collect.update({_id:ObjectID(collectId)},{$set:{songs:songs}},function(){
						callback({isSuccess:true},res);
					});
				}
			}
		});
	};
	exports.removeSong = function(songId,collectId,callback,res){
		var songs;
		collect.findOne({_id:ObjectID(collectId)},function(err,item){
			if(item){
				songs = item.songs;
				for(var i=0,l=songs.length;i<l;i++){
					if(songId === songs[i]){
						songs.splice(i,1);
						collect.update({_id:ObjectID(collectId)},{$set:{songs:songs}},function(){
							callback({isSuccess:true},res);
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
			console.info(item);
			if(item){
				collects = item.collects;
				console.info(collects);
				collect.find({_id:{$in : turnToObjectId(collects)}}).toArray(function(err,items){
					for(var i=0,l=items.length;i<l;i++){
						songs = songs.concat(items[i].songs);
					}
					console.info(songs);
					console.info(songId);
					if(songs.indexOf(songId) === -1){
						callback({isSuccess:false},res);
					}
					else{
						callback({isSuccess:true},res);
					}
				});
			}
		});
	};
})();