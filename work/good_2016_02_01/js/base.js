define(function(require) {
    var $ = require('zepto');
    $(function() {
        var rog = {};
        //预加载背景图片
        rog.loadBackgroundImage = function() {
            var $imgs = $('.lazy_img');
            var $load_ele = $('.loading_page');
            var $load_txt = $('.loading_page_txt');
            var $wrap = $('.wrap');
            var $audio = $('.audio_ele');
            var $audioBox = $audio.parent();
            var nLen = $imgs.length;
            var aImgUrl = [];
            var oImg = {};
            var nCurrent = 0;
            $audio = $audio.get(0);
            $imgs.each(function(index) {
                aImgUrl[index] = $imgs.eq(index).attr('data-style');
                $imgs.eq(index).removeAttr('data-style');
            });

            //音乐播放
            var audioPlay = function() {
                var $that = $(this);
                if ($that.hasClass('audio_box_stop')) {
                    $audio.play();
                    $that.removeClass('audio_box_stop');
                } else {
                    $audio.pause();
                    $that.addClass('audio_box_stop');
                }
            };

            var showWrap = function() {
                rog.addSwiper($);
                //window.setTimeout(function(){
                $load_ele.animate({
                    'opacity': '0',
                    'display': 'none'
                });
                $wrap.animate({
                    'opacity': '1',
                    'display': 'block'
                });
                if ($audioBox.length) {
                    $audio.play();
                    $audioBox.bind('tap', audioPlay);
                }
                //},500);  
            };
            for (var i = 0; i < nLen; i++) {
                oImg['img' + i] = new Image();
                oImg['img' + i].index = i;
                var loadImg = function() {
                    var nTemp = Math.floor(Math.floor((++nCurrent) / nLen * 100) / 10);
                    $load_txt.html('LOADING......<br/>' + (nTemp == 0 ? '': nTemp) + '0%');
                    $imgs.eq(this.index).css('backgroundImage', 'url(' + this.src + ')');
                    nTemp = null;
                    this.src = '';
                    if (nCurrent == nLen) {
                        showWrap();
                    }
                }
                oImg['img' + i].onload = loadImg;
                oImg['img' + i].src = aImgUrl[i];
            };
            if (!$imgs.length) {
                showWrap();
            }
        };
        //加载js
        rog.loadScript = function(url, callback) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            if (script.readyState) {
                script.onreadystatechange = function() {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else {
                script.onload = function() {
                    callback();
                };
            }
            script.src = url;
            document.getElementsByTagName("body")[0].appendChild(script);
        }
        //加载css
        rog.loadCss = function(url) {
            var cssLink = document.createElement("link");
            cssLink.rel = "stylesheet";
            cssLink.type = "text/css";
            cssLink.media = "screen";
            cssLink.href = url;
            document.getElementsByTagName("head")[0].appendChild(cssLink);
        };
        //滑动    
        rog.swiperAnimate = function(obj_para) {
            var $swiper = $('.' + obj_para.swiper);
            if (!$swiper.length) {
                return false;
            }
            var $items = $('.' + obj_para.swiper_items);
            var sTxt = '.' + obj_para.swiper_txt_a;
            var sBtn = '.' + obj_para.swiper_txt_b;
            var sData = obj_para.swiper_attr;
            //给单个元素设置自定义属性
            var setTranslate = function($that, styleName, dataName) {
                var sValue = $that.css(styleName);
                sValue = sValue.split(',');
                sValue = sValue[sValue.length - 2];
                $that.attr(dataName, sValue);
            };
            //给集体元素设置自定义属性
            var setTranslates = function() {
                $items.each(function(index, ele) {
                    var $that = $(ele);
                    var $txt = $that.find(sTxt);
                    var $btn = $that.find(sBtn);
                    setTranslate($txt, 'transform', sData);
                    $btn.length ? setTranslate($btn, 'transform', sData) : null;
                })
            };
            setTranslates();
            //滑动实例化
            var swiper = new Swiper('.' + obj_para.swiper, {
                paginationClickable: true,
                direction: obj_para.swiper_direction,
                onSlideChangeStart: function() {
                    var index = swiper.activeIndex;
                    var $item = $items.eq(index);
                    $items.each(function() {
                        var $that = $(this);
                        var $txt = $that.find(sTxt);
                        var $btn = $that.find(sBtn);
                        $txt.css({
                            'transform': 'translate(' + $txt.attr(sData) + 'px' + ',0)'
                        });
                        $btn.css({
                            'transform': 'translate(' + $btn.attr(sData) + 'px' + ',0)'
                        });
                    });
                    $item.find(sTxt).animate({
                        'transform': 'translate(0,0)'
                    });
                    $item.find(sBtn).animate({
                        'transform': 'translate(0,0)'
                    });
                }
            });

            //载入执行
            var $first = $items.eq(0);
            $first.find(sTxt).animate({
                'transform': 'translate(0,0)'
            });
            $first.find(sBtn).animate({
                'transform': 'translate(0,0)'
            });
        }

        //加载滑动
        rog.addSwiper = function($) {
            var $act_swiper = $('.active_swiper');
            var $prev_swiper = $('.preview_swiper');
            if ($act_swiper.length || $prev_swiper.length) {
                var $css_ele = $('#css_ele');
                var css_url = $css_ele.attr('data-load-css');
                rog.loadCss(css_url);
                rog.loadScript('js/' + js_url.swiper,
                function() {
                    //宣传页滑动
                    rog.swiperAnimate({
                        'swiper': 'active_swiper',
                        'swiper_items': 'swiper-slide',
                        'swiper_txt_a': 'swiper_item_txt',
                        'swiper_txt_b': 'active_show',
                        'swiper_attr': 'data-transform',
                        'swiper_direction': 'vertical'
                    });

                    //玩家分享页滑动
                    rog.swiperAnimate({
                        'swiper': 'preview_swiper',
                        'swiper_items': 'swiper-slide',
                        'swiper_txt_a': 'swiper_img_txt',
                        'swiper_txt_b': 'swiper_txt',
                        'swiper_attr': 'data-transform',
                        'swiper_direction': 'vertical'
                    });
                });
            }
        };
        rog.loadBackgroundImage();
        //分享    
        rog.shareToFri = function() {
            var $btn_share = $('#show_active');
            var share = function() {
                var $share_div = $('.share_page');
                if (!$share_div.length) {
                    $('<div class="share_page"></div>').appendTo($('body'));
                    $share_div = $('.share_page');
                    $share_div.css({
                        'display': 'block',
                        'opacity': 1
                    });
                    $share_div.bind('tap',
                    function() {
                        $(this).css({
                            'display': 'none',
                            'opactiy': 0
                        });
                    });
                } else {
                    $share_div.css({
                        'display': 'block',
                        'opacity': 1
                    });
                }
            };
            $btn_share.bind('tap', share);
        };
        rog.shareToFri();

        //操作cookie
        rog.addCookie = function(objName, objValue, objHours) {
            var str = objName + "=" + escape(objValue);
            if (objHours > 0) {
                var date = new Date();
                var ms = objHours * 3600 * 1000;
                date.setTime(date.getTime() + ms);
                str += "; expires=" + date.toGMTString() + "; path=/";
            }
            document.cookie = str;
        };
        rog.getCookie = function(objName) {
            var arrStr = document.cookie.split("; ");
            for (var i = 0; i < arrStr.length; i++) {
                var temp = arrStr[i].split("=");
                if (temp[0] == objName) return unescape(temp[1]);
            }
        };
        rog.delCookie = function(name) {
            var date = new Date();
            date.setTime(date.getTime() - 10000);
            document.cookie = name + "=a; expires=" + date.toGMTString();
        };

        //编辑提示
        rog.tipsEdit = function() {
            var $edit_ele = $('.edit_image_box');
            if ($edit_ele.length && rog.getCookie('readySeeTips') != 'yes') {
                $('<div class="tips_page"></div>').appendTo($('body'));
                var $tips = $('.tips_page');
                $tips.bind('click',
                function() {
                    $(this).hide();
                    rog.addCookie('readySeeTips', 'yes', 24);
                });
            }
        };
        rog.tipsEdit();

        //领奖信息填写
        rog.$form = $('#form_edit');
        rog.$inputs = rog.$form.find('.form_txt');
        rog.strTrim = function(str) {
            return str.replace(/(^\s*)|(\s*$)/g, "");
        };

        //是否为空
        rog.isEmpty = function() {
            var val = rog.strTrim(this.value);
            return val == '' ? true: false;
        };

        //手机号
        rog.isPhoneNumber = function() {
            var val = rog.strTrim(this.value);
            return val.length == 11 && /^(((13[0-9]{1})|159|153)+\d{8})$/.test(val) ? true: false;
        };

        //表单验证
        rog.checkForm = function(current_ele) {
            var $that = $(current_ele);
            var $result = $that.parent().next();
            var ele = $that.get(0);
            if (rog.isEmpty.call(ele)) {
                $result.html('内容不能为空');
                return false;
            }
            if ($that.attr('data-phone') == 'true' && !rog.isPhoneNumber.call(ele)) {
                $result.html('请输入有效的手机号码');
                return false;
            }
            $result.html('');
            return true;
        };

        //表单提交
        rog.submitEditForm = function(e) {
            e.preventDefault();
            var result = 0;
            rog.$inputs.each(function(index) {
                rog.checkForm(this) ? result++:null;
                if (result == rog.$inputs.length) {
                    rog.$form.submit();
                }
            })
        };
        rog.$form.bind('submit', rog.submitEditForm);
        rog.$inputs.each(function() {
            var $that = $(this);
            $that.bind('blur',
            function() {
                rog.checkForm(this);
            });
        });
    })
})