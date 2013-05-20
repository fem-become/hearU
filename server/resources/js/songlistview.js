(function(global) {
    "use strict";

    var WIN_WIDTH=$(window).width(),
        WIN_HEIGHT=$(window).height(),
        ITEM_HEIGHT=62;

    var metaData = null;
    var testdb = {
        name: "最爱列表",
        albumId: "",
    songs:[{
        name: '强力劲爆DJ舞曲',
            src:"./resource/You-And-Me.mp3",
            _id: "",
            collectId: "",
            userId: "",
            hasFavor: true
    },{
        name: 'You And Me',
        star: true,
        src:"./resource/You-And-Me.mp3",
        _id: "",
        collectId: "",
        userId: "",
        hasFavor: true
    },{
        name: 'Behind Blue Eyes',
        src:"./resource/Behind-Blue-Eyes.mp3"
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
        }]
    };

    function isSameCollect() {
        return HearU.player.getSongInfo(0) == metaData.songs[0];
    }

    var SongListView = {
        name: "songlist",
        getHTML: function(data) {
            console.log(data);
            if(!data) return;
            var html=['<ul class="songlist">'], i = 0,
                song = HearU.player.getSongInfo();
            $.each(data.songs,function(index,item){
                var clsPlay = (song && item.name == song.name) ? " songplaying" : "",
                    clsFav  = item.hasFavor ? " fav" : "",
                    myself = item.userId == global.sessionId,
                    clsFixed = (item.hasFavor && !myself) || myself ? "" : " fixed";

                html.push('<li class="song past item'+ clsFixed + clsPlay + clsFav + '" data-index='+(index)+'><div class="slider">'+item.name+'<i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
            });
            html.push('</ul>');
            return html.join('');
        },
        init: function(data) {
            metaData = metaData || data;

            var html = this.getHTML(metaData);
            $('#mainlist').html(html);

            HearU.setTitle(metaData.name);

//            HearU.player.setList(metaData.songs);

            $('#mainlist').addClass('curl');//.removeClass('flip');
            var list=$('#mainlist li');
            list.each(function (index,item) {
                if(index*ITEM_HEIGHT<WIN_HEIGHT){
                    setTimeout(function(){
                        $(item).removeClass('past');
                    },150*(index+1));
                }else{
                    $(item).removeClass('past');
                }
            });
        },
        swipeLeft: function(ev) {
            var $target = $(ev.target);

            if($target.hasClass('slider')) {
                $target = $target.parent();
            }else if($target.hasClass('icon-play')){
                $target = $target.parent().parent();
            }

            if($target.hasClass('fixed')) {
                $target.find('.slider').css('-webkit-transform', 'translate3d(0px,0px,0px)');
                return;
            }

            var index = $target.attr('data-index') * 1,
                player = HearU.player,
                song = metaData.songs[index];

            // 如果是同一个列表，则同步删除列表中的歌曲。
            if(isSameCollect()) {
                player.list[index] = null;

                // 如果删除的是正在播放的歌曲，则停止当前歌曲播放
                // 自动播放下一首
                if(player.playing && player.playedIndex == index) {
                    player.pause();
                    player.play(index + 1);

                    $('.songplaying').removeClass('songplaying');
                    $target.next().addClass('songplaying');
                }
            }

            $target.find('.slider').css('-webkit-transform', 'translate3d(-100%,0px,0px)');

            setTimeout(function() {
                $target.remove();
                HearU.requestAPI('/collect/removeSong', {songId: song._id, collectId: song.collectId}, function() {
                    console.log('remove song ', song.name, ' success');
                });

                setTimeout(function () {
                    HearU.scroll.refresh();
                }, 0);
            }, 300);
        },
        swipeRight: function(ev) {
            var $target = $(ev.target);

            if($target.hasClass('slider')) {
                $target = $target.parent();
            }else if($target.hasClass('icon-play')){
                $target = $target.parent().parent();
            }

            $target.find('.slider').css('-webkit-transform', 'translate3d(0px,0px,0px)');

            var index = $target.attr('data-index');
            var song = metaData.songs[index];
            alert(JSON.stringify(song));

            HearU.openSelect(song._id, song.collectId);
        },
        tap: function(ev) {
            var $target = $(ev.target),
                $parent = $target;
            if($target.hasClass('slider')) {
                $parent = $target.parent();
            }else if($target.hasClass('icon-play')) {
                $parent = $target.parent().parent();
            }
            if(!$parent.hasClass('song')) return;

            var player = HearU.player,
                index = $parent.attr('data-index');

            // 如果不是同一个列表，则设置为当前列表。然后播放
            if(!isSameCollect()) {
                player.setList(metaData.songs);
            }

            player.play(index);

            $('.songplaying').removeClass('songplaying');
            if(HearU.player.playing) {
                $parent.addClass('songplaying');
            }

            console.log('play '+ $parent.attr('data-index'));

            HearU.switchView('songdetail');
        },
        pullDown: function() {
            console.log('pulldown by songlist')
            HearU.switchView('albumlist', metaData);
        },
        inputDown: function() {
            HearU.openSearch();
        },
        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        }
    };

   global.SongListView = SongListView;
})(window);