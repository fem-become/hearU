(function(exports){
	var WIN_WIDTH=$(window).width(),
		WIN_HEIGHT=$(window).height(),
		ITEM_HEIGHT=62,
		SLIDER_CLASS="slider",
		ALBUM_LIST_VIEW=1,
		SONG_LIST_VIEW=2,
		PULL_BAEL={
			"AlbumListView":{
				'pull':'下拉创建新歌单',
				'release':'松开创建新歌单',
				'switch':'切换到歌曲列表'
			},
			songlist:{
				'pull':'下拉添加新歌',
				'release':'松开添加新歌',
				'switch':'切换到歌单列表'
			}
		};

	var scroll_config={
        hScroll: false,
        vScrollbar: false,
        lockDirection: true,
        onScrollMove:$.throttle(10, function(){
            $('#pulldown').show();
            if(this.y>0){
                var x=Math.abs(Math.abs(this.y)/ITEM_HEIGHT);
                if(x>1){
                    x=1;
						$('#pulldown .pull-more-label').html(PULL_BAEL[HearU.current_view.name]['release']);
                    $('#pulldown').attr('data-status','1');
                }else{
						$('#pulldown .pull-more-label').html(PULL_BAEL[HearU.current_view.name]['pull']);
                    $('#pulldown').attr('data-status','0');
                }
                $('#pulldown .pull-more-wrapper')[0].style['-webkit-transform']='rotateX('+90*(1-x)+'deg)';

                if(this.y>ITEM_HEIGHT*2){
                    $('#pulldown .pull-more-label').html(PULL_BAEL[HearU.current_view.name]['switch']);
                    $('#pulldown .pull-more-wrapper').removeClass('item-create');
                    $('#pulldown').attr('data-status','2');
                }else{
                    $('#pulldown .pull-more-wrapper').addClass('item-create');
                }
            }
        }),
        onScrollEnd:function(){
            console.log('onScrollEnd');
            var status=+$("#pulldown").attr('data-status');
            console.log(status);
            if(HearU.is_editing){
                return;
            }
            if(status==1){
//                HearU.createItem();
                HearU.current_view.inputDown && HearU.current_view.inputDown();
            }else if(status==2){
                HearU.current_view.pullDown && HearU.current_view.pullDown();
            }
            $("#pulldown").attr('data-status','0');
        },
        onRefresh:function(){

        }
    },
    scroll = null,
    //all_events=["touch", "release", "hold", "tap", "doubletap", "dragstart", "drag", "dragend", "dragleft", "dragright", "dragup", "dragdown","swipe"];
    all_events = "release hold tap drag".split(/\s+/g);

	var HearU = {

		init: function() {
			var self = this;
			this.wrapper=document.querySelector('#wrapper');
			this.sidebar=document.querySelector('#sidebar');
			this.header=document.querySelector('#header');
			this.edit=$('#edit');
			this.scroll= new iScroll('wrapper',scroll_config);

            this.searchScroll = new iScroll('search-scroll', {
                hScroll: false,
                vScrollbar: false,
                lockDirection: true
            });

			$(this.sidebar).width(WIN_WIDTH*0.6);
			this.is_editing = false;
			this.current_view = null;
            this.albumRecord = [];

			Hammer(document.getElementById('page'), {
	            prevent_default: true,
	            no_mouseevents: true
	        })
	        .on(all_events.join(" "), function(ev){
	        	self.handle.call(self,ev);
	        });

            this.player = new window._player.List();

            window.sessionId = -1;
            this.switchView('albumlist', {id: 1});

            this._initEdit();
            this.initSearch();
		},

		handle:function(ev){
			if(this.is_editing){
				//$('#edit input').blur();
				return false;
			}
			var self=this;
			switch(ev.type){
				case 'drag':
					self._drag(ev); 
					break;
				case 'release':
					self._release(ev);
					break;
				case 'hold':
					self._hold(ev);
					break;
				case 'tap':
					self._tap(ev);
					break;
			}
		},

		_drag: function(ev){
			var self = this,
				gesture = ev.gesture,
				x = gesture.deltaX,
				$target = $(ev.target);

			if(!$target.hasClass(SLIDER_CLASS)){
                if($target.hasClass('icon-play')) {
                    ev.gesture.stopDetect();
                }
				return;
			}

            var $item = $target.parent();
			$target.removeClass('animate');
			if (gesture.direction == 'left' || gesture.direction == 'right'){
				self.scroll.disable();

				if($target.hasClass('main-title')){
					self.HeaderView.drag.call(self,x);
				}else{
					$target.css('-webkit-transform', 'translate3d(' + x + 'px,0px,0px)');

                    if(this.current_view.handleIcon && this.current_view.handleIcon(ev, x)) {
                        return;
                    }

                    if(x > 0) {
		            	$('.check', $item).css('opacity', x/ITEM_HEIGHT);
		            } else {
		            	$('.cross', $item).css('opacity', -x/ITEM_HEIGHT);
		            }
				}
			}
		},

		_release:function(ev){
			var self=this;
				gesture=ev.gesture,
				x=gesture.deltaX,
				target=ev.target;
			self.scroll.enable();
			if(target.className.indexOf(SLIDER_CLASS)==-1){
				return;
			}
			var $target=$(target);
			$target.addClass('animate');

            if ($target.hasClass('main-title')){
				self.HeaderView.release.call(self,x);
			} else if ($target.hasClass('side-bar')){
				if(gesture.direction=='left'){
					self.HeaderView.release.call(self,-1);
				}
			} else {
				$('.check', $target.parent())[0].style['opacity'] = 0;
				$('.cross', $target.parent())[0].style['opacity'] = 0;
				if (Math.abs(x) > WIN_WIDTH*0.6){
					if(x < 0){
                        this.current_view.swipeLeft && this.current_view.swipeLeft(ev);
		            }else{
                        this.current_view.swipeRight && this.current_view.swipeRight(ev);
		            }
				} else {
					target.style['-webkit-transform']='translate3d(0px,0px,0px)';
				}
			}
		},

		_hold: function(ev){
			this.current_view.hold && this.current_view.hold(ev);
		},

		_tap: function(ev){
			var self = this,
				gesture = ev.gesture,
				x = gesture.deltaX,
				target = ev.target,
				$target = $(target);

			if (this.isChildOrSelf($target, $(".my-menu"))) {
                $target = target.tagName.toUpperCase() == "LI" ? $(target) : $(target).parent();
                var des = $target.data("des"),
                    id = $target.data("id"),
                    data = id ? {id: id} : {};

                self.HeaderView.closeSideBar.call(self);
                self.switchView(des, data);
			} else if($target.hasClass("topbtn")) {
                if ($target.hasClass("appbtn")) {
                    if (self.HeaderView.opened) {
                        self.HeaderView.closeSideBar.call(self);
                    } else {
                        self.HeaderView.openSideBar.call(self);
                    }
                } else {
                    self.openSelect();
                }
            } else {// if(!$target.parent().hasClass('song-list')){
                this.current_view.tap && this.current_view.tap(ev);
			}
		},

		_initEdit: function() {
			var self=this;
			this.edit.on('webkitTransitionEnd',function(ev){
				if(+$(this).attr('data-status')){
					$(this).find('input').focus();
				}else{
					$(this).find('input').val('');
				}
			})
			$('#edit input').on('blur', function(ev) {
                self.current_view.onEdit(ev);
            })
			.on('keydown',function(ev){
				if(ev.keyCode==13){
					this.blur();
				}
			})
			.on('focus',function(){
				this.value='';
			});
		},

		createItem: function(){
			if(this.is_editing){
				return;
			}
			this.is_editing = true;
			this.scroll.disable();
			$(this.wrapper).addClass('shade');
			$('.edit-wrapper').css('top',0);
			setTimeout(function(){
				$('#edit').attr('data-status','1')[0].style['-webkit-transform']='rotateX(0deg)';
				//$('#edit input').focus();
			},10);
			$(this.wrapper).addClass('shade');
		},

        switchView: function(name, data) {
            var Views = {
                    songlist: SongListView,
                    albumlist: AlbumListView
                },
                View = Views[name];

            if(!View) return;

            this.current_view = View;
            View.init(data);
        },

        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        },

        openSelect: function(songId, oldCollectId) {
            if (this.hasSelect) {
                return;
            }
            //TODO: 从缓存中拿取我的歌单
            var data=["\u5f3a\u529b\u52b2\u7206DJ\u821e\u66f2","\u7f51\u7edc\u6b4c\u66f2\u60c5\u7f18","\u4e2d\u56fd\u98ce\uff0c\u4e2d\u56fd\u60c5","\u5218\u5fb7\u534e20\u5e74\u7ecf\u5178\u91cd\u73b0","\u51c0\u5316\u5fc3\u7075\u7684\u897f\u85cf\u8f7b\u97f3\u4e50","\u5206\u624b\u9700\u8981\u7ec3\u4e60\u7684","\u6b4c\u58f0\u5e26\u4f60\u8d70\u8fc7\u7eff\u610f","\u6211\u5728\u65e7\u65f6\u5149\u4e2d\u56de\u5fc6\u4f60","\u9ec4\u9711\u914d\u4e50\u9ec4\u98de\u9e3f\u7cfb\u5217\u7535\u5f71\u539f\u58f0","\u8c22\u8c22\u8fd9\u4e9b\u6b4c\u90c1\u95f7\u65f6\u966a\u7740\u6211","\u542c\u8d77\u6765\u4f60\u5f88\u5f00\u5fc3","\u5728\u8eab\u5fc3\u75b2\u60eb\u65f6\uff0c\u628a\u81ea\u5df1\u878d\u5165\u6b4c\u58f0","\u90fd\u66fe\u53cd\u590d\u64ad\u653e\u7684\u6b4c","\u5b89\u9759\u65f6\u5149\uff0c\u9759\u542c\u4e00\u9996\u56fd\u8bed\u6b4c","\u5982\u679c\u4f60\u770b\u89c1\uff0c\u8fd9\u4e9b\u6b4c\u7ed9\u4f60\u542c","\u6bcf\u4e2a\u4eba\u7684\u5185\u5fc3\u90fd\u662f\u5b64\u72ec","\u4f24\u611f\u6c38\u8fdc\u53ea\u7559\u7ed9\u81ea\u5df1","\u671f\u5f85\u7740\u7684\u6e29\u6696\u6b4c\u58f0","\u597d\u542c\u7684\u7535\u5b50\u6c1b\u56f4\u97f3\u4e50","\u4e0d\u540c\u611f\u89c9\u7684\u7235\u58eb\u8bf4\u5531","\u8ba9\u4eba\u653e\u677e\u7684\u7235\u58eb\u4e50","\u4e0d\u673d\u7684\u91d1\u5c5e\u4e4b\u58f0","\u6d41\u884c\u821e\u66f2\u91d1\u66f2\u9009","\u8d85\u9177\u725b\u4ed4\u4e61\u6751\u97f3\u4e50\u7cbe\u9009","\u9c8d\u52c3\u8fea\u4f26\u6c11\u8c23\u6b4c\u66f2\u9009","\u795e\u79d8\u7684\u975e\u6d32\u97f3\u4e50\u8f91","\u53e4\u5178\u97f3\u4e50\u5927\u5408\u5531","\u597d\u542c\u4eba\u6c14RNB\u5973\u58f0\u6b4c\u66f2","\u597d\u542c\u624b\u98ce\u7434\u4e50\u66f2\u9009"];
            var a = {};
            $.each(data, function(index, item) {
                a[index+1] = item;
            })
            SpinningWheel.addSlot(a);

            SpinningWheel.setCancelAction(function(){
                HearU.closeSelect();
            });
            SpinningWheel.setDoneAction(function(){
                var data = this.getSelectedValues();
                global.HearU.requestAPI("/collect/moveSong", {songId: songId, oldCollectId: oldCollectId, newCollectId: newCollectId}, function(d) {
                    //do nothing
                });
                HearU.closeSelect();
            });
            SpinningWheel.open();
            this.hasSelect = true;
        },

        closeSelect: function() {
            if (this.hasSelect) {
                SpinningWheel.close();
                setTimeout(function() {
                    SpinningWheel.destroy();
                }, 600);
                this.hasSelect = false;
            }
        },

        requestAPI: function(url, params, callback) {
            //TODO: modify title
            $.ajax({
                type: 'GET',
                url: url,
                data: params,
                dataType: 'json',
                success: function(data) {
                    //TODO: title变为原来的
                    callback(data);
                },
                error: function() {
                    //TODO: 提示失败
                }
            });
        },
        setTitle: function(text) {
            $('.main-title').html(text);
        },
        initSearch: function() {
            var $input = $('#editbox'),
                self = this;

            $input.on('keydown', function(ev) {
                var keyCode = ev.keyCode;
                if(keyCode == 13) {
                    self.search($input.val());
                }else if(keyCode == 27) {
                    self.closeSearch();
                }
            });

            $('.search-box').on('webkitTransitionEnd',function(ev){
                $(this).find('input').focus();
            })

            $('.icon-cancel').on('tap', function(ev) {
                self.closeSearch();
            });

            self.closeSearch();

            Hammer($('.search-wrapper')[0], {
                prevent_default: false,
                no_mouseevents: true
            }).on(all_events.join(" "), function(ev){
                    searchHandle.call(self,ev);
                });

            function searchHandle(ev) {
                var gesture = ev.gesture,
                    distance = gesture.deltaX,
                    direction = gesture.direction,
                    $target = $(ev.target);

                switch(ev.type) {
                    case 'drag': {

                        if(!$target.hasClass(SLIDER_CLASS)){
//                            if($target.hasClass('icon-play')) {
////                                ev.gesture.stopDetect();
//                            }
                            return;
                        }

                        var $item=$target.parent();
                        $target.removeClass('animate');
                        if(direction == 'left' || direction=='right'){
                            self.searchScroll.disable();
                            $target.css('-webkit-transform', 'translate3d(' + distance + 'px,0px,0px)');
                            if(distance > 0){
                                $('.check',$item).css('opacity',distance/ITEM_HEIGHT);
                            }else{
                                $('.cross',$item).css('opacity',-distance/ITEM_HEIGHT);
                            }
                        }
                    }
                        break;
                    case 'release': {
                        $('.search-box input').blur();
                        self.scroll.enable();
                        if(!$target.hasClass(SLIDER_CLASS)){
                            return;
                        }
                        $target.addClass('animate');
                        var $parent = $target.parent(),
                            index = $parent.attr('data-index'),
                            song = this.searchResult[index];

                        $('.check',$target.parent()).css('opacity', 0);
//                        $('.cross',$target.parent()).css('opacity',0);
                        if(Math.abs(distance)>WIN_WIDTH*0.6){
                            if(distance<0){
//                                console.log('left')
//                                this.current_view.swipeLeft && this.current_view.swipeLeft(ev);
                            }else{
                                HearU.openSelect(song.songId, song.collectId);
//                                console.log('open select', song.userId, song.collectId);
//                                this.current_view.swipeRight && this.current_view.swipeRight(ev);
                            }

                        }
                        $target.css({
                            '-webkit-transform':'translate3d(0px,0px,0px)'
                        });
                    }
                        break;
                    case 'tap': {
                        if($target.hasClass('icon-play')) {
                            var $parent = $target.parent().parent(),
                                index = $parent.attr('data-index'),
                                song = this.searchResult[index];
                            var player = HearU.player,
                                exist = false;
                            $.each(this.searchResult, function(idx, item) {
                                if(item.songId == song.songId) {
                                    exist = true;
                                    return false;
                                }
                            });
                            if(!exist) {
                                player.list.push(song);
                            }
                            player.play(player.list.length - 1);

                            // 重新设置列表。

                            $('.songplaying').removeClass('songplaying');
                            if(player.playing) {
                                $parent.addClass('songplaying');
                            }
                        }
                    }
                }
            }
        },
        search: function(keyword) {
            var data = this.searchResult = [{
                name: "test",
                userId: "123",
                collectId: "222",
                songId: "333",
                src: "./resource/Behind-Blue-Eyes.mp3"
            }];

            var html = [];
            $.each(data, function(idx, item) {
                html.push('<li class="song item" data-index="'+idx+'">');
                html.push('<div class="slider">'+item.name+'<i class="icon-play"></i></div>');
                html.push('<span class="check sideIcon"><i class="icon-heart"></i></span>');
                html.push('</li>');
            });

            $('.search-wrapper .songlist').html(html.join(''));
        },
        openSearch: function() {
            this.closeSelect();
            this.scroll.disable();

            var $wrapper = $('.search-wrapper');

            $('.search-box').removeClass('animated bounceOutUp').addClass('animated bounceInDown')

            $wrapper.show();
            $('.shim').show();

            setTimeout(function() {
                $('.search-box input').val('')[0].focus();
            }, 500)
        },
        closeSearch: function() {
            this.closeSelect();
            if($('.search-box').hasClass('bounceInDown')) {
                $('.search-box').removeClass('animated bounceInDown').addClass('animated bounceOutUp')
                setTimeout(function(){
                    $('.search-wrapper').hide();
                }, 1000);
                $('.shim').hide();
                $('.search-wrapper .songlist').html('');
            }

            $('.search-box input').blur();

            this.is_editing = false;
            this.scroll.enable();
            this.scroll.refresh();
        }
	}
	exports.HearU = HearU;

})(this);