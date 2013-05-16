/**
 * 数据导入
 * @author : yu.yuy
 * @createTime : 2013-05-16
 */
 (function(){
 	var db = require("../models/config.js").db,
	songDb = db.collection('song'),
	userDb = db.collection('user'),
	collectDb = db.collection('collect'),
 	songs = require('../../resources/data/songs.json'),
 	users = require('../../resources/data/users.json'),
 	albums = require('../../resources/data/albums.json'),
 	importSongs = function(){
 		var song;
 		for(var i=0,l=songs.length;i<l;i++){
 			song = songs[i];
 			song.index = i+1;
 			songDb.insert(song,function(err){
 				if(err){
 					console.info('insert song:'+err);
 				}
			});
 		}
 	},
 	importAlbums = function(){
 		var album,
 		name,
 		ownSongs,
 		songIds,
 		index;
 		for(var i=0,l=albums.length;i<l;i++){
 			album = albums[i];
 			name = album.name;
 			index = i+1;
 			ownSongs = album.songs || [];
 			songDb.find({index:{$in:ownSongs}}).toArray(function(err,items){
 				songIds = [];
 				for(var j=0,len=items.length;j<len;j++){
 					songIds.push(items[j]._id.toString());
 				}
 				collectDb.insert({name:name,songs:songIds,index:index},function(err){
	 				if(err){
	 					console.info('insert collect:'+err);
	 				}
				});
 			});
 		}
 	},
 	importUsers = function(){
 		var user,
 		name,
 		albums,
 		albumIds;
 		for(var i=0,l=users.length;i<l;i++){
 			user = users[i];
 			name = user.name;
 			albums = user.albums || [];
 			collectDb.find({index:{$in:albums}}).toArray(function(err,items){
 				albumIds = [];
 				for(var j=0,len=items.length;j<len;j++){
 					albumIds.push(items[j]._id.toString());
 				}
 				userDb.insert({name:name,collects:albumIds},function(err){
	 				if(err){
	 					console.info('insert user:'+err);
	 				}
				});
 			});
 		}
 	};
 	exports.importSongs = function(req, res){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end();
		importSongs();
	};
	exports.importCollects = function(req, res){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end();
		importAlbums();
	};
	exports.importUsers = function(req, res){
		res.writeHead(200, {'Content-Type': 'text/plain'});
		res.end();
		importUsers();
	};
 })();