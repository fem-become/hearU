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
				'switch':''
			},
			songlist:{
				'pull':'下拉搜索歌曲',
				'release':'松开搜索歌曲',
				'switch':'切换到歌单列表'
        },
            songdetail:{
                'pull':'下拉切换到歌曲列表',
                'release':'松开切换到歌曲列表',
                'switch':'切换到歌曲列表'
			}
		};

	var scroll_config={
        hScroll: false,
        vScrollbar: false,
        lockDirection: true,
        onScrollMove:$.throttle(10, function(){
            if(HearU.current_view.isOther){
                return;
            }
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
                    if (HearU.current_view.handlePulldown && HearU.current_view.handlePulldown()) {
                        return;
                    } else if(!HearU.current_view.handlePulldown || !HearU.current_view.handlePulldown()) {
                        $('#pulldown .pull-more-label').html(PULL_BAEL[HearU.current_view.name]['switch']);
                        $('#pulldown .pull-more-wrapper').removeClass('item-create');
                        $('#pulldown').attr('data-status','2');
                    }
                }else{
                    $('#pulldown .pull-more-wrapper').addClass('item-create');
                }
            }
        }),
        onScrollEnd: $.throttle(100, function(){
            if(HearU.current_view.isOther){
                return;
            }
            
            console.log(HearU.current_view.name);
            var status=+$("#pulldown").attr('data-status');
            if(HearU.is_editing){
                return;
            }
            console.log(status);
            if(HearU.current_view.name=='songdetail'&&status){
                HearU.current_view.pullDown && HearU.current_view.pullDown();
                $("#pulldown").attr('data-status','0');
                return;
            }
            if(status==1){
//                HearU.createItem();
                HearU.current_view.inputDown && HearU.current_view.inputDown();
            }else if(status==2){
                HearU.current_view.pullDown && HearU.current_view.pullDown();
            }
            $("#pulldown").attr('data-status','0');
        }),
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
            
            this.authorize(function(id, userName) {
                window.sessionId = id;
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
                
                if(Math.abs(x) > WIN_WIDTH*0.3) {
                    this.current_view.animIcon && this.current_view.animIcon(ev, x)
                }

				if($target.hasClass('main-title')) {
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
                var check = $('.check', $target.parent()),
                    cross = $('.cross', $target.parent());
                    
                if (check && check.hasClass("pulse")) {
                    check.removeClass("animated animate-repeat pulse");
                } else if (cross && cross.hasClass('shake')) {
                    cross.removeClass("animated animate-repeat shake");
                }
            
				if(check) check[0].style['opacity'] = 0;
				if(cross) cross[0].style['opacity'] = 0;
				if (Math.abs(x) > WIN_WIDTH*0.3){
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
                if (des == "songdetail" && id == -1) {
                    HearU.requestAPI("/song/random", {userId: sessionId}, function(dt) {
                        HearU.player.setList(dt);
                        HearU.player.play(0);
                        self.switchView(des, data);
                    });
                } else if (des == "exit") {
                    if(localStorage) {
                        window.localStorage.removeItem("h_user");
                        location.reload(true);
                    }
                } else {
                    self.switchView(des, data);
                }
                
			} else if($target.hasClass("topbtn")) {
                if ($target.hasClass("appbtn")) {
                    if (self.HeaderView.opened) {
                        self.HeaderView.closeSideBar.call(self);
                    } else {
                        self.HeaderView.openSideBar.call(self);
                    }
                } else {
                    self.switchView('songdetail', {userId: -1});
                }
            } else {// if(!$target.parent().hasClass('song-list')){
                this.current_view.tap && this.current_view.tap(ev);
			}
		},

		_initEdit: function() {
			var self = this;
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
            $(".search-exit").on('click', function() {
                var self = HearU;
                console.log('click');
                $('#edit').attr('data-status','0')[0].style['-webkit-transform']='rotateX(-90deg)';
                setTimeout(function() {
                    $('.edit-wrapper').css('top','-100%');
                }, 500);
                $(self.wrapper).removeClass('shade');

                self.is_editing = false;
                self.scroll.enable();
                self.scroll.refresh();
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
                    songdetail:SongDetailView,
                    albumlist: AlbumListView
                },
                View = Views[name];

            if(!View) return;

            this.current_view = View;
            View.init(data);
            HearU.scroll.refresh();
            HearU.scroll.scrollTo(0,0);
        },

        isChildOrSelf: function(target, p) {
            return (target.closest(p).length > 0);
        },

        openSelect: function(songId, oldCollectId, cb, donecb) {
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
            var newCollectId;
            SpinningWheel.setDoneAction(function(){
                var data = this.getSelectedValues();
                newCollectId = findIdbyName(data.values);

                HearU.requestAPI("/collect/moveSong", {songId: songId, oldCollectId: oldCollectId, newCollectId: newCollectId}, function(d) {
                    //do nothing
                });
                HearU.closeSelect();
                donecb && donecb(newCollectId);
            });
            SpinningWheel.open();
            this.hasSelect = true;
            if (cb && $.isFunction(cb)) {
                cb(newCollectId);
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
            $.ajax({
                type: 'GET',
                url: url,
                data: params,
                dataType: 'json',
                success: function(data) {
                    //TODO: title变为原来的
                    if(data.isSuccess) {
                        callback(data.data);
                    }else {
                        alert("请求数据错误");
                    }
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
                    this.blur();
                }else if(keyCode == 27) {
                    self.closeSearch();
                }
            });
            
            $input.on('blur', function(ev) {
                var key = $input.val(),
                    defValue = $input.attr("defaultValue");
                
                if(key && key != defValue) {
                    self.search(key);
                    $input.attr('defaultValue', key);
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
                                if(Math.abs(distance) > WIN_WIDTH*0.3) {
                                    $('.check',$item).addClass("animated animate-repeat pulse");
                                }
                                $('.check', $item).css('opacity', distance/ITEM_HEIGHT);
                            }else{
                                if(Math.abs(distance) > WIN_WIDTH*0.3) {
                                    $('.cross',$item).addClass("animated animate-repeat shake");
                                }
                                $('.cross', $item).css('opacity', distance/ITEM_HEIGHT);
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
                        $('.cross',$target.parent()).css('opacity',0);
                        if(Math.abs(distance)>WIN_WIDTH*0.3){
                            if(distance<0){
//                                console.log('left')
//                                this.current_view.swipeLeft && this.current_view.swipeLeft(ev);
                            }else{
                                HearU.openSelect(song._id, song.collectId, null, function(collectId) {
                                    var view = HearU.current_view;
                                    if(view.name == 'songlist' 
                                        && view.metaData.collectId == collectId) {
                                        
                                        view.metaData.songs.push(song);
                                        console.log('fav the searched song', song);
                                        song.hasFavor = true;
                                        song.userId = window.sessionId;
                                        
                                        HearU.switchView('songlist', view.metaData);
                                    }
                                });
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
                        var $parent;
                        if($target.hasClass('icon-play')) {
                            $parent = $target.parent().parent();
                        }
                        if($target.hasClass('slider')) {
                            $parent = $target.parent();
                        }
                        if(!$parent || !$parent.hasClass('song')) return;
                        
                        console.log('tap', $parent);
                            
                        var index = $parent.attr('data-index'),
                            song = HearU.searchResult[index];
                        var player = HearU.player,
                            exist = false;

                        $.each(HearU.player.list, function(idx, item) {
                            if(item._id == song._id) {
                                exist = idx;
                                return false;
                            }
                        });
                        console.log(song, exist);
                        if(exist === false) {
                            player.list.push(song);
                            
                            player.play(player.list.length - 1);
                        }else {
                            player.play(exist);
                        }

                        // 重新设置列表。

                        $('.songplaying').removeClass('songplaying');
                        if(player.getPlayState()) {
                            $parent.addClass('songplaying');
                        }
                    }
                }
            }
        },
        search: function(keyword) {
            var self = this;
            HearU.requestAPI('/song/search', {key: keyword}, function(dt) {
                var data = HearU.searchResult = dt;

                var html = [];
                $.each(data, function(idx, item) {
                    html.push('<li class="song item" data-index="'+idx+'">');
                    html.push('<div class="slider">'+item.name + " - " + item.artist+'<i class="icon-play"></i></div>');
                    html.push('<span class="check sideIcon"><i class="icon-heart"></i></span>');
                    html.push('</li>');
                });

                $('.search-wrapper .songlist').html(html.join(''));
                HearU.searchScroll.refresh();
            })
        },
        openSearch: function() {
            this.closeSelect();
            this.scroll.disable();

            var $wrapper = $('.search-wrapper');
            $('.search-wrapper .songlist').html('').show();
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
                $('.search-wrapper .songlist').hide().html('');
            }

            $('.search-box input').blur();

            this.is_editing = false;
            this.scroll.enable();
            this.scroll.refresh();
        }
	}
	exports.HearU = HearU;

})(this);