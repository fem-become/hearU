/**
 * 接口
 * @author : yu.yuy
 * @createTime : 2012-08-15
 */
 (function(){
	var collect = require("../models/collect.js"),
	song = require("../models/song.js"),
	user = require("../models/user.js"),
	sendJson = function(o,res,isFail){
		var ret = {
			isSuccess:!isFail,
			data : o
		};
		res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
		res.write(JSON.stringify(ret));
		res.end();
	};
	//随机歌曲录入
	exports.random = function(req, res){
		var userId = req.query.userId;
		song.random(userId,sendJson,res);
	};
	//创建用户
	exports.createUser = function(req, res){
		user.createUser(sendJson,res);
	};
	//分配用户
	exports.allotUser = function(req, res){
		user.allot(sendJson,res);
	};
	//歌单列表页面
	exports.myList = function(req, res){
		var userId = req.query.userId,
		visitorId = req.query.visitorId;
		collect.findCollectList(userId,visitorId,sendJson,res);
	};
	//歌曲列表页面
	exports.songList = function(req, res){
		var collectId = req.query.collectId,
		visitorId = req.query.visitorId;
		song.findSongList(collectId,visitorId,sendJson,res);
	};
	//歌单详情
	exports.findCollect = function(req, res){
		var collectId = req.query.collectId;
		collect.find(collectId,sendJson,res);
	};
	//歌曲详情
	exports.findSong = function(req, res){
		var songId = req.query.songId;
		song.find(songId,sendJson,res);
	};
	exports.searchSongs = function(req, res){
		var key = req.query.key;
		song.search(key,sendJson,res);
	};
	//添歌
	exports.addSong = function(req, res){
		var query = req.query,
		songId = query.songId,
		collectId = query.collectId;
		collect.addSong(songId,collectId,sendJson,res);
	};
	//移歌
	exports.moveSong = function(req, res){
		var query = req.query,
		songId = query.songId,
		oldCollectId = query.oldCollectId,
		newCollectId = query.newCollectId;
		collect.moveSong(songId,oldCollectId,newCollectId,sendJson,res);
	};
	//删歌
	exports.removeSong = function(req, res){
		var query = req.query,
		songId = query.songId,
		collectId = query.collectId;
		collect.removeSong(songId,collectId,sendJson,res);
	};
	//收藏歌单
	exports.addCollect = function(req, res){
		var query = req.query,
		userId = query.userId,
		collectId = query.collectId;
		user.addCollect(userId, collectId,sendJson,res);
	};
	//创建歌单
	exports.createCollect = function(req, res){
		var query = req.query,
		userId = query.userId,
		name = query.name;
		user.createCollect(userId, name,sendJson,res);
	};
	//删歌单
	exports.removeCollect = function(req, res){
		var query = req.query,
		userId = query.userId,
		collectId = query.collectId;
		user.removeCollect(userId, collectId,sendJson,res);
	};
	//检测歌是否已收藏过
	exports.isCollected = function(req, res){
		var query = req.query,
		userId = query.userId,
		songId = query.songId;
		collect.isCollected(userId,songId,sendJson,res);
	};
})();