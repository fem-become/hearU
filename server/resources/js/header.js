(function () {
    var config = HearU.config.WIN_WIDTH,
        width = config*0.6;

    HearU.HeaderView = {

        hearU: this,
        opened: false,

        drag: function(x) {
            if(x < 0){
                return;
            }
            $(this.header).removeClass('animate');
            $(this.wrapper).removeClass('animate');
            this.header.style['-webkit-transform'] = 'translate3d(' + x + 'px,0px,0px)';
            this.wrapper.style['-webkit-transform'] = 'translate3d(' + x + 'px,0px,0px)';
            this.sidebar.style['opacity'] = Math.min(x/width,1);
            if(x > width){
                this.sidebar.style['-webkit-transform'] = 'translate3d('+(x-width)+'px,0px,0px)';
            }
        },

        release: function(x) {
            $(this.header).addClass('animate');
            $(this.wrapper).addClass('animate');
            if (Math.abs(x) > width) {
                this.sidebar.style['-webkit-transform'] = 'translate3d(0px,0px,0px)';
                this.wrapper.style['-webkit-transform'] = 'translate3d('+width+'px,0px,0px)';
                this.header.style['-webkit-transform'] = 'translate3d('+width+'px,0px,0px)';
                this.HeaderView.opened = true;
            } else {
                this.header.style['-webkit-transform'] = 'translate3d(0px,0px,0px)';
                this.wrapper.style['-webkit-transform'] = 'translate3d(0px,0px,0px)';
            }
        },

        openSideBar: function() {
            $(this.header).addClass('animate');
            $(this.wrapper).addClass('animate');
            //$.animate(this.sidebar, {'opacity':1}, 200);
            this.sidebar.style['opacity'] = 1;
            this.sidebar.style['-webkit-transform'] = 'translate3d(0px,0px,0px)';
            this.wrapper.style['-webkit-transform'] = 'translate3d('+width+'px,0px,0px)';
            this.header.style['-webkit-transform'] = 'translate3d('+width+'px,0px,0px)';
            this.HeaderView.opened = true;
        },

        closeSideBar: function() {
            this.header.style['-webkit-transform'] = 'translate3d(0px,0px,0px)';
            this.wrapper.style['-webkit-transform'] = 'translate3d(0px,0px,0px)';
            this.HeaderView.opened = false;
        }
    }
})()