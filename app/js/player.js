/**
 * simply html5 audio player
 */
(function(global) {
    "use strict";

    function Player() {
        this.init.apply(this, arguments);
    }

    $.extend(Player.prototype, {
        init: function(el) {
            var audio = el;
            if(!el) {
                audio = document.createElement("audio");
                $(audio).appendTo(document.body);
            }
            audio.autoplay = false;

            this.element = audio;

//            this._bind();
        },
        _bind: function() {
            var self = this,
                audio = this.element;

/*
            E.on(audio, 'loadstart', function(ev) {
            });
            E.on(audio, 'ended', function(ev) {
                self.fire('ended');
            });
            E.on(audio, 'error', function() {

            });
            E.on(audio, 'timeupdate progress', function(ev) {
            });
*/
            // more event
            // loadstart,progress,suspend,abort,error,emptied
            // stalled,loadedmetadata,loadeddata,canplay,canplaythrough
            // durationchange,play,pause,,ratechange
            // waiting,playing,seeking,seeked,volumechange

            // change,close,show,hide
            // offline,online,load,error
            // cuechange,cancel,invalid,reset
        },
        preload: function(audio) {
            var self = this;
            audio = audio || self.element;

            $(audio).attr('preload', "auto");

            /*
             var timer = S.later(function() {
             if (audio.buffered != null && audio.buffered.length) {
             var durationLoaded = audio.buffered.end(audio.buffered.length - 1);
             var loadedPercent = durationLoaded / audio.duration;
             if(loadedPercent == 1) {
             timer.cancel();
             }
             self.fire("dataProcess", {audio: audio, loadedPercent: loadedPercent});
             }
             }, 500, true);
             */
        },
        load: function(url) {
            var audio = this.element;

            $(audio).attr("src", url);

            audio.load();
        },
        play: function() {
            this.element.play();
        },
        pause: function() {
            this.element.pause();
        },
        stop: function() {
            this.element.pause();
            this.currentTime = this.element.currentTime = 0;
        },
        skipTo: function(percent) {
            var time = this.element.duration * percent;
            this.element.currentTime = time;
        }
    });

    function PlayList() {
        this.init.apply(this, arguments);
    }

    $.extend(PlayList.prototype, {
        init: function(cfg) {
            var self = this,
                audio = new Player();

            this.audio = audio;
            this.list = [];
            this.playedIndex = 0;
            this.playing = false;

            this.on('ended', function() {
                self.loop();
            });
        },
        setList: function(list) {
            this.list = list;
            this.playedIndex = 0;
        },
        play: function(index) {
            var self = this,
                audio = this.audio,
                idx = index === undefined ? self.playedIndex : index,
                song = self.list[idx];
            if(!song || !song.src) {
                return;
            }
            this.playing = true;

            self.playedIndex = idx;

            audio.load(song.src);

            audio.preload();

            audio.play();

//            this.fire('play');
        },
        pause: function() {
            this.playing = false;

            this.audio.pause();

//            this.fire('pause');
        },
        add: function(song) {
            this.list.push(song);
        },
        remove: function(idx) {
            if(idx !== undefined) {
                this.list.splice(idx, 1);
            }
        },
        next: function() {
            var audio = this.audio;

            audio.stop();
            this.playing = false;

            this.play(this.playedIndex + 1);

            this.fire('next');
        },
        prev: function() {
            var audio = this.audio;

            audio.stop();
            this.playing = false;

            this.play(this.playedIndex -1);

            this.fire('prev');
        },
        loop: function() {
            this.next();
        },
        on: function(type, callback, context) {
            var target = this.audio.element;
            $(target).bind(type, function(ev) {
                callback && callback.call(context || target, ev);
            });
        },
        fire: function(type, data) {
            $(this.audio.element).trigger(type, data);
        }
    });

    Player.List = PlayList;

    global.Player = Player;
})(window);