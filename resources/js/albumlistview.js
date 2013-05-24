(function(global) {
    "use strict";

    var WIN_WIDTH = $(window).width(),
        WIN_HEIGHT = $(window).height();

    var AlbumListView = {

        name: "AlbumListView",

        cacheSongList: [],

        getHTML: function(myAlbum) {
            var data = myAlbum;
            var html = ['<ul class="albumlist">'], i = 0;
            $.each(data, function(index, item) {
                item.name = item.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                html.push('<li class="song-list item past" data-id='+(item._id)+' data-focus='+(item.hasFavor)+'><div class="slider"><i class="icon-play"></i>'+item.name+'<b class="list-num">('+item.songs.length+')</b></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
            });
            html.push('</ul>');
            return html.join('');
        },

        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        },

        addItem: function(name) {
            var userId = global.sessionId;
            global.HearU.requestAPI("/collect/create", {"userId": userId, "name": name}, function(d) {
                name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                var li = $('<li class="song-list item" data-id='+(d._id)+' data-focus="true"><div class="slider">'+name+'<b class="list-num">(0)</b><i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
                $('ul.albumlist').prepend(li);
                global.HearU.albumRecord.push({_id: d._id, name: name, hasFavor: true, songs:[]});
            });
        },

        init: function(data) {
            if(!data.userName) {
                data.userName = "未知";
            }
            var self = this;
            this.data = data;
            //清空歌曲缓存
            this.cacheSongList = {};
            //清空他人歌单缓存
            this.otherAlbum = [];
            this.isOther = false;
            this.curUserName = data.userName;
            var userId;
            //var self = global.HearU;
            if (data.userId == -1 || data.userId == window.sessionId) {
                userId = window.sessionId;
                this.data.userId = userId;
                HearU.setTitle("我的歌单");
                this.isOther = false;
            } else {
                userId = data.userId;
                HearU.setTitle(data.userName+"的歌单");
                this.isOther = true;
            }

            //for debug
            //userId = "5194e93a10bb480c16000028";
            //$('#mainlist').html('');
            HearU.requestAPI("/collect/list", {"userId": userId, "visitorId": sessionId}, function(d) {
                $('#mainlist').addClass('flip').removeClass('curl').html(self.getHTML(d));
                var list=$('#mainlist li');

                list.each(function (index,item) {
                        if(index*44<WIN_HEIGHT){
                            setTimeout(function(){
                                $(item).removeClass('past');
                            },150*(index+1));
                        }else{
                            $(item).removeClass('past');
                        }   
                });
                setTimeout(function(){
                                HearU.scroll&&HearU.scroll.refresh();
                },1000);

                if (data.userId == -1 || data.userId == window.sessionId) {
                    HearU.albumRecord = d;
                } else {
                    AlbumListView.otherAlbum = d;
                }
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
                        if (record[i]._id == collectId) {
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

            if (global.sessionId != this.data.userId) {
                $target[0].style['-webkit-transform'] = 'translate3d(0px, 0px, 0px)';
                
                var userId = global.sessionId,
                    collectId = $target.parent().data("id"),
                    self = global.HearU;
                self.requestAPI("/collect/add", {"userId": userId, "collectId": collectId}, function(d) {
                    //隐藏Favor Icon
                    $target.parent().find(".check").hide();
                });
            }
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

                var collectId = $li.data('id'), songList;
                console.log("play "+collectId);

                if (songList = this.cacheSongList[collectId]) {
                    HearU.player.setList(songList);
                    HearU.player.play(0);
                } else {
                    var userId = global.sessionId;
                    HearU.requestAPI("/song/list", {"collectId": collectId}, function(d) {
                        var songList = d.map(function(song, i) {
                            return $.extend(song, {"userId": userId, "collectId": collectId});
                        });
                        HearU.player.setList(songList);
                        HearU.player.play(0);
                        self.cacheSongList[collectId] = songList;
                    });
                }
            } else if ($target.hasClass("icon-pause")) {
                $(".icon-pause").removeClass("icon-pause").addClass("icon-play");
                HearU.player.pause();
            } else if (this.isChildOrSelf($target, $("li.song-list"))) {
                var userId = this.data.userId,
                    userName = this.data.userName,
                    collectId = $target.closest("li.song-list").data("id"),
                    songList = self.cacheSongList[collectId],
                    title = this.findNameById(collectId);
                if (!songList) {
                    HearU.requestAPI("/song/list", {"collectId": collectId}, function(d) {
                        var songs = $.map(d, function(item) {
                            return $.extend(item, {"userId": userId, "collectId": collectId});
                        });
                        HearU.switchView("songlist", {userId: userId, "userName": userName,title: title, collectId: collectId, songs: songs});
                    });
                } else {
                    HearU.switchView("songlist", {userId: userId, "userName": userName, title: title, collectId: collectId, songs: songList});
                }
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

            var input = $.trim($("#edit input").val());
            if(input) {
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

                if (global.sessionId == this.data.userId || $target.parent().data("focus") == true) { //|| hasCollect()) {
                    check.hide();
                    return true
                }
            } else {
                var cross = $target.parent().find(".cross");
                if (cross.css("display") == "none") {
                    return true;
                }
                
                if (global.sessionId != this.data.userId) {
                    cross.hide();
                    return true;
                }
            }
        },
        
        animIcon: function(ev, x) {
            var $target = $(ev.target),
                check = $(".check", $target.parent()),
                cross = $(".cross", $target.parent());
        
            if (x > 0) {
                check.addClass("animated animate-repeat pulse");        
            } else {
                cross.addClass("animated animate-repeat shake");  
            }
        }, 
        
        findNameById: function(id) {
            var record;
            if (this.data.userId == -1 || this.data.userId == window.sessionId) {
                record = HearU.albumRecord;
            } else {
                record = AlbumListView.otherAlbum;
            }
            for (var i = 0, l = record.length; i < l; i++) {
                if (record[i]._id == id) {
                    return record[i].name;
                }
            }
        }
    };

    global.AlbumListView = AlbumListView;

})(window);