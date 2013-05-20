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

            this.scroll= new iScroll('wrapper',scroll_config);

            this.player = new window._player.List();
            
			this.wrapper=document.querySelector('#wrapper');
			this.sidebar=document.querySelector('#sidebar');
			this.header=document.querySelector('#header');
			this.edit=$('#edit');

            this.searchScroll = new iScroll('search-scroll', {
                hScroll: false,
                vScrollbar: false,
                lockDirection: true
            });

			$(this.sidebar).width(WIN_WIDTH*0.6);
			this.is_editing = false;
			//this.current_view = null;
            this.albumRecord = [];

			Hammer(document.getElementById('page'), {
	            prevent_default: true,
	            no_mouseevents: true
	        })
	        .on(all_events.join(" "), function(ev){
	        	self.handle.call(self,ev);
	        });

            //window.sessionId = -1;
            //this.switchView('albumlist', {id: 1});

            this._initEdit();
            this.initSearch();
            
            this.authorize(function(user) {
                window.sessionId = user.id;
                $('#launch').hide();
            });
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
                    data = id ? {userId: id} : {};

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
                self.current_view.onEdit && self.current_view.onEdit(ev);
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
            HearU.scroll.refresh();
        },

        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        },

        openSelect: function(songId, oldCollectId, cb) {
            if (this.hasSelect) {
                return;
            }
            //从缓存中读取歌单数据
            var data = this.albumRecord.map(function(item) {
                return item.name;
            });

            function findIdbyName(name) {
                for (var i = 0, l = HearU.albumRecord.length; i < l; i++) {
                    if (HearU.albumRecord[i].name == name) {
                        return HearU.albumRecord[i]._id;
                    }
                }
            }


            var a = {};
            $.each(data, function(index, item) {
                a[index+1] = item;
            })
            SpinningWheel.addSlot(a);

            SpinningWheel.setCancelAction(function(){
                HearU.closeSelect();
            });
            SpinningWheel.setDoneAction(function(){
                var data = this.getSelectedValues(),
                    newCollectId = findIdbyName(data.values);

                HearU.requestAPI("/collect/moveSong", {songId: songId, oldCollectId: oldCollectId, newCollectId: newCollectId}, function(d) {
                    //do nothing
                });
                HearU.closeSelect();
            });
            SpinningWheel.open();
            this.hasSelect = true;
            if (cb && $.isFunction(cb)) {
                cb();
            }
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
            url = "http://10.13.16.36:3000" + url;
            $.ajax({
                type: 'GET',
                url: url,
                data: params,
                dataType: 'json',
                success: function(data) {
                    //TODO: title变为原来的
                    callback(data.data);
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
console.log(song);
                        $('.check',$target.parent()).css('opacity', 0);
//                        $('.cross',$target.parent()).css('opacity',0);
                        if(Math.abs(distance)>WIN_WIDTH*0.6){
                            if(distance<0){
//                                console.log('left')
//                                this.current_view.swipeLeft && this.current_view.swipeLeft(ev);
                            }else{
                                HearU.openSelect(song._id, song.collectId);
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

            HearU.requestAPI('/song/search', {key: keyword}, function(dt) {
                var data = HearU.searchResult = dt;

                var html = [];
                $.each(data, function(idx, item) {
                    html.push('<li class="song item" data-index="'+idx+'">');
                    html.push('<div class="slider">'+item.name+'<i class="icon-play"></i></div>');
                    html.push('<span class="check sideIcon"><i class="icon-heart"></i></span>');
                    html.push('</li>');
                });

                $('.search-wrapper .songlist').html(html.join(''));
            })
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