(function(global) {
    "use strict";
    var metaData = null;

    var SongDetailView = {
        name: "songdetail",
        getHTML: function(data) {
            return $('#songDetalTpl').text();
        },
        init: function(data) {
            var self=this;
            this.metaData = metaData = data;

            HearU._initDetail();
            var html = this.getHTML();
            var songList = HearU.SongDetail(),currentSong=songList.currentSong;
            
            $('#mainlist').html(html);
            setTimeout(function (){
                $('.play-detail').removeClass('hide');
            },500);
            $('.J_PlayTime').html('00:00');
            HearU.scroll.refresh();
            var carousel = new Carousel("#PlayDetail");
            setTimeout(function (argument) {
                carousel.setPaneDimensions();
            },300);
            this.carousel=carousel;
            this.isplaying=true;
            carousel.init();

            updateSongInfo();
            
            function updateSongInfo () {
                $('#J_Songer').html(songList.currentSong.artist);
                self.carousel.setPaneDimensions();
                if(window.sessionId==songList.currentSong.userId||songList.currentSong.userId==-1){
                    $('.others-song').hide();
                }else{
                    $('.others-song').show();
                }
                if(window.sessionId==songList.currentSong.userId){
                    $('.icon-trash').show();
                }else{
                    $('.icon-trash').hide();
                }
                if(songList.currentSong.hasFavor){
                    $('.icon-heart').addClass('has-favor');
                    $('.icon-trash').show();
                }else{
                    $('.icon-heart').removeClass('has-favor');
                    $('.icon-trash').hide();
                }
                var pane=$('.play-list-item');
                    pane.each(function(index,item) {
                       var cover;
                       if(index==0){
                          cover=songList.prevSong.cover;
                       }else if(index==1){
                          cover=songList.currentSong.cover;
                       }else{
                          cover=songList.nextSong.cover;
                       }
                       $('img',item).attr('src',cover);
                });
            }
            $('.play-list').on('webkitTransitionEnd',function(){
                var $target=$(this),transform=$target.css('-webkit-transform');
                $target.removeClass('animate').css('-webkit-transform','translate3d(-33.333333333333336%, 0px, 0px) scale3d(1, 1, 1)');
                if(transform.indexOf('66')>-1){
                    var pane=$('.play-list-item');
                    HearU.setTitle(songList.nextSong.name);
                    songList=HearU.SongDetail.next();
                    $(pane[0]).appendTo(pane.parent());
                    updateSongInfo();
                }else if(transform.indexOf('33')==-1){
                    var pane=$('.play-list-item');
                    HearU.setTitle(songList.prevSong.name);
                    songList=HearU.SongDetail.prev();
                    $(pane[pane.length-1]).prependTo(pane.parent());
                    updateSongInfo();
                }
                
            });
            HearU.setTitle(currentSong.name);
        },
        swipeLeft: function(ev) {
           
        },
        swipeRight: function(ev) {
            
        },
        tap: function(ev) {
            var $target=$(ev.target);
            if($target.hasClass('icon-pause')){
                if(this.isplaying){
                    this.isplaying=false;
                    HearU.SongDetail.pause();
                    $target.addClass('icon-play');
                }else{
                    this.isplaying=true;
                    HearU.SongDetail.play();
                    $target.removeClass('icon-play');
                }
                
            }else if($target.hasClass('icon-heart')){
                HearU.SongDetail.favor();
            }else if($target.hasClass('icon-trash')){
                HearU.SongDetail.trash();
            }else if($target.hasClass('others-singer')){
                HearU.SongDetail.artist();
            }else if($target.hasClass('others-song')){
                HearU.SongDetail.ownerList();
            }else if($target.hasClass('others-guess')){
                HearU.SongDetail.recommend();
            }else if($target.hasClass('icon-left-open')){
                this.carousel.prev();
            }else if($target.hasClass('icon-right-open')){
                this.carousel.next();
            }
        },
        pullDown: function() {
            var title = undefined;
            if(metaData && metaData.userId == -1) {
                title = "每日推荐";
            }
            var currentSong=HearU.player.getSongInfo(),
                userId = (metaData&& metaData.userId == -1) ? -1 : currentSong.userId,
                username = currentSong.userName || (metaData && metaData.userName),
                title = title || (metaData && metaData.title);
                
            HearU.switchView('songlist', {
                title: title, 
                songs: HearU.player.list,
                userId: userId,
                userName: username,
                collectId:currentSong.collectId
            });
        },
        inputDown: function() {
            //HearU.openSearch();
        },
        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        }
    };

   global.SongDetailView = SongDetailView;
})(window);