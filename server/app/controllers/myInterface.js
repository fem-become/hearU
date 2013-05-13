/**
 * 接口
 * @author : yu.yuy
 * @createTime : 2012-08-15
 */
 (function(){
	var collect = require("../models/collect.js"),
	song = require("../models/song.js"),
	user = require("../models/user.js"),
	sendJson = function(o,res){
		res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
		res.write(JSON.stringify(o));
		res.end();
	};
	//随机歌曲录入
	exports.random = function(req, res){
		song.random(sendJson,res);
	};
	//创建用户
	exports.createUser = function(req, res){
		user.createUser(sendJson,res);
	};
	//歌单列表页面
	exports.myList = function(req, res){
		var userId = req.params.userId;
		collect.findCollectList(userId,sendJson,res);
	};
	//歌曲列表页面
	exports.songList = function(req, res){
		var collectId = req.params.collectId;
		song.findSongList(collectId,sendJson,res);
	};
	//歌单详情
	exports.findCollect = function(req, res){
		var collectId = req.params.collectId;
		collect.find(collectId,sendJson,res);
	};
	//歌曲详情
	exports.findSong = function(req, res){
		var songId = req.params.songId;
		song.find(songId,sendJson,res);
	};
	exports.searchSongs = function(req, res){
		var key = req.query.key;
		console.info(key);
		song.search(key,sendJson,res);
	};
	//删歌
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
	//删歌单
	exports.removeCollect = function(req, res){
		console.info(userId);
		console.info(collectId);
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