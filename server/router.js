/**
 * 路由器
 * @author : yu.yuy
 * @createTime : 2012-08-15
 */
(function(){
	var myInterface = require('./app/controllers/myInterface.js');

    module.exports = function(app){
        //随机歌曲录入
        app.get('/song/random', function(req, res){
            myInterface.random(req, res);
        });
        //创建用户
        app.get('/user/create', function(req, res){
            myInterface.createUser(req, res);
        });
        //歌单列表页面
    	app.get('/collect/list', function(req, res){
            myInterface.myList(req, res);
        });
        //歌曲列表页面
        app.get('/song/list', function(req, res){
            myInterface.songList(req, res);
        });
        //歌单详情
        app.get('/collect/detail', function(req, res){
            myInterface.findCollect(req, res);
        });
        //歌曲详情
        app.get('/song/detail', function(req, res){
            myInterface.findSong(req, res);
        });
        //搜歌
        app.get('/song/search', function(req, res){
            myInterface.searchSongs(req, res);
        });
        //添歌
        app.get('/collect/addSong', function(req, res){
            myInterface.addSong(req, res);
        });
        //移歌
        app.get('/collect/moveSong', function(req, res){
            myInterface.moveSong(req, res);
        });
        //删歌
        app.get('/collect/removeSong', function(req, res){
            myInterface.removeSong(req, res);
        });
        //删歌单
        app.get('/collect/remove', function(req, res){
            myInterface.removeCollect(req, res);
        });
        //收藏歌单
        app.get('/collect/add', function(req, res){
            myInterface.addCollect(req, res);
        });
        //创建歌单
        app.get('/collect/create', function(req, res){
            myInterface.createCollect(req, res);
        });
        //检测歌是否已收藏过
        app.get('/song/isCollected', function(req, res){
            myInterface.isCollected(req, res);
        });
    };
})();