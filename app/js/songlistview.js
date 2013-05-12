(function(global) {
    "use strict";

    var Session = {
    };

    var WIN_WIDTH=$(window).width(),
        WIN_HEIGHT=$(window).height(),
        ITEM_HEIGHT=62;

    var SongListData =[{
        name: '强力劲爆DJ舞曲',
        src:"./resource/You-And-Me.mp3"
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
    }];
    //,'安静时光，静听一首国语歌','如果你看见，这些歌给你听','每个人的内心都是孤独','伤感永远只留给自己','期待着的温暖歌声','好听的电子氛围音乐','不同感觉的爵士说唱','让人放松的爵士乐','不朽的金属之声','流行舞曲金曲选','超酷牛仔乡村音乐精选','鲍勃迪伦民谣歌曲选','神秘的非洲音乐辑','古典音乐大合唱','好听人气RNB女声歌曲','好听手风琴乐曲选'];

    var SongListView = {
        metaData: null,
        name: "songlist",
        getHTML: function(data) {
            var html=['<ul class="songlist">'], i = 0,
                song = AudioPlayer.getSongInfo();
            $.each(SongListData,function(index,item){
                if (song && item.name == song.name) {
                    html.push('<li class="song past item songplaying" data-index='+(index)+'><div class="slider">'+item.name+'<i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
                } else {
                    html.push('<li class="song past item" data-index='+(index)+'><div class="slider">'+item.name+'<i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
                }
            });
            html.push('</ul>');
            return html.join('');
        },
        init: function(data) {
            var html = this.getHTML(data);
            $('#mainlist').html(html);

            this.metaData = data;

            AudioPlayer.setList(SongListData);

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
        swipeRight: function(ev) {
            target.style['-webkit-transform']='translate3d(0px,0px,0px)';

            var songData = AudioPlayer.getSongInfo();
            HearU.switchView("selfAlbum", $.extend({}, songData, this.metaData));
        },
        tap: function(ev) {
            var $target = $(ev.target);

            if($target.hasClass("icon-play")) {
                var $parent = $target.parent().parent();

                // 重新设置列表。
                AudioPlayer.play($parent.attr('data-index'));

                $('.songplaying').removeClass('songplaying');
                $parent.addClass('songplaying');

                console.log('play '+ $parent.attr('data-index'));
            }else if(this.isChildOrSelf($target, $("li.song"))){
                //HearU.switchView('play', )
                console.log('switch to play page')
            }
        },
        pullDown: function() {
            console.log('pulldown by songlist')
            HearU.switchView('albumlist', this.metaData);
        },
        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
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