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
		var ret = [],
		l = Math.min(time,a.length);
		for(var i=0;i<l;i++){
			ret.push(a.splice(getRandom(a.length-1),1)[0]);
		}
		return ret;
	};
	exports.random = function(callback,res){
		var ret;
		song.find().toArray(function(err,items){
			ret = getRandomArray(items,5);
			callback(ret,res);
		});
	};
	exports.findSongList = function(collectId,callback,res){
		var songs;
		collect.findOne({_id:ObjectID(collectId)},function(err,item){
			if(item){
				songs = item.songs;
				song.find({_id:{$in : turnToObjectId(songs)}}).toArray(function(err,items){
					callback(items,res);
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
		console.info(key);
		var condition = {name:{$regex:key}}; 
		song.find(condition).toArray(function(err,items){
			callback(items,res);
		});
	};
})();