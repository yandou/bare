$(function() {
	
	var base_api_url = 'http://api.juewei.com/';

	function setWeixinShare(wx_config){
		var targetUrl = encodeURI(location.toString().split('#')[0]);

		$.get(base_api_url + 'service.php', {"url": targetUrl}, function(resp) {

			wx.config({
				debug: false,
				appId: resp.data.appid,
				timestamp: resp.data.timestamp,
				nonceStr: resp.data.rand,
				signature: resp.data.sha1,
				jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage']
			});
			
			wx.ready(function(){				
				// 分享到朋友
				wx.onMenuShareAppMessage({
					title: wx_config.title,
					desc: wx_config.desc,
					link: wx_config.link,
					imgUrl: wx_config.imgUrl
				});
				// 分享到朋友圈
				wx.onMenuShareTimeline({
					title: wx_config.title,
					desc: wx_config.desc,
					link: wx_config.link,
					imgUrl: wx_config.imgUrl
				});
			});
		}, 'json')
	}

	//分享配置
	var wx_config = {
		link: "http://" + location.host + "H5/airline_stewardess/index.html",
		imgUrl: 'http://'+location.host+'/H5/airline_stewardess/images/share_img.png',
		title: "简单粗暴说爱我，让我为你买次单",
		desc: "她们要买什么单？"
	};
	
	setWeixinShare(wx_config);

	var loadImg = function(url, callbackFn) {
		
		var _img = new Image();
		_img.onload = function() {
			callbackFn && typeof callbackFn === 'function' && callbackFn();
		}
		_img.src = url;
	};
	
	(function() {
		
		if (!$('.swiper-container').length) return false;
		
		var getInfo = function() {
			
			var _screen = window.screen;
			return {
				w: _screen.availWidth,
				h: _screen.availHeight
			}
		};
		
		var getHash = function() {
			
			var _hash = window.location.hash			
			return _hash !== '' ? _hash.replace('#', '') : false;
		};
		
		//来源
		var checkSource = function() {
			
			var _hash = getHash();
			var _box = $('.select_box');
			var _eles = _box.find('p');
			var _len = _eles.length;
			var _info = getInfo();
			
			var setValue = function() {
				var _width = Math.floor(_info.w / 2);
				var _height = Math.floor(_info.h / 3);
				var _that = $(this);
				var _index = (_that.index() + 1);
				_that.css({
					width: _width,
					height: _height,
					left: (((_index % 2) === 0) ? _width : 0),
					top: Math.floor((_index -1) / 2) * _height

				});
			};
			
			var eventDo = function() {
				var _index = $(this).index();
				_box.animate({opacity:0}, 200).css('display','none');					
				$(swiper.bullets).eq(_index).trigger('click');
			};
			
			var closeLoading = function() {
				var _loading = $('.loading');
				_loading.animate({opacity:0}, 200).css('display','none');			
			};
						
			_eles.each(function() {
				setValue.call(this);
			});
			_eles.on('click', eventDo);
			
			var checkFn = function() {
				if (!_hash) {
					
					var _url = _box.attr('data-src');
					var _call = function() {
						_box.css('background-image', 'url(' + _url + ')');
						_box.removeAttr('data-src');
						closeLoading();
					};
					
					loadImg(_url, _call);
				} else {
					
					_eles.eq(_hash).trigger('click');
					closeLoading();
				}
			}

			window.setTimeout(checkFn, 2000);
			
		};
				
		//滚屏
		if (typeof Swiper === 'function') {
			
			var swiper = new Swiper('.swiper-container', {
				pagination: '.swiper-pagination',
				paginationClickable: true,
				lazyLoading : true,
				direction: 'vertical',
				onSlideChangeStart: function(swiper){
					var _currentIndex = swiper.activeIndex;
					var _slides = swiper.slides;
					
					if (_ele) {
						pauseNow();
					}
				}
			});
		}
				
		checkSource();
		
		var _play = $('.mask_box');
		var _videos = $('.my_video');
		var _spaceTime = 400;
		var _video;
		var _vd;
		var _img;
		var _ele;	
		var _left;
		var textStartRun = function() {
			
			var that = $(this);
			
			var run = function() {
				return function() {
					
					if (_ele.timer) {
						var $first = that.find('li').eq(0);
						that.append($first);
						_ele.timer = window.setTimeout(arguments.callee, _spaceTime);
					}
				};
			};
			
			_ele.timer = window.setTimeout(run.call(that.get(0)), _spaceTime);
		};
		
		var playNow = function() {
			
			$(_ele).animate({opacity:0}, 200);
			_img.animate({opacity:0}, 200);
			_vd.css('left',0);
			_ele.flag = true;
			_video.play();
			textStartRun.call(this);
			
		};
		
		var pauseNow = function() {
			
			$(_ele).animate({opacity:1}, 200);
			_img.animate({opacity:1}, 200);
			_vd.css('left', _left);
			_ele.flag = false;	
			_video.pause();			
			window.clearTimeout(_ele.timer);
			_ele.timer = null;
			_ele = '';
		};
		
		//视频
		var playVideo = function() {
			
			var that = $(this);
			$ele = that;
			_ele = this;
						
			if (this.flag === undefined || this.flag === false) {				
				var _cnt = that.next();
				_vd = that.prev();
				_video = _vd.find('.my_video').get(0);	
				_left = _vd.css('left');				
				_img = _cnt.find('.swiper-lazy').eq(0);
				_txt = _cnt.find('.list_ele').get(0);			
				
				playNow.call(_txt);
			}

		};
		
		var playOver = function() {
			
			pauseNow();
			_video.currentTime = 0;
		};
		
		_play.each(function() {
			
			var _that = $(this);			
			_that.on('click', playVideo);
		});
		
		_videos.each(function() {
			
			var _that = $(this);
			_that.on('ended', playOver)
		});
		
		//分享
		var shareTips = function() {
			
			var _ele = $('#tips');
			var closeTips = function() {
				$(this).animate({opacity:0}, 200, function() {$(this).hide();});				
			};
			
			if (_ele.length) {
				_ele.show();
				_ele.animate({opacity:1}, 200);
			} else {
				_ele = document.createElement('div');				
				_ele.id = 'tips';
				document.body.appendChild(_ele);
				_ele = $(_ele);
				_ele.show();
				_ele.animate({opacity:1}, 200);
				_ele.on('click', closeTips);				
			}
		};
		
		//赞
		var likeIt = function() {
			
			var _ele = $('#likeit');
			var _play = function() {
				_ele.show();
				_ele.animate({opacity:0}, 1000, function() {
					$(this).hide();
					$(this).css('opacity', 1);
				});	
			};
			
			if (!_ele.length) {
				_ele = document.createElement('div');				
				_ele.id = 'likeit';
				document.body.appendChild(_ele);
				_ele = $(_ele);			
			}		
			
			_play();
		};
		
		$('body').on('click', '.share_img', shareTips);
		$('body').on('click', '.praise_img', likeIt);
	})();
	
	(function() {
		
		if (!$('.share_bd').length) return false;
		
		var imgNum = 0;
		var loadAllImg = function() {
			var flag = false;
			var len = 149;
			
			var imgAdd = function() {
				imgNum++;
				
				if (imgNum === len) {
					loadImgCallBack();
				}
			}
			for (var i = 1; i <= len; i++) {
				
				if (i == len) {
					loadImg('images/' + i + '.png', imgAdd);
				} else {
					if (i > 134 && i< 150) {						
						loadImg('images/' + i + '.png', imgAdd);
					} else {						
						loadImg('images/' + i + '.jpg', imgAdd);
					}					
				}				
			}
			
		};
		
		var loadImgCallBack = function() {			
			var $share_bg = $('.share_animate');
			var $loading = $('.share_loading');
			var $content = $('.share_content');			
			$loading.hide();
			$content.show();
			eleAnimate($share_bg, changeImage);			
		};
		
		loadAllImg();
		
		var $continu = $('#continu');
		
		var _img_ele;
		
		//动画
		var eleAnimate = function($ele, _fn) {
			
			var _start = parseInt($ele.attr('data-start'));
			var _end = parseInt($ele.attr('data-end'));
			var _duration = parseInt($ele.attr('data-duration'));
			var _spaceTime = _duration / (_end - _start + 1);
			var _ele = $ele.get(0);		
				_img_ele = _ele;
			
			var setAnimate = function(_fn) {
				
				return function() {

					if (_start >= _end) {
						window.clearTimeout(_ele.timer);
						_ele.timer = null;
						_ele.currentTime = 0;
						
						if (document.body.continu === undefined) {
							//$continu.show();
							window.setTimeout(function() {
								$continu.trigger('click');
							}, 1000);							
						}
						
					} else {						
						_start++
						_ele.current = _start;						
						_fn.call(_ele);
						_ele.timer = window.setTimeout(arguments.callee, _spaceTime);
					}
				}
			};
			_ele.timer = window.setTimeout(setAnimate(changeImage), _spaceTime);
		};
		
		var changeImage = function(_that_img) {
			$(_img_ele).find('img').eq(0).get(0).setAttribute('src', 'images/' + this.current + '.jpg');
		};
		
		//场景切换
		var changeScene = function() {
			
			if (this.step === undefined) {
				this.step = 2;
			}
			
			var change = function() {
				var $current = $('.step_' + this.step);				
				var $prev = $('.step_' + (this.step -1));				
				$prev.hide();
				$(this).hide();
				$current.show();
			};
			
			if (this.step == 2) {
				
				var $share_bg = $('.share_animate_1');
				var _getTicket = function() {
					$continu.trigger('click');
				};
				
				change.call(this);
				eleAnimate($share_bg, changeImage);
				document.body.continu = 1;
				$('.eles_box img').addClass('animated');
				/*
				window.setTimeout(function(){
					$continu.find('.btn_add').html('点我，去抢优惠券');
					$continu.show();
				},2500);
				*/
				$('#getTicket').bind('click', _getTicket);
			}
			
			if (this.step == 3) {
				
				var $share_bg = $('.share_animate_2');
				change.call(this);
				eleAnimate($share_bg, changeImage);
				document.body.continu = 1;
				$('.last_box img').addClass('animated');	
				window.setTimeout(function() {
					$('.last_box').animate({left: '5%'}, 200);
				}, 1500);
			}
			
			this.step++;			
			
		};
		
		$continu.on('click', changeScene)
		
		//验证		
		var $rule_des = $('#ruleDes');			
		var $btn_get = $('#getCode');
		var $btn_sub = $('#submitValue');
		var $txt_phone = $('.phone_txt');
		var $txt_code = $('.code_txt');
		var $btn_share = $('.share_img');
		var $btn_close = $('.pop_close');
		var $btn_user = $('#userCoupon');
		var _list = $('.form_list');
		var _list_box = _list.next();
		var code_url = base_api_url + 'api/ShakeRuleNew/second';
		var coupons_url = base_api_url + 'api/CouponsActivity/getCoupons';
		var checkResult = 0;
		var flag = true;
		var countTime = 60;
		var animateTime = 200;
		var tag = 'DTXB';
		var channel = 'BJDTXB';
		var timer;   
		
		var selectShow = function() {
			var _localValue = localStorage.getItem('getStatus');			
			if (typeof _localValue === 'string' && parseInt(_localValue) === 1) {
				_list_box.show();
			} else {
				_list.show();
			}
		};
		
		selectShow();
		
		var strTrim = function(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		};
		
		var isEmpty = function() {
			var val = strTrim(this.value);
			return val == '' ? true: false;
		};

		var isPhoneNumber = function() {
			var val = strTrim(this.value);
			return val.length == 11 && /^((13|14|15|17|18)+\d{9})$/.test(val) ? true: false;
		};
		
		var isValidNumber = function() {
			var val = Number(strTrim(this.value));
			return isNaN(val) ? false : true;
		};
		
		var isValidCode = function() {        
			return isValidNumber.call(this) && this.value.length === 4;
		};
		
		//验证表单
		var checkValue = function(current_ele) {
			
			var $that = $(current_ele);
			var $result = $that.siblings('.check_value');
			var ele = $that.get(0);
			
			if (isEmpty.call(ele)) {
				alert(ele.getAttribute('placeholder'));
				return false;
			}
			
			if ($that.attr('data-phone') == 'true' && !isPhoneNumber.call(ele)) {
				alert('请输入有效手机号');				
				return false;
			}
			
			if ($that.attr('data-code') == 'true' && !isValidCode.call(ele)) {
				alert('请输入有效验证码');
				return false;
			}
			
			return true;
		};
		
		var ajaxError = function() {
			alert("网络不给力")
			
		}
		
		//请求验证码
		var sendRequest = function(_val) {
			
			var _random = '?t=' + (new Date().getTime());
			var param = {
				url: code_url + _random,
				type: 'post',
				data: {mobile: _val},				
				error: ajaxError
			}
			
			$.ajax(param);
			
		};
		
		//更改时间
		var changeTime = function() {
			
			var that = $(this);
			var timeValue = countTime;
			var _val = $txt_phone.val();
			
			sendRequest(_val);
			
			return function() {
				if (countTime > 0) {
					flag = false;
					var _html = countTime + '秒后获取';
					that.html(_html);
					that.addClass('code_disabled');
					timer = window.setTimeout(arguments.callee, 1000);
					countTime--;                
				} else {
					window.clearTimeout(timer);
					flag = true;
					timer = null;
					that.html('获取验证码');
					that.removeClass('code_disabled');
					countTime = timeValue;
				}
			}
		};
		
		var getCode = function() {
			
			if (!checkValue($txt_phone[0])) return false;
			
			if (flag) {
				changeTime.call(this)();
				return true;
			}
		};
		
		var getCoupons = function() {
			if (!checkValue($txt_phone[0])) return false;
			if (!checkValue($txt_code[0])) return false;
			
			var that = this;
			
			var successResult = function() {
				_list.hide();
				_list_box.show();
				localStorage.setItem('getStatus', '1');
			};
			
			if (that.flag === undefined) {
				that.flag = true;
			}
					
			if (that.flag){
				
				var _random = '?t=' + (new Date().getTime());
				var _val = $txt_phone.val();
				var _code = $txt_code.val();
				var $that = $(this);
				var _callbackFn = function() {
					$that.html('确认领取');
					that.flag = true;					
				};
				var param = {
					url: coupons_url + _random,
					type: 'post',
					data: {
						mobile: _val,
						code: _code,
						tag: tag,
						channel: channel
					},
					success: function(_data) {
						
						//0领取成功
						_data = typeof _data === 'string' ? JSON.parse(_data) : _data;
						
						var _str = '\u60a8\u5df2\u9886\u53d6\u8fc7\u4e86';
						
						if (_data.code === 0 || _data.msg === _str) {
							
							if (_data.code === 1) {
								alert(_str);
							}
							successResult();
						} else {
							alert(_data.msg);
						}						
						_callbackFn();
					},
					error: ajaxError
				};
				
				that.flag = false;
				$that.html('领取中...');
				
				successResult();
				//$.ajax(param);				
			}
		};		
		
		var userCoupons = function() {
			
			var _code_img = $('#qrcodeImg');
			var _pop = $('.pop_code');
			var _url = _code_img.attr('data-src');
						
			var _call = function() {
				_code_img.attr('src', _url);
				_code_img.removeAttr('data-src');
			};
			
			loadImg(_url, _call);
			$btn_close.get(0).ele = _pop.get(0);
			_pop.show().animate({opacity: 1}, 200)
			
		};
		
		var closeCoupons = function() {
			$(this.ele).animate({opacity: 0}, 200, function() {
				$(this).hide();
			})
		};		
		
		$btn_get.on('click', getCode);
		$btn_sub.on('click', getCoupons);		
		$btn_user.on('click', userCoupons);
		$btn_close.on('click', closeCoupons);
		
	})();
})