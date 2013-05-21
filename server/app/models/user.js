/**
 * 用户管理
 * @author : yu.yuy
 * @createTime : 2012-08-15
 */
 (function(){
	var db = require("./config.js").db,
	song = db.collection('song'),
	user = db.collection('user'),
	collect = db.collection('collect'),
	ObjectID = require('mongoskin').ObjectID,
	hasAllotedUserIds=[];
	exports.createUser = function(callback,res){
		var index,
		userName,
		collectId;
		user.find().toArray(function(err, items){
			index = items.length;
			userName = "新用户"+index;
			collect.insert({name:'新歌单'+index,songs:[]},function(err,item){
				if(err){
					console.info(err);
					callback(null,res,true);
					return;
				}
				console.info(item);
				collectId = item[0]._id.toString();
				user.insert({name:userName,collects:[collectId]},function(err,item){
					callback({_id:item[0]._id,userName:userName},res);
				});
			});
		});
	};
	exports.allot = function(callback,res){
		var userId;
		user.find({name:{$ne:"新用户"}}).toArray(function(err,items){
			console.info(items.length);
			for(var i=0,l=items.length;i<l;i++){
				userId = items[i]._id.toString();
				if(hasAllotedUserIds.indexOf(userId) === -1){
					hasAllotedUserIds.push(userId);
					break;
				}
			}
			callback({_id:userId},res);
		});
	};
	exports.createCollect = function(userId,name,callback,res){
		var collectId;
		user.findOne({_id:ObjectID(userId)},function(err,item){
        console.info(item);
			if(item){
				collects = item.collects || [];
				collect.insert({name:name,songs:[]},function(err, item){
					if(err){
						console.info(err);
                        callback(null,res,true);
						return;
					}
					collectId = item[0]._id.toString();
					collects.push(collectId);
					user.update({_id:ObjectID(userId)},{$set:{collects:collects}},function(){
						callback({_id:collectId},res);
					});
				});
			}
            else{
                callback(null,res,true);
            }
		});
	};
	exports.addCollect = function(userId,collectId,callback,res){
		var collects;
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects || [];
				if(collects.indexOf(collectId) === -1){
					collects.push(collectId);
					user.update({_id:ObjectID(userId)},{$set:{collects:collects}},function(){
						callback([],res);
					});
				}
			}
		});
	};
	exports.removeCollect = function(userId,collectId,callback,res){
		var collects;
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects || [];
				for(var i=0,l=collects.length;i<l;i++){
					if(collectId === collects[i]){
						collects.splice(i,1);
						break;
					}
				}
				user.update({_id:ObjectID(userId)},{$set:{collects:collects}},function(){
					callback([],res);
				})
			}
		});
	};

})();