(function(global) {
    "use strict";

    var Session = {
    };

    var WIN_WIDTH=$(window).width(),
        WIN_HEIGHT=$(window).height(),
        ITEM_HEIGHT=62;

    var data=[
    {
        name: "默认歌单"
    },
    {
        name: '歌单1'
    },{
        name: '歌单2'
    }];
    //,'安静时光，静听一首国语歌','如果你看见，这些歌给你听','每个人的内心都是孤独','伤感永远只留给自己','期待着的温暖歌声','好听的电子氛围音乐','不同感觉的爵士说唱','让人放松的爵士乐','不朽的金属之声','流行舞曲金曲选','超酷牛仔乡村音乐精选','鲍勃迪伦民谣歌曲选','神秘的非洲音乐辑','古典音乐大合唱','好听人气RNB女声歌曲','好听手风琴乐曲选'];

    var SongListView = {
        name: "",
        getHTML: function() {
            var html=['<ul class="songlist">'], i = 0;
            $.each(data,function(index,item){
                html.push('<li class="list past item" data-index='+(index)+'><div class="slider">'+item.name+'</div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
            });
            html.push('</ul>');
            return html.join('');
        },
        init: function(data) {
            $('#mainlist').html(this.getHTML()).addClass('curl');//.removeClass('flip');
            console.log(data);
            var list=$('#mainlist li');
            list.each(function (index,item) {
                if(index*ITEM_HEIGHT<WIN_HEIGHT){
                    setTimeout(function(){
                        $(item).removeClass('past');
                    },50*(index+1));
                }else{
                    $(item).removeClass('past');
                }
            });
        },
        swipeLeft: function(ev) {
            var $target = $(ev.target);

            $target[0].style['-webkit-transform']='translate3d(-100%,0px,0px)';
            $target.parent().remove();

            setTimeout(function () {
                HearU.scroll.refresh();
            }, 0);
        },
        swipeRight: function(ev) {
            target.style['-webkit-transform']='translate3d(0px,0px,0px)';
        },
        tap: function(ev) {
            console.log(ev.target);
            HearU.switchView("songlist")
        },
        onEdit: function() {

        }
    };

    global.SelfAlbumList = SongListView;
})(window);