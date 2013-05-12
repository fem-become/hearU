(function(global) {
    "use strict";

    var Session = {
    };

    var WIN_WIDTH = $(window).width(),
        WIN_HEIGHT = $(window).height();

    var data=[{
        id: 0,
        name: '你若不红，天理难容。第二辑',
        num: 20
    },{
        id: 1,
        name: '好听的歌',
        num: 200
    },{
        id: 2,
        name: '钢琴曲',
        num: 16
    },{
        id: 3,
        name: '你若不红，天理难容。第二辑',
        num: 27
    }];

    var songdata = [{
        name: '强力劲爆DJ舞曲',
        src:"./resource/You-And-Me.mp3"
    },{
        name: '网络歌曲情缘',
        src:"./resource/You-And-Me.mp3"
    },{
        name: '中国风，中国情',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'刘德华20年经典重现',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'净化心灵的西藏轻音乐',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'分手需要练习的',
        src:"./resource/You-And-Me.mp3"
    },{
        name: '歌声带你走过绿意',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'我在旧时光中回忆你',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'黄霑配乐黄飞鸿系列电影原声',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'谢谢这些歌郁闷时陪着我',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'听起来你很开心',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'在身心疲惫时，把自己融入歌声',
        src:"./resource/You-And-Me.mp3"
    },{
        name:'都曾反复播放的歌',
        src:"./resource/You-And-Me.mp3"
    }];

    var AlbumListView = {

        name: "AlbumListView",

        getHTML: function() {
            var html = ['<ul class="albumlist">'], i = 0;
            $.each(data, function(index, item) {
                if (i++ == 0) {
                    html.push('<li class="song-list item playing" data-id='+(item.id)+'><div class="slider"><span class="list-name">'+item.name+'<b class="list-num">('+item.num+')</b></span><i class="icon-pause"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
                } else {
                    html.push('<li class="song-list item" data-id='+(item.id)+'><div class="slider"><span class="list-name">'+item.name+'<b class="list-num">('+item.num+')</b></span><i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
                }
            });
            html.push('</ul>');
            return html.join('');
        },

        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        },

        addItem: function(name) {
            //TODO: post data
            var item = {id: 10};
            var li = $('<li class="song-list item" data-id='+(item.id)+'><div class="slider"><span class="list-name">'+name+'<b class="list-num">(0)</b></span><i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
            $('ul.albumlist').prepend(li);
        },

        init: function(data) {
            $('#mainlist').html(this.getHTML());
            this.data = data;
        },

        swipeLeft: function(ev) {
            var $target = $(ev.target);

            console.log("leave me alone");
            $target[0].style['-webkit-transform'] = 'translate3d(-100%, 0px, 0px)';
            $target.parent().remove();

            setTimeout(function () {
                HearU.scroll.refresh();
            }, 0);

            //TODO: request

        },

        swipeRight: function(ev) {
            var $target = $(ev.target);

            console.log("I love it");
            $target[0].style['-webkit-transform'] = 'translate3d(0px, 0px, 0px)';

            //TODO: request
        },

        tap: function(ev) {
            var $target = $(ev.target);

            if ($target.hasClass("icon-play")) {
                var $li = $target.parent().parent();

                $('.playing').removeClass('playing');
                $li.addClass('playing');

                $(".icon-pause").removeClass("icon-pause").addClass("icon-play");
                $target.removeClass("icon-play").addClass("icon-pause");

                var albumID = $li.attr('data-id');
                console.log("play "+albumID);
                if (!HearU.albumRecord[albumID]) {
                    console.log("send request for songs");
                    //TODO: send request
                } else {
                    var songdata = HearU.albumRecord[albumID],
                        songid = songdata[0].id;
                    AudioPlayer.setList(songdata);
                    AudioPlayer.play(songid);
                }
            } else if ($target.hasClass("icon-pause")) {
                $(".icon-pause").removeClass("icon-pause").addClass("icon-play");
                AudioPlayer.pause();
            } else if (this.isChildOrSelf($target, $("li.song-list"))) {
                //TODO: 确定后删除
                var userID = global.session ? global.session.userid ? global.session.userid : 1 : 1;
                HearU.switchView("songlist", {albumID: albumID, userID: userID});
            }
        },

        hold: function(ev) {
            //TODO: 出现搜索框
            var $target = $(ev.target);
        },

        onEdit: function(ev) {
            var self = global.HearU;
            console.log('blur');
            $('#edit').attr('data-status','0')[0].style['-webkit-transform']='rotateX(-90deg)';
            setTimeout(function() {
                $('.edit-wrapper').css('top','-100%');
            }, 500);
            $(self.wrapper).removeClass('shade');

            if($.trim(this.value)){
                AlbumListView.addItem(this.value);
            }
            self.is_editing = false;
            self.scroll.enable();
            self.scroll.refresh();
        },

        pullDown: function() {

        }
    };

    global.AlbumListView = AlbumListView;

})(window);