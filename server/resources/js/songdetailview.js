(function(global) {
    "use strict";


    var SongDetailView = {
        name: "songdetail",
        getHTML: function(data) {
            return $('#songDetalTpl').text();
        },
        init: function() {
            var html = this.getHTML();
            //var songList = HearU.SongDetail(),currentSong=songList.currentSong;
            //console.log(currentSong);
            $('#mainlist').html(html);
            var carousel = new Carousel("#PlayDetail");

            carousel.init();
            $('.play-list').on('webkitTransitionEnd',function(){
                var $target=$(this),transform=$target.css('-webkit-transform');
                if(transform.indexOf('66')>-1){
                    console.log('next');
                    var pane=$('.play-list-item');
                    $(pane[0]).appendTo(pane.parent());
                }else if(transform.indexOf('33')==-1){
                    console.log('prev');
                    var pane=$('.play-list-item');
                    $(pane[pane.length-1]).prependTo(pane.parent());
                }
                $target.removeClass('animate').css('-webkit-transform','translate3d(-33.333333333333336%, 0px, 0px) scale3d(1, 1, 1)');
            });


            HearU.setTitle();
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
                player = HearU.player;

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

            HearU.openSelect(song.songId, song.collectId);
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

            //HearU.switchView('play', )
            console.log('switch to play page')
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

   global.SongDetailView = SongDetailView;
})(window);