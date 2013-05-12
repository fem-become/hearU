(function(exports){
	var WIN_WIDTH=$(window).width(),
		WIN_HEIGHT=$(window).height(),
		ITEM_HEIGHT=62;
		SLIDER_CLASS="slider",
		ALBUM_LIST_VIEW=1,
		SONG_LIST_VIEW=2,
		PULL_BAEL={
			1:{
				'pull':'下拉创建新歌单',
				'release':'松开创建新歌单',
				'switch':'切换到歌曲列表'
			},
			2:{
				'pull':'下拉添加新歌',
				'release':'松开添加新歌',
				'switch':'切换到歌单列表'
			}
		};

	var scroll_config={
			hScroll:false,
			vScrollbar:false,
			lockDirection:true,
			onScrollMove:$.throttle(10, function(){
				$('#pulldown').show();
				if(this.y>0){
					var x=Math.abs(Math.abs(this.y)/ITEM_HEIGHT);
					if(x>1){
						x=1;
						$('#pulldown .pull-more-label').html(PULL_BAEL[HearU.current_view+'']['release']);
						$('#pulldown').attr('data-status','1');
					}else{
						$('#pulldown .pull-more-label').html(PULL_BAEL[HearU.current_view+'']['pull']);
						$('#pulldown').attr('data-status','0');
					}
					$('#pulldown .pull-more-wrapper')[0].style['-webkit-transform']='rotateX('+90*(1-x)+'deg)';

					if(this.y>ITEM_HEIGHT*2){
						$('#pulldown .pull-more-label').html(PULL_BAEL[HearU.current_view]['switch']);
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
					HearU.createItem();
				}else if(status==2){
					if(HearU.current_view==SONG_LIST_VIEW){
						HearU.showAlbum();

					}
				}
				$("#pulldown").attr('data-status','0');
			},
			onRefresh:function(){

			}
		},
		scroll=null,
		//all_events=["touch", "release", "hold", "tap", "doubletap", "dragstart", "drag", "dragend", "dragleft", "dragright", "dragup", "dragdown","swipe"];
        all_events = "release hold tap drag".split(/\s+/g);

	var data=['强力劲爆DJ舞曲','网络歌曲情缘','中国风，中国情','刘德华20年经典重现','净化心灵的西藏轻音乐','分手需要练习的','歌声带你走过绿意','我在旧时光中回忆你','黄霑配乐黄飞鸿系列电影原声','谢谢这些歌郁闷时陪着我','听起来你很开心','在身心疲惫时，把自己融入歌声','都曾反复播放的歌','安静时光，静听一首国语歌','如果你看见，这些歌给你听','每个人的内心都是孤独','伤感永远只留给自己','期待着的温暖歌声','好听的电子氛围音乐','不同感觉的爵士说唱','让人放松的爵士乐','不朽的金属之声','流行舞曲金曲选','超酷牛仔乡村音乐精选','鲍勃迪伦民谣歌曲选','神秘的非洲音乐辑','古典音乐大合唱','好听人气RNB女声歌曲','好听手风琴乐曲选'];
	function get_list(){
		var html=[], i = 0;
		$.each(data,function(index,item){
            if (i++ == 0) {
                html.push('<li class="song past item songplaying" data-index='+(index+1)+'><div class="slider">'+item+'<i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
            } else {
			    html.push('<li class="song past item" data-index='+(index+1)+'><div class="slider">'+item+'<i class="icon-play"></i></div><span class="check sideIcon"><i class="icon-heart"></i></span><span class="cross sideIcon"><i class="icon-trash"></i></span></li>');
            }
        });
		return html.join('');
	}

	var HearU={
		init:function(){
			var self=this;
			this.wrapper=document.querySelector('#wrapper');
			this.sidebar=document.querySelector('#sidebar');
			this.header=document.querySelector('#header');
			this.edit=$('#edit');
			this.scroll= new iScroll('wrapper',scroll_config);

			$(this.sidebar).width(WIN_WIDTH*0.6);
			this.is_editing=false;
			this.current_view=ALBUM_LIST_VIEW;
			Hammer(document.getElementById('page'), {
	            prevent_default: true,
	            no_mouseevents: true
	        })
	        .on(all_events.join(" "), function(ev){
	        	self.handle.call(self,ev);
	        });

	        this._initEdit();

            this.switchView('songlist');
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
		_drag:function(ev){
			var self=this;
				gesture=ev.gesture,
				x=gesture.deltaX,
				target=ev.target;

			if(target.className.indexOf(SLIDER_CLASS)==-1){
				return;
			}
			var $target=$(target),$item=$target.parent();
			$target.removeClass('animate');
			if(gesture.direction=='left'||gesture.direction=='right'){
				self.scroll.disable();
				if($target.hasClass('main-title')){
					self.HeaderView.drag.call(self,x);
				}else{
					target.style['-webkit-transform']='translate3d(' + x + 'px,0px,0px)';
					if(x>0){
		            	$('.check',$item).css('opacity',x/ITEM_HEIGHT);
		            }else{
		            	$('.cross',$item).css('opacity',-x/ITEM_HEIGHT);
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

            if($target.hasClass('main-title')){
				self.HeaderView.release.call(self,x);
			}else if($target.hasClass('side-bar')){
				if(gesture.direction=='left'){
					self.HeaderView.release.call(self,-1);
				}
			}
			else{
				$('.check',$target.parent())[0].style['opacity']=0;
				$('.cross',$target.parent())[0].style['opacity']=0;
				if(Math.abs(x)>WIN_WIDTH*0.6){
					if(x<0){
//		                target.style['-webkit-transform']='translate3d(-100%,0px,0px)';
                        this.currentView.swipeLeft(ev);
		            }else{
//		                target.style['-webkit-transform']='translate3d(100%,0px,0px)';
                        this.currentView.swipeRight(ev);
		            }
//	            	setTimeout(function(){
//		                $target.parent().remove();
//		                setTimeout(function () {
//							self.scroll.refresh();
//						}, 0);
//		            },300);
				}else{
					target.style['-webkit-transform']='translate3d(0px,0px,0px)';
				}
			}
		},
		_hold:function(ev){
			alert('hold event!');
		},
		_tap:function(ev){
			var self=this;
				gesture=ev.gesture,
				x=gesture.deltaX,
				target=ev.target,
				$target=$(target);
			if($target.hasClass('pull-up')){

			}else if(!$target.parent().hasClass('song-list')){
                if(!$target.hasClass("song")) {
                    $target = $target.parent(".song");
                }

                SongListView.tap(ev, self.scroll);
				return;
			}
            return;

	    	this.scroll.scrollTo(0,0);
	    	this.current_view=SONG_LIST_VIEW;
	    	// var xx=target.offset().top-$('#header').height();
	    	// li[0].style['z-index']=li.attr('data-index');
	    	// li[0].style['-webkit-transform']='translate3d(0px,'+(-xx)+'px,0px)';
	    	$('#mainlist').html(get_list()).addClass('curl').removeClass('flip');

	    	var list=$('#mainlist li');
	    	list.each(function (index,item) {
                if(index*ITEM_HEIGHT<WIN_HEIGHT){
                    setTimeout(function(){
                        $(item).removeClass('past');
                    },150*(index+1));
                }else{
                    $(item).removeClass('past');
                }
		    });
		},
		render:function(data,view){
			var self=this;
			this.scroll.disable();
			this.current_view=ALBUM_LIST_VIEW;
		},
		showAlbum:function(){
			console.log('showAlbum');
			var self=this;
			//this.scroll.scrollTo(0,0);
			this.scroll.disable();
	    	this.current_view=ALBUM_LIST_VIEW;
	    	// var xx=target.offset().top-$('#header').height();
	    	// li[0].style['z-index']=li.attr('data-index');
	    	// li[0].style['-webkit-transform']='translate3d(0px,'+(-xx)+'px,0px)';
	    	$('#mainlist').html(get_list()).attr('class','flip');
	    	var list=$('#mainlist li');
	    	list.each(function (index,item) {
					if(index*ITEM_HEIGHT<WIN_HEIGHT){
						setTimeout(function(){
							$(item).removeClass('past');
						},150*(index+1));
					}else{
						$(item).removeClass('past');
						self.scroll.enable();
						self.scroll.refresh();
					}	
		    });
		},
		_initEdit:function(){
			var self=this;
			this.edit.on('webkitTransitionEnd',function(ev){
				if(+$(this).attr('data-status')){
					$(this).find('input').focus();
				}else{
					$(this).find('input').val('');
				}
			})
			$('#edit input').on('blur',function(){
				console.log('blur');
				$('#edit').attr('data-status','0')[0].style['-webkit-transform']='rotateX(-90deg)';
				setTimeout(function(){
					$('.edit-wrapper').css('top','-100%');
				},500);
				$(self.wrapper).removeClass('shade');
				
				if($.trim(this.value)){
					self.addItem(this.value);
					
				}
				self.is_editing=false;
				// self.scroll.scrollTo(0,0);
				self.scroll.enable();
				self.scroll.refresh();
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
		addItem:function(item){
			var item=$(['<li class="past song-list item" style="z-index:0;">',
							'<div class="slider">',
								item,
							'</div>',
							'<img class="check" src="images/check.png">',
							'<img class="cross" src="images/cross.png">',
						'</li>'].join(''));
			$('#mainlist').prepend(item);
			setTimeout(function(){
				item.removeClass('past');
			},0);
		},
		createItem:function(){
			if(this.is_editing){
				return;
			}
			this.is_editing=true;
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

                },
                View = Views[name];

            if(!View) return;

            this.currentView = View;

            var html = View.getHTML();

            // ake
            // var xx=target.offset().top-$('#header').height();
            // li[0].style['z-index']=li.attr('data-index');
            // li[0].style['-webkit-transform']='translate3d(0px,'+(-xx)+'px,0px)';
            //$('#mainlist').html(get_list()).addClass('curl').removeClass('flip');
            $('#mainlist').html(html);
            View.onInitRender(data);
        }
	}
	exports.HearU=HearU;
})(this);