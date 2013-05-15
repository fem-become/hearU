(function(global) {
    "use strict";

    // TODO 根据albumId获取歌曲数据，歌曲id中包含userId。若userId不一致，则不需要switch到歌单列表页面。
    // TODO 是否收藏过，对应的操作。
    //
    var WIN_WIDTH=$(window).width(),
        WIN_HEIGHT=$(window).height(),
        ITEM_HEIGHT=62;

    var SongListData ={
        name: "最爱列表",
        albumId: "",
        list:[{
        name: '强力劲爆DJ舞曲',
            src:"./resource/You-And-Me.mp3",
            songId: "",
            collectId: "",
            userId: "",
            hasFavor: true
    },{
        name: 'You And Me',
        star: true,
        src:"./resource/You-And-Me.mp3"
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

    var SongListView = {
        metaData: null,
        name: "songlist",
        getHTML: function(data) {
            var html=['<ul class="songlist">'], i = 0,
                song = HearU.player.getSongInfo();
            $.each(SongListData.list,function(index,item){
                var clsPlay = (song && item.name == song.name) ? " songplaying" : "",
                    clsFav  = item.hasFavor ? " fav" : "";

                html.push('<li class="song past item'+ clsPlay + clsFav + '" data-index='+(index)+'><div class="slider">'+item.name+'<i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
            });
            html.push('</ul>');
            return html.join('');
        },
        init: function(data) {
            var html = this.getHTML(data);
            $('#mainlist').html(html);
            HearU.setTitle(SongListData.name);

            this.metaData = data;

            HearU.player.setList(SongListData.list);

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

            $target[0].style['-webkit-transform']='translate3d(-100%,0px,0px)';

            setTimeout(function() {
                $target.parent().remove();

                setTimeout(function () {
                    HearU.scroll.refresh();
                }, 0);
            }, 300)
        },
        handleIcon: function() {

        },
        swipeRight: function(ev) {
            target.style['-webkit-transform']='translate3d(0px,0px,0px)';


            var songData = HearU.player.getSongInfo();
            HearU.openSelect(songData.songId, songData.collectId);
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

                // 重新设置列表。
                HearU.player.play($parent.attr('data-index'));

                $('.songplaying').removeClass('songplaying');
            if(HearU.player.playing) {
                $parent.addClass('songplaying');
            }

                console.log('play '+ $parent.attr('data-index'));

                //HearU.switchView('play', )
                console.log('switch to play page')
        },
        pullDown: function() {
            console.log('pulldown by songlist')
            HearU.switchView('albumlist', this.metaData);
        },
        inputDown: function() {
            HearU.openSearch();
        },
        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        },
        search: function() {

        },
        onEdit: function(ev) {
            console.log('onedit', ev);

            $('#edit').attr('data-status','0')[0].style['-webkit-transform']='rotateX(-90deg)';
            setTimeout(function() {
                $('.edit-wrapper').css('top','-100%');
            }, 500);
            $(self.wrapper).removeClass('shade');

            HearU.is_editing = false;
            HearU.scroll.enable();
            HearU.scroll.refresh();
        }
    };

   global.SongListView = SongListView;
})(window);