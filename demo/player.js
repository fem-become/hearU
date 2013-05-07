/**
 * iOS only
 * html5 audio player
 */
KISSY.add("widget/player", function(S, E) {
    "use strict";
    var D = S.DOM;

    function Player() {
        this.init.apply(this, arguments);
    }

    S.augment(Player, S.EventTarget, {
        init: function(el) {
            var audio = el;
            if(!el) {
                audio = document.createElement("audio");
                D.append(audio, document.body);
            }
            audio.autoplay = false;

            this.element = audio;

            this._bind();
        },
        _bind: function() {
            var self = this,
                audio = this.element;

            E.on(audio, 'loadstart', function(ev) {
            });
            E.on(audio, 'ended', function(ev) {
                self.fire('ended');
            });
            E.on(audio, 'error', function() {

            });
            E.on(audio, 'timeupdate progress', function(ev) {
            });
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

            D.attr(audio, 'preload', "auto");

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

            D.attr(audio, "src", url);

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
            this.currentTime = 0;
        },
        skipTo: function(percent) {
            var time = this.element.duration * percent;
            this.element.currentTime = time;
        }
    });

    function PlayList() {
        this.init.apply(this, arguments);
    }

    S.augment(PlayList, S.EventTarget, {
        init: function(list) {
            var self = this,
                audio = new Player();
            this.audio = audio;
            this.list = list || [];
            this.playedIndex = 0;
            this.playing = false;

            audio.on('ended', function() {
                self.loop();
            });
        },
        play: function(index) {
            var self = this,
                audio = this.audio,
                idx = index === undefined ? self.playedIndex : index,
                song = self.list[idx];
            if(!song) {
                return;
            }
            this.playing = true;

            self.playedIndex = idx;

            audio.load(song);

            audio.preload();

            audio.play();
        },
        pause: function() {
            this.playing = false;

            this.audio.pause();
        },
        add: function(url) {
            this.list.push(url);
        },
        remove: function(idx) {
            if(idx !== undefined) {
                this.list.splice(idx, 1);
            }
        },
        clear: function() {
            this.list.length = 0;
        },
        setList: function(list) {
            this.list = list || [];
        },
        next: function() {
            var audio = this.audio;

            audio.stop();
            this.playing = false;

            this.play(this.playedIndex + 1);
        },
        prev: function() {
            var audio = this.audio;

            audio.stop();
            this.playing = false;

            this.play(this.playedIndex -1);
        },
        loop: function() {
            this.next();
        }
    });

    Player.List = PlayList;

    return Player;
}, {
    requires: ["event"]
});