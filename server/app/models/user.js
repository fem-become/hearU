/**
 * 用户管理
 * @author : yu.yuy
 * @createTime : 2012-08-15
 */
 (function(){
	var db = require("./config.js").db,
	song = db.collection('song'),
	user = db.collection('user'),
	ObjectID = require('mongoskin').ObjectID;
	exports.createUser = function(callback,res){
		user.insert({name:"新用户"},function(err,item){
			console.info(item);
			callback({isSuccess:true,id:item[0]._id},res);
		});
	};
	exports.removeCollect = function(userId,collectId,callback,res){
		var collects;
		console.info(userId);
		console.info(collectId);
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects;
				for(var i=0,l=collects.length;i<l;i++){
					if(collectId === collects[i]){
						collects.splice(i,1);
						break;
					}
				}
				user.update({_id:ObjectID(userId)},{collects:collects},function(){
					callback({isSuccess:true},res);
				})
			}
		});
	};
	exports.addCollect = function(userId,collectId,callback,res){
		var collects;
		user.findOne({_id:ObjectID(userId)},function(err,item){
			if(item){
				collects = item.collects;
				if(collects.indexOf(collectId)!==-1){
					collects.push(collectId);
				}
				user.update({_id:ObjectID(userId)},{collects:collects},function(){
					callback({isSuccess:true},res);
				})
			}
		});
	};
})();