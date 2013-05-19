(function(global) {
    "use strict";

    var WIN_WIDTH = $(window).width(),
        WIN_HEIGHT = $(window).height();

    var d=[{
        id: 0,
        name: '你若不红，天理难容。第二辑',
        num: 20,
        hasFocus: true,
        songs: [{}, {}]
    },{
        id: 1,
        name: '好听的歌',
        num: 200,
        hasFocus: true,
        songs: [{}, {}]
    },{
        id: 2,
        name: '钢琴曲',
        num: 16,
        hasFocus: true,
        songs: [{}, {}]
    },{
        id: 3,
        name: '你若不红，天理难容。第二辑',
        num: 27,
        hasFocus: true,
        songs: [{}, {}]
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

        cacheSongList: [],

        getHTML: function(myAlbum) {
            var data = myAlbum;
            var html = ['<ul class="albumlist">'], i = 0;
            $.each(data, function(index, item) {
                if (i++ == 0) {
                    html.push('<li class="song-list item playing" data-id='+(item.id)+' data-focus='+(item.hasFocus)+'><div class="slider"><span class="list-name">'+item.name+'<b class="list-num">('+item.songs.length+')</b></span><i class="icon-pause"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
                } else {
                    html.push('<li class="song-list item" data-id='+(item.id)+' data-focus='+(item.hasFocus)+'><div class="slider"><span class="list-name">'+item.name+'<b class="list-num">('+item.songs.length+')</b></span><i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
                }
            });
            html.push('</ul>');
            return html.join('');
        },

        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        },

        addItem: function(name) {
            var userId = global.sessionId;
            global.HearU.requerstAPI("/collect/create", {"userId": userId, "name": name}, function(d) {
                var li = $('<li class="song-list item" data-id='+(d.id)+'><div class="slider"><span class="list-name">'+name+'<b class="list-num">(0)</b></span><i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
                $('ul.albumlist').prepend(li);
                global.HearU.albumRecord.push({userId: userId, collectId: d.id, name: name, hasFocus: true});
            });
        },

        init: function(data) {
            var self = this;
            this.data = data;

            var userId;
            //var self = global.HearU;
            if (data.userId == -1) {
                userId = global.sessionId;
            } else {
                userId = data.userId;
            }

            //userId = "5194e93a10bb480c16000028";
            HearU.requestAPI("/collect/list", {"userId": userId}, function(d) {
                $('#mainlist').html(self.getHTML(d));
                HearU.albumRecord = d;
            });
        },

        swipeLeft: function(ev) {
            var $target = $(ev.target);
            console.log("leave me alone");
            //是自己的
            if (global.sessionId == this.data.userId) {
                $target[0].style['-webkit-transform'] = 'translate3d(-100%, 0px, 0px)';
                $target.parent().remove();

                setTimeout(function () {
                    HearU.scroll.refresh();
                }, 0);

                var userId = global.sessionId,
                    collectId = $target.parent().data("id"),
                    self = global.HearU,
                    record = self.albumRecord;
                self.requestAPI("/collect/remove", {"userId": userId, "collectId": collectId}, function() {
                    for (var i = 0, l = record.length; i < l; i++) {
                        if (record[i].id == collectId) {
                            record.splice(i, i+1);
                        }
                    }
                });
            } else {
                var cross = $target.parent().find(".cross");
                cross.hide();
            }
        },

        swipeRight: function(ev) {
            var $target = $(ev.target);
            console.log("I love it");

            $target[0].style['-webkit-transform'] = 'translate3d(0px, 0px, 0px)';
            var userId = global.sessionId,
                collectId = $target.parent().data("id"),
                self = global.HearU;
            self.requestAPI("/collect/add", {"userId": userId, "collectId": collectId}, function(d) {
                //隐藏Favor Icon
                $target.parent().find(".check").hide();
            });
        },

        tap: function(ev) {
            var $target = $(ev.target),
                self = this;

            if ($target.hasClass("icon-play")) {
                var $li = $target.parent().parent();

                $('.playing').removeClass('playing');
                $li.addClass('playing');

                $(".icon-pause").removeClass("icon-pause").addClass("icon-play");
                $target.removeClass("icon-play").addClass("icon-pause");

                var collectId = $li.attr('data-id'), songList;
                console.log("play "+collectId);

                if (songList = this.cacheSongList[collectId]) {
                    HearU.player.setList(songList);
                    HearU.player.play();
                } else {
                    var userId = global.sessionId;
                    HearU.requestAPI("/song/list", {"collectId": collectId}, function(d) {
                        var songList = d.map(function(song, i) {
                            return $.extend(song, {"userId": userId, "collectId": collectId});
                        });
                        HearU.player.setList(songList);
                        HearU.player.play();
                        self.cacheSongList[collectId] = songList;
                    });
                }
            } else if ($target.hasClass("icon-pause")) {
                $(".icon-pause").removeClass("icon-pause").addClass("icon-play");
                HearU.player.pause();
            } else if (this.isChildOrSelf($target, $("li.song-list"))) {
                var userId = global.sessionId,
                    collectId = $target.closest("li.song-list").data("id");
                HearU.switchView("songlist", {userId: userId, collectId: collectId, songs: self.cacheSongList});
            }
        },

        hold: function(ev) {
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

            var input = $("#edit input").val();
            if($.trim(input)){
                AlbumListView.addItem(input);
            }
            self.is_editing = false;
            self.scroll.enable();
            self.scroll.refresh();
        },

        inputDown: function() {
            HearU.createItem();
        },

        pullDown: function() {

        },

        handleIcon: function(ev, x) {
            var $target = $(ev.target);

            //向右
            if (x > 0) {
                var check = $target.parent().find(".check");
                if (check.css("display") == "none") {
                    return true;
                }

                if (global.sessionId == this.data.id || $target.parent().data("focus")) { //|| hasCollect()) {
                    check.hide();
                    return true
                }
            } else {
                var cross = $target.parent().find(".cross");
                if (cross.css("display") == "none") {
                    return true;
                }
                if (global.sessionId != this.data.id) {
                    cross.hide();
                    return true;
                }
            }
        }
    };

    global.AlbumListView = AlbumListView;

})(window);