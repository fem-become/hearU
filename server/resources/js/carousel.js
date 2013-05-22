(function(which){
    function Carousel(element)
    {
        var self = this;
        element = $(element);

        var container = $(".play-list", element);
        var panes = $(".play-list-item", element);

        var pane_width = 0;
        var pane_count = panes.length;
        var current_pane = 1;

        this.init = function() {
            setPaneDimensions();

            $(window).on("load resize orientationchange", function() {
                setPaneDimensions();
            })
        };


        function setPaneDimensions() {
            pane_width = element.width();
            panes.each(function() {
                $(this).width(pane_width);
            });
            container.width(pane_width*pane_count).css('-webkit-transform','translate3d(-33.333333333333336%, 0px, 0px) scale3d(1, 1, 1)');
        };


        this.setPaneDimensions=setPaneDimensions;
        this.showPane = function( index ) {
            index = Math.max(0, Math.min(index, pane_count-1));
            current_pane = index;

            var offset = -((100/pane_count)*current_pane);
            setContainerOffset(offset, true);
        };


        function setContainerOffset(percent, animate) {
            container.removeClass("animate");

            if(animate) {
                container.addClass("animate");
            }
            container.css("-webkit-transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
        }

        this.next = function() { 
            return this.showPane(2, true); 
        };
        this.prev = function() { 
            return this.showPane(0, true); 
        };



        function handleHammer(ev) {
            ev.gesture.preventDefault();
            
            switch(ev.type) {
                case 'dragright':
                case 'dragleft':
                    $(".icon-open").hide();
                    var pane_offset = -(100/pane_count);
                    var drag_offset = ((100/pane_width)*ev.gesture.deltaX) / pane_count;

                    setContainerOffset(drag_offset + pane_offset);
                    break;

                case 'release':
                    $(".icon-open").show();
                    var dir=ev.gesture.direction;
                    if(!ev.gesture.deltaX){
                        return;
                    }
                    if(dir=='down'||dir=='up'){
                        return;
                    }
                    if(Math.abs(ev.gesture.deltaX) > pane_width/2) {
                        if(ev.gesture.direction == 'right') {
                            self.prev();
                        } else if(ev.gesture.direction=='left') {
                            self.next();
                        }
                    }
                    else {
                        self.showPane(1, true);
                    }
                    break;
                case 'tap':
                    break;
            }
        }

        Hammer(element[0],{ 
            drag_lock_to_axis: true,
            prevent_default: true,
            no_mouseevents: true }
        ).on("release dragleft dragright swipeleft swiperight tap", handleHammer);
    }

    which.Carousel=Carousel;
})(this)