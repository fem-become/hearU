(function() {
    "use strict";
// TODO remove test code
    KISSY.use('node', function(S, Node) {
        S.one('#PlayBox').css('-webkit-transform', "translate(0, 0)")
    });

    KISSY.use('widget/player, node, event', function(S, Player) {
        var playTrigger = S.get('img', '.song-cover-img');

        Player = new Player.List();

        Player.setList([
            "./audioplayer/You-And-Me.mp3",
            "./audioplayer/Behind-Blue-Eyes.mp3"
        ]);
        $(playTrigger).on('tap', function() {
            Player.play();
        });

        $('.icon-left-open').on('tap', function() {
            Player.prev();
        });

        $('.icon-right-open').on('tap', function() {
            Player.next();
        });
    });
})();