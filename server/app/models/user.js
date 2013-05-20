/**
 * 用户管理
 * @author : yu.yuy
 * @createTime : 2012-08-15
 */
 (function(){
	var db = require("./config.js").db,
	song = db.collection('song'),
	user = db.collection('user'),
	ObjectID = require('mongoskin').ObjectID,
	hasAllotedUserIds=[];
	exports.createUser = function(callback,res){
		user.find().toArray(function(err, items){
			user.insert({name:"新用户"+items.length,collects:[]},function(err,item){
				callback({_id:item[0]._id},res);
			});
		});
	};
	exports.allot = function(callback,res){
		var userId;
		user.find({name:{$ne:"新用户"}}).toArray(function(err,items){
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
			if(item){
				collects = item.collects || [];
				collect.insert({name:name},function(err, item){
					collectId = item[0]._id;
					collects.push(collectId);
					user.update({_id:ObjectID(userId)},{$set:{collects:collects}},function(){
						callback({_id:collectId},res);
					});
				});
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