"use strict";
// 2016-7-5 21:00:42 // 找鸭缓存版
var speed = 18, x, y, lastX,lastY, uuid = '', mobile = '', tmp_mobile = '', verfy_btn_able = true, interval_tag, head_url = '', cou_obj={}, cou_can = false, device = device(),isCode = false,model_id;
var qctimer,q_num = 1,_w, w, h,token,money,fullmoney,infoPeople,infoMoney;
var onfr=false;// 防止多次点击 第二次未登录领取
var severTime;
x = y  = lastX = lastY = 0;
// 刚进来的时候不能摇
var tmlobj = sessionStorage.getItem("jwdgoIndex");
var shakeTime = Date.now();
// 解决声音播放的兼容问题
function playable(id){
    var audio = document.getElementById(id);
    var play = function(){
        audio.play();
        audio.pause();
        document.removeEventListener("touchstart", play, false);
    };

    document.addEventListener("touchstart", play, false);

    var wx = wx || undefined;
    if(wx){
        wx.config({
            debug: false,
            appId: '',
            timestamp: 1,
            nonceStr: '',
            signature: '',
            jsApiList: []
        });
        wx.ready(function() {
            play();
        });
    }

    document.addEventListener("WeixinJSBridgeReady", function () {
        play();
    }, false);
}
setInputLength($('#verfy_code'),4);
setInputLength($('#qccodet'),4);
setInputLength($('.yhq_box_show_input'));
setInputLength($('#qcphone'));
playable('shake');
playable('lottery');
playable('lottery2');

// 解决部分安卓手机弹出键盘的问题
function eventCheck(e,succ,fail) {
    if (typeof e != "function") { //blur,focus事件触发的
        if($.device.ios == true)return;
        if (e.type == 'focus') {//如果是点击事件启动计时器监控是否点击了键盘上的隐藏键盘按钮，没有点击这个按钮的事件可用，keydown中也获取不到keyCode值
            setTimeout(function () {//由于键盘弹出是有动画效果的，要获取完全弹出的窗口高度，使用了计时器
                windowInnerHeight = window.innerHeight;
                succ()
                timer = setInterval(function () { eventCheck(fail) }, 200);
            }, 400);
        }
    }
    else { //计时器执行的，需要判断窗口可视高度，如果改变说明android键盘隐藏了
        if (window.innerHeight > windowInnerHeight) {
            clearInterval(timer);
            e();
        }
    }
}

// 字数卡方法
var num_cards = (function(){
    var _id = 0, offset = $(document.body).offset(); _w = offset.width / 14, w = Math.round(_w), h = Math.round(w * 104 / 73);

    // 动画
    var run = function(id, num){
        var top = (parseInt(num) + 10) * h * -1;
        $('#num_card_'+id+'>.num_card_box').animate({'margin-top':top + 'px'}, 1800, 'ease-out', function(){
            $(this).css('margin-top', (top + 10 * h) + 'px')
        });
        return id;
    }

    // 拼接html
    var init = function(selector, num){
        _id++;
        var _html = '<div class="num_card_window" id="num_card_'+_id+'" style="width:'+w+'px;height:'+h+'px;"><div class="num_card_box">', __html = '';
        for(var i = 0; i < 10; i++){
            __html += '<img src="../img/cart_'+i+'.png" class="num_card" />';
        }
        _html += __html + __html + '</div></div>';
        $(selector).append(_html);
        return this.run(_id, num);
    }

    return {
        init: init,
        run:run
    };
})()

init();
function init(){
    bindEvent();	// 绑定事件监听
    if(oldCustom()){
        uuid = commonable.uuid;
        token = commonable.token;
        $.ajax({
            url: url + 'api/User/getUserInfo',
            data:{user_id: uuid, token: token},
            type: 'post',
            dataType:'json',
            success:function(d){
                if(d.code != 0 || !d.data.phone){
                    uuid = '';
                    token = '';
                    localStorage.removeItem('commonable');
                    commonable = {};
                }
                mobile = d.data.phone || false;
                getinfo();
                if(tmlobj)return;
                var oldTime = Date.now();
                if(oldTime - shakeTime > 2000) {
                    cou_can = true;
                }else {
                    setTimeout(function(){
                        cou_can = true;
                    },2000-(oldTime-shakeTime))
                }
            },
            error:function(){
                $.alert('网络连接超时,请稍后重试')
            }
        })
    }else{
        getinfo();
        if(tmlobj){return false}
        setTimeout(function(){
            cou_can = true;
        },2000)
    }
}
// 二维码显示
var qrcode_show = function(){
    if( mobile== '') return;
    isCode = true;
    if(!$('#qr_img').attr("src")){
        $('#qr_img').attr("src",url+'api/user/genCode?mobile='+mobile).show();
    }
    var arr = mobile.toString();
    arr = arr.split("");
    $("#shakePhone").html(arr[0]+arr[1]+arr[2]+"-"+arr[3]+arr[4]+arr[5]+arr[6]+"-"+arr[7]+arr[8]+arr[9]+arr[10]).css({'color':'#ffffff'});
    $('.code').animate({
        left: 0,
        bottom: 0
    },300)
}
var qccode_show = function(){
    if( mobile== '') return;
    isCode = true;
    if(!$('#qrc_img').attr("src")){
        $('#qrc_img').attr("src",url+'api/user/genCode?mobile='+mobile).show();
    }
}
// 二维码消失
var qrcode_hide = function(){
    isCode = false;
    $('.code').animate({
        left: "100%",
        bottom: "100%"
    },300,function(){
        $(this).hide();
        $('.code-icon').show();
    })
};
// 获取当前用户摇嗨次数，标准：一天(86400000)
function get_local_times(){
    if(localStorage[mobile+'shake_time'] && !isNaN(parseInt(localStorage[mobile+'shake_time'])) && Date.now() - localStorage[mobile+'shake_time']  < 86400000) {
        //时间没有过期, 还在一天之内
        //判断是否过了12点
        var nowday=new Date().getDate();
        var oldTime = parseInt(localStorage[mobile+'shake_time']); //得到毫秒数
        var newTime = new Date(oldTime).getDate(); //就得到普通的时间了
        if(nowday==newTime){
            if(!localStorage[mobile+'shake_times']) localStorage[mobile+'shake_times'] = 0;
            return localStorage[mobile+'shake_times'];
        }
    }
    localStorage[mobile+'shake_time'] = Date.now();
    localStorage[mobile+'shake_times'] = 0;
    return 0;
}

//比对服务器时间
function get_shake_time(){
    var t1 = new Date(Date.now()+severTime);
    var hours = t1.getHours();
    var mins = t1.getMinutes();
    if(mins >= 0 && mins <= 9 || mins >= 30 && mins <= 39  || mins >= 10 && mins <= 19 ){
        return false
    }else {
        return true
    }
    if(hours == 10 && mins > 30 )return true;
    if(hours == 12 && mins > 30 )return true;
    if(hours == 15 && mins > 30 )return true;
    if(hours == 18 && mins < 30 )return true;
    if(hours == 20)return true;
    return false
}
// 获取当前在线人数
function getinfo(){
    $.ajax({
        url: url + 'api/ShakeRuleNew/getInfo',
        data: {user_id: uuid},
        type:'post',
        dataType:'json',
        success:function(res){
            if(res.code != 0){
                $.alert(res.msg);
                return
            }
            // 设置图片，背景
            var d = res.data;
            infoPeople = d.people;
            infoMoney = d.money;
            head_url = d.head_url;
            severTime = new Date(d.time*1000);
            var nowTime = Date.now();
            severTime = nowTime-severTime;
            $('#shake_ad').show();
            // 人数
            $('#numbers>span').text(infoPeople);
            $('#numbers').show();

            // 钱数
            var num = infoMoney
            var num = num.toString();
            for(var i = 0, len = num.length; i < len; i++){
                num_cards.init($('#num_cards'), num[i]);
            }

            $('#moneys').css({'margin-left': ($(document.body).offset().width - $('#moneys').offset().width) / 2, 'opacity': 1});

            // 次数
            if(uuid && !d.flag){
                localStorage[mobile+'shake_time'] = Date.now();
                localStorage[mobile+'shake_times'] = 0;
            }
            var tmlobj = sessionStorage.getItem("jwdgoIndex");
            var tmlshakeData = getLdata("shakeCou");
            if(tmlobj==1 && tmlshakeData){
                cou_can = false;
                querySeccess(tmlshakeData)
            }
            if(tmlobj==2 && tmlshakeData){
                cou_can = false;
                var time = getLdata('countdown') || 0;
                countdown(time);
                qcSeccess(tmlshakeData,1)
            }
        },
        error:function(){
            $.alert('网络连接超时,请稍后重试');
        }
    })
}
// 概率
var rand = (function(){
    var today = new Date();
    var seed = today.getTime();
    function rnd(){
        seed = ( seed * 9301 + 49297 ) % 233280;
        return seed / ( 233280.0 );
    };
    return function rand(number){
        return Math.ceil(rnd(seed)
            * number);
    };
})();
// 30秒一次获取当前在线人数
function getNumbers(){
    $.ajax({
        url: url+ 'api/ShakeRuleNew/getInfo',
        data: {user_id: uuid},
        type:'post',
        dataType:'json',
        success:function(res){
            if(res.code != 0){
                // $.alert(res.msg);
                return
            }
            // 人数
            $('#numbers>span').text(res.data.people);
            $('#numbers').show();

            // 钱数
            var num = res.data.money.toString();
            $('#num_cards').html('');
            for(var i = 0, len = num.length; i < len; i++){
                num_cards.init($('#num_cards'), num[i]);
            }

            $('#moneys').css({'margin-left': ($(document.body).offset().width - $('#moneys').offset().width) / 2});

        },
        error:function(res){
            $.alert('网络连接超时,请稍后重试');
        }
    })
}
var getNumTimer = setInterval(function(){
    getNumbers();
}, 30000);
function bindEvent(){
    //分享
    $(document).on('tap','.share',function(){
        $('.share-t').show();
    })
    $(document).on('tap','.share-t',function(){
        $(this).hide();
    })
    //活动详情
    $(document).on('tap','.details',function(){
        $.popup('.popup-rule-r');
    })
    // 遮罩2
    $(document).on("tap",".shade2", function(e){
        $('.shade2').hide();
        $('#qrcode').hide();
    })

    // 点外卖
    $(document).on('tap', '.go-index', function(){
        tongjiApi.query({"tag":"秒杀外卖"})
        sessionStorage.setItem("jwdgoIndex", 1);
        if(searchApi.config.isPos){
            locationClearCache('special.html')
        }else {
            locationClearCache('positions.html')
        }
    })

    // 更多门店
    $(document).on('tap', '.go-shop', function(){
        sessionStorage.setItem("jwdgoIndex", 1);
        tongjiApi.query({"tag":"秒杀门店"})
        locationClearCache('search_shop.html')
        return;
    })
    $(document).on('tap', '.qc-go-shop', function(){
        sessionStorage.setItem("jwdgoIndex", 2);
        tongjiApi.query({"tag":"秒杀门店"})
        locationClearCache('search_shop.html')
        return;
    })
    // 处理键盘弹出
    $(document).on("focus",".yhq_box_show_input", function(e){
        eventCheck(e,function(){
            $(".yhq_box").css({"tap":"30%"});
        },function(){
            $(".yhq_box").css({"tap":"50%"});
        });
    })
    // 处理键盘弹出
    $(document).on("focus","#verfy_code", function(e){
        eventCheck(e,
            function(){
                $(".login").css({"tap":"30%"});
            },
            function(){
                $(".login").css({"tap":"50%"});
            }
        );
    })
    // 二维码icon点击
    $(document).on("tap",".code-icon", function(){
        $(".code").show();
        qrcode_show();
        $(this).hide();
    })
    // 二维码icon点击
    $(document).on("tap",".qc-coupon-bottom-e", function(){
        $('.popup-ecode').show();
        qccode_show();
    })
    $(document).on("tap",".jwicon_g", function(){
        $('.popup-ecode').hide();
    })

    $(document).on("tap",".icon-cancel2,.icon-cancel",function(){
        if(isCode){
            qrcode_hide();
            return
        }
        cou_can = true;
        q_num = 2;
        $('.shade').hide();
        $('.login').hide();
        $('.yhq_box2').hide();
        $('.yhq_box').hide();
    });

    // 登录框的关闭按钮
    $(document).on("tap",".close",function(){
        $('.shade').hide();
        $('.login').hide();
        cou_can = true;
        q_num = 2;
    });

    // 碎了的那个按钮
    $(document).on("tap","#apha_btn",function(){
        locationClearCache("positions.html");
        $('#screen_show').hide();
    });

    // 第二次背景按钮
    $(document).on("tap","#shake_bg2 div",function(){
        $('#shake_bg2').hide();
        q_num = 2;
        cou_can = true;
    });
    // 我的优惠券
    $(document).on("tap",".go-mycoupon",function(){
        sessionStorage.setItem("jwdgoIndex", 1);
        $.router.load('/mycoupon.html');
    });
    $(document).on("tap",".qc-coupon-c",function(){
        sessionStorage.setItem("jwdgoIndex", 2);
        $.router.load('/mycoupon.html?state=1')

    });
    // 周边门店
    $(document).on("tap",'.map',function(){
        sessionStorage.setItem("jwdgoIndex", 1);
        if($(".map-title").html() == "定位中..."){
            $.toast("正在定位...")
            return
        }
        if($(".map-title").html() == "定位失败"){
            // $.toast("正在定位...")
            return
        }
        $.router.load('/search_shop_info.html'+searchApi.config.link)
    })
    $(document).on("tap",'.qcmap',function(){
        sessionStorage.setItem("jwdgoIndex", 2);
        if($(".qctit").html() == "定位中"){
            $.toast("正在定位...")
            return
        }
        if($(".qctit").html() == "定位中..."){
            $.toast("正在定位...")
            return
        }
        if($(".qctit").html() == "周边暂无门店"){
            $.toast("周边暂无门店")
            return
        }
        if($(".qctit").html() == "定位失败"){
            // $.toast("正在定位...")
            return
        }
        $.router.load('/search_shop_info.html'+searchApi.config.link)
    })
    // 遮罩弹层事件绑定
    $(document).on("tap",'.icon-cancel',function(){
        if($(this).hasClass("close-code")){
            qrcode_hide();
            return
        }
        cou_can = true;
        q_num = 2;
        $('.shade').hide();
        $('.login').hide();
        $('.yhq_box2').hide();
        $('.yhq_box').hide();
    });

    // 马上使用按钮
    $(document).on("tap",'#go_login',function(){
        tmp_mobile = $('.yhq_box_show_input').val();
        if(!RE[1].test(tmp_mobile)){
            tmp_mobile = '';
            $.alert('请确认手机号是否正确');
            return
        }
        $('#verify_mobile').text(tmp_mobile);
        $('.yhq_box').hide();
        $('.login').show();
    })
    // 获取验证码按钮
    var verfy_btn_able_t = 1;
    $(document).on("tap",'#verfy_btn',function(){
        if(!verfy_btn_able_t) return;
        $.ajax({
            type: 'post',
            url: url+'api/Verify/sendSms',
            dataType: 'json',
            timeout: 10000,
            data:{phone: tmp_mobile},
            success: function(data){
                if(data.code != 0){
                    $.alert(data.msg);
                    return;
                }
                // 倒计时
                verfy_btn_able_t = false;
                $('#verfy_btn').text('60').css('background', '#ccc');
                interval_tag = setInterval(function(){
                    var _tmp = parseInt($('#verfy_btn').text()) - 1;
                    if(_tmp <= 0){
                        verfy_btn_able_t = true;
                        clearInterval(interval_tag);
                        $('#verfy_btn').text('获取验证码').css('background', '#e51a13');
                        return;
                    }
                    $('#verfy_btn').text(_tmp);
                }, 1000);
            },
            error: function(xhr, type){
                $.alert('网络连接超时，请重试！')
            }
        });
    });
    // 校验验证码, 并领取奖品
    $(document).on("click",'#submit_btn',function(){
        if(submit_one){return}
        var verfy_code = $('#verfy_code').val();
        if(verfy_code == ''){
            $.alert('请输入验证码')
            return;
        }
        submit_one=true;
        quNot(verfy_code)
    })

    if(window.DeviceMotionEvent){
        window.removeEventListener('devicemotion', on_devicemotion, false);
        window.addEventListener('devicemotion', on_devicemotion, false);
    }else{
        $.alert('您的设备不支持摇一摇');
    }
    //第二次摇没有登录时提示登录
    $(document).on("tap",'#qccode',function(){
        tmp_mobile = $('#qcphone').val();
        var _this=$(this);
        if(!RE[1].test(tmp_mobile)){
            tmp_mobile = '';
            $.alert('请确认手机号是否正确');
            return
        }
        if(!verfy_btn_able) return;
        $.ajax({
            type: 'post',
            url: url+'api/Verify/sendSms',
            dataType: 'json',
            timeout: 10000,
            data:{phone: tmp_mobile},
            success: function(data){
                if(data.code != 0){
                    $.alert(data.msg);
                    return;
                }

                // 倒计时
                verfy_btn_able = false;
                _this.text('60s').css('background', '#ccc');
                interval_tag = setInterval(function(){
                    var _tmp = parseInt(_this.text()) - 1;
                    if(_tmp <= 0){
                        verfy_btn_able = true;
                        clearInterval(interval_tag);
                        _this.text('获取验证码').css('background', '#ddbc84');
                        return;
                    }
                    _this.text(_tmp+'s');
                }, 1000);
            },
            error: function(xhr, type){
                $.alert('网络连接超时，请重试！')
            }
        });
    });
    $(document).on("input","#qccodet",function(){
        tmp_mobile = $('#qcphone').val();
        if(RE[1].test(tmp_mobile)){
            $('#qcbtn').addClass("cur");
        }
        if($(this).val().length < 4 ){
            $('#qcbtn').removeClass("cur");
        }
    })
    $(document).on("input","#qcphone",function(){
        tmp_mobile = $('#qcphone').val();
        if(RE[1].test(tmp_mobile) && $('#qccodet').val().length == 4){
            $('#qcbtn').addClass("cur");
        }else {
            $('#qcbtn').removeClass("cur");
        }
    })
    //第二次登录领卷
    $(document).on("click","#qcbtn",function(){
        tmp_mobile = $('#qcphone').val();
        if(!$(this).hasClass('cur'))return
        if(!RE[1].test(tmp_mobile)){
            tmp_mobile = '';
            $.alert('请确认手机号是否正确');
            return
        }

        var verfy_code = $('#qccodet').val();
        if(verfy_code == ''){
            $.alert('请输入验证码')
            return;
        }
        if(onfr){
            return;
        }
        onfr=true;
        qcNot(verfy_code)
    })
}
var submit_one=false;
//第二次已登录
function qc(verfy_code){
    getNumbers = function(){};  // 取消在线人数请求
    var thirdData = {
        mobile: tmp_mobile || mobile,
        code: verfy_code,
        tag:'timelimit',
        money:money,
        coupon_type:3,
        num: 2,
        model_id: model_id,
        end_time: localStorage['countdown']
    }
    $.ajax({
        url: url + 'api/ShakeRuleNew2/index',
        data: thirdData,
        dataType: 'json',
        type:'post',
        success:function(d){
            onfr=false;
            if(d.code != 0){
                firstFill(d);
                return;
            }else{
                // 成功领取
                commonable = getLdata("commonable") || {};
                commonable['uuid'] = uuid = d.data.uuid;
                commonable['token'] = token = d.data.token;
                commonable['phone'] = mobile = d.data.mobile;
                setLdata("shakeCou",d);
                setLdata("commonable",commonable);
                qcSeccess(d)
                // 设置摇嗨状态
            }
        },
        error:function(d){
            onfr=false;
            $.alert('网络连接超时,请稍后重试');
        }
    })
}
//第二次未登录
function qcNot(verfy_code){
    getNumbers = function(){};  // 取消在线人数请求
    var channel = GetQueryString('code') || "";
    var thirdData = {
        mobile: tmp_mobile || mobile,
        code: verfy_code,
        tag:'timelimit',
        channel: channel,
        money:money,
        coupon_type:3,
        num: 2,
        model_id: model_id,
        end_time: localStorage['countdown']
    }
    $.ajax({
        url:url + 'api/ShakeRuleNew2/noLogin',
        data:thirdData,
        type:'post',
        dataType:'json',
        success:function(d){
            onfr=false;
            if(d.code != 0){
                firstFill(d);
                return;
            }else{
                // 成功领取
                commonable = getLdata("commonable") || {};
                commonable['uuid'] = uuid = d.data.uuid;
                commonable['token'] = token = d.data.token;
                commonable['phone'] = mobile = d.data.mobile;
                setLdata("shakeCou",d);
                setLdata("commonable",commonable);
                qcSeccess(d)
                // 设置摇嗨状态
            }
        },
        error:function(){
            onfr=false;
            $.alert('网络连接超时,请稍后重试');
        }
    })
}
//第一次已登录
function qu(verfy_code){
    var thirdData = {
        mobile: tmp_mobile || mobile,
        code: verfy_code,
        money: money,
        tag: 'timelimit',
        full_money: fullmoney,
        coupon_type: 1,
        num: 1,
        model_id: model_id
    };
    $.ajax({
        url:url + 'api/ShakeRuleNew2/index',
        type:'post',
        dataType:'json',
        data:thirdData,
        success:function(d){
            submit_one=false;
            if(d.code != 0){
                firstFill(d);
                return;
            }else{
                // uuid token
                q_num = 2
                // 设置登录状态
                commonable = getLdata("commonable") || {};
                commonable['uuid'] = uuid = d.data.uuid;
                commonable['token'] = token = d.data.token;
                commonable['phone']  = mobile =  d.data.mobile;
                setLdata("shakeCou",d)
                setLdata("commonable",commonable)
                // 设置摇嗨状态
                localStorage[mobile+'shake_time'] = Date.now();
                localStorage[mobile+'shake_times'] = 1;
                getNumbers();	// 主动刷新数据
                // 成功领取
                $('.login').hide();
                querySeccess(d)
            }
        },
        error:function(){
            submit_one=false;
            $('.login,.shade').hide();
            $('#shake_bg2').show();
        }
    })
}
//第二次未登录
function quNot(verfy_code){
    var channel = GetQueryString('code') || "";
    var thirdData = {
        mobile: tmp_mobile || mobile,
        code: verfy_code,
        money: money,
        tag: 'timelimit',
        channel: channel,
        full_money: fullmoney,
        coupon_type: 1,
        num: 1,
        model_id: model_id
    };
    $.ajax({
        url: url + 'api/ShakeRuleNew2/noLogin',
        type: 'post',
        dataType:'json',
        data:thirdData,
        success:function(d){
            submit_one=false;
            if(d.code != 0){
                firstFill(d);
                return;
            }else{
                // uuid token
                q_num = 2
                // 设置登录状态
                commonable = getLdata("commonable") || {};
                commonable['uuid'] = uuid = d.data.uuid;
                commonable['token'] = token = d.data.token;
                commonable['phone']  = mobile =  d.data.mobile;
                setLdata("shakeCou",d)
                setLdata("commonable",commonable)
                // 设置摇嗨状态
                localStorage[mobile+'shake_time'] = Date.now();
                localStorage[mobile+'shake_times'] = 1;
                getNumbers();	// 主动刷新数据
                // 成功领取
                $('.login').hide();
                querySeccess(d)
            }
        },
        error:function(){
            submit_one=false;
            $('.login,.shade').hide()
            $('#shake_bg2').show();
        }
    })
}
function on_devicemotion(e){
    var acceleration = e.accelerationIncludingGravity;
    x = acceleration.x;
    y = acceleration.y;

    if(Math.abs(x-lastX) > speed || Math.abs(y-lastY) > speed){
        queryCou();
    }
    lastX = x;
    lastY = y;
}

function queryCou(){
    if(!cou_can) return;
    cou_can = false;
    if(!get_local_times()) {
        // 第一次, 可以摇
        localStorage[mobile+'shake_times'] = 1;
    }else if(localStorage[mobile+'shake_times'] == 1){
        q_num = 2;
    }else if(get_local_times() >= 2){
        // 第三加次全在这
        localStorage[mobile+'shake_times']++;
        localStorage.removeItem('shakeCou')
        shakeAnmi($('#shake')[0], $('#lottery2')[0], function(){
            $('#screen_show,#numbers,#moneys').show();
            $('.qc-coupon').css('top','100%');
        });
        return;
    }


    // 开始动画
    shakeAnmi($('#shake')[0], $('#lottery')[0]);
    if(q_num == 1){
        var sum = rand(100);
        if(sum >= 45 && sum <= 90){
            money = 5;
            fullmoney = 38;
            model_id = 3;
        }else if(sum > 90){
            money = 10;
            fullmoney = 68;
            model_id = 4;
        }else {
            money = 3;
            fullmoney = 28;
            model_id = 2;
        }
    }else {
        var sum = rand(100);
        if(sum >= 60 && sum <= 90){
            money = 5;
            model_id = 76;
        }else if(sum > 90){
            money = 10;
            model_id = 69;
        }else {
            money = 8;
            model_id = 64;
        }
    }

    // 为提高响应速度, 并行执行
    // 创建post参数
    var postData = mobile ? {mobile: mobile} : {};

    // 经纬度
    if(localStorage.commonable){
        var __common_able = JSON.parse(localStorage.commonable);
        if(__common_able.indexlatlon){
            var _latlon_arr = __common_able.indexlatlon.split(',');
            postData['lastitude'] = _latlon_arr[0];
            postData['longitude'] = _latlon_arr[1];
        }
    }
    // 系统参数
    postData['system'] = device.os;
    postData['system_version'] = device.osVersion;
    postData['num'] = q_num;
    setTimeout(function(){
        //如果不在时间段内
        if(!get_shake_time() && q_num == 2 ){
            setTimeout(function(){
                $('#shake_bg2').show();
                localStorage[mobile+'shake_times'] = 1;
            },500)
            return
        }
        // 先判断是不是登录状态  是
        if(postData.mobile){
            //判断登录状态下是满减券还是立减券  q_num 2 立减券
            if(q_num == 2) {
                var t1 = new Date(Date.now()+severTime);
                localStorage['countdown'] =t1.getTime()+1800000;//储存结束时间
                countdown(localStorage['countdown']);
                qc();
            }else {
                qu();
            }
        }else {
            //判断是未登录状态下是满减券还是立减券  type 7 立减券
            if(q_num == 2){
                // 倒计时
                var t1 = new Date(Date.now()+severTime);
                localStorage['countdown'] =t1.getTime()+1800000;//储存结束时间
                countdown(localStorage['countdown']);
                qcNotLanding(money,fullmoney);
            }else {
                queryNotLanding(money,fullmoney)
            }
        }
    },2000)
}

function shakeAnmi(audio1, audio2, callback){
    // 打开动画
    $('.shaketop').animate({'-webkit-transform':'translateY(-100%)'}, 400);
    $('.shakebottom').animate({'-webkit-transform':'translateY(100%)'}, 400);
    audio1.play();	// 播放声音

    setTimeout(function(){
        $("#shake_ad").animate({'opacity': 0}, 100, 'ease-out');
        $("#numbers").animate({'opacity': 0}, 100, 'ease-out');
        $("#moneys").animate({'opacity': 0}, 100, 'ease-out');
    }, 100);

    // 关闭动画
    setTimeout(function(){
        $('.shaketop').animate({'-webkit-transform':'translateY(0)'}, 150);
        $('.shakebottom').animate({'-webkit-transform':'translateY(0)'}, 150);

        $("#shake_ad").animate({'opacity': 1}, 100, 'ease-in');
        $("#numbers").animate({'opacity': 1}, 100, 'ease-in');
        $("#moneys").animate({'opacity': 1}, 100, 'ease-in');

        setTimeout(function(){
            callback && callback();
            audio2.play();
        }, 1800)

        getNumbers();	// 主动请求
    }, 1000);
}
//找鸭摇中返回
function qcSeccess(data,num){
    setLdata("shakeCou",data);
    cou_obj = data.data;
    q_num = 2;
    if(num){
        countdown(localStorage['countdown']);
    }
    $('.qc-wd').hide();
    $('.qc-coupon').css({"opacity":"1","top":"0"});
    $('.ydl').css({"left":"6%"});
    $('.share').show();
    $('.qc-coupon-y>div>span i').text(moneyReZero(cou_obj.money));
    $('.qc-coupon-p span').text(cou_obj.mobile);
    localStorage[mobile+'shake_time'] = Date.now();
    localStorage[mobile+'shake_times'] = 2;
}
// 满减登录状态
function querySeccess(data){
    setLdata("shakeCou",data)
    cou_obj = data.data;
    cou_obj.value = moneyReZero(cou_obj.money)
    $('.yhq_box_show_txt').html('<span>￥</span>'+cou_obj.value);
    // 印章图标
    if(cou_obj.value == 10){
        $('.zhuandale').show();
    }else if(cou_obj.value == 5){
        $('.buduole').show();
    }
    $('.shade,.yhq_box2,.go-index,.go-mycoupon').show();
    $(".yhq_box_show_txts").html("满"+moneyReZero(cou_obj.full_money)+"元可用，全场通享");
    $('.yhq_box_show_notice').html('<span class="yhq_box_show_notice_font">已放入账号：</span>'+mobile).css("display","block");
    getNumbers();	// 主动刷新数据
}
// 立减为登录未登录
function qcNotLanding(data){
    $('.qc-coupon').css({"opacity":"1","top":"0"});
    $('.qc-wd').show();
    localStorage[mobile+'shake_times'] = 2;
}
// 满减未登录
function queryNotLanding(money,full){
    $('.yhq_box_show_txt').html('<span>￥</span>'+money);
    // 印章图标
    if(money == 10){
        $('.zhuandale').show();
    }else if(money == 5){
        $('.buduole').show();
    }
    $('.shade,.yhq_box,.yhq_box_show_input,.coup_btn').show();
    $(".yhq_box_show_txts").html("满"+full+"元可用，全场通享");
}
// 失败统一处理
function firstFill(data){
    if(data.code == "222"){
        $.alert('验证码错误');
        return;
    }
    if(data.code == '221'){
        $.alert('请输入正确的手机号码')
        return
    }
    if(data.code == '220'){
        $.alert('请输入正确的手机号码')
        return
    }
    if(data.code == '207'){
        localStorage.removeItem('mobile');
        localStorage.removeItem('commonable');
        $.alert('网络异常请刷新重试!', function(){
            cou_can = true;
        });
        return;
    }
    if(data.code == '208' || data.code == '230'){
        $('#screen_show,#numbers,#moneys').show();
        $('.login, .shade').hide();
        $('.qc-coupon').css('top','100%');
        localStorage[mobile+'shake_times'] = 3;
        return
    }
    if(data.code == '209' ||　data.code == '220' || data.code == '201' || data.code == '202' || data.code == '203' || data.code == '206' || data.code == '204'　){
        $('.login,.shade').hide()
        $('#shake_bg2').show();
        localStorage[mobile+'shake_times'] = 1;
        return
    }
    if(data.code == '205'){
        $.alert('您今天已领过券了',function(){
            cou_can = true;
            q_num = 2;
        });
        localStorage[mobile+'shake_times'] = 1;
        return
    }
    $.alert(data.msg,function(){
        localStorage[mobile+'shake_times'] = 2;
        cou_can = true;
    });
}

//倒计时
var img_h;
var second_1=$('#second').children('div').eq(0);
var second_2=$('#second').children('div').eq(1);
var minute_1=$('#minute').children('div').eq(0);
var minute_2=$('#minute').children('div').eq(1);
var second_1a=$('#second1').children('div').eq(0);
var second_2a=$('#second1').children('div').eq(1);
var minute_1a=$('#minute1').children('div').eq(0);
var minute_2a=$('#minute1').children('div').eq(1);
$(function(){
    var countdown_y=$('.qc-coupon-top-js');
    var millisecond=$('#millisecond>div,#millisecond1>div');
    millisecond.css('margin-top',-9*img_h+'px');
    var timestamp=new Date().getTime();
    var i=getLdata('countdown')-timestamp,j=0,k;
    if(i<0){i=0};
    $('.qc-coupon-top-img1').attr('src','img/img2_0612.png');
    $('.qc-coupon-bottom-e').show();
    $('.qc-coupon-top-img2').css('z-index','0');
    $('.qc-coupon-top-img2').css('opacity','0');
    img_h = $('#imgNum3').height();
    second(i);
})

var countdown=function(t){
    var countdown_y=$('.qc-coupon-top-js');
    var millisecond=$('#millisecond>div,#millisecond1>div');
    var t1 = new Date(Date.now()+severTime);
    var timestamp=t1.getTime();
    var i=t-timestamp,j=0,k;
    if(i<0){i=0};
    $('.qc-coupon-top-img1').attr('src','img/img2_0612.png');
    $('.qc-coupon-bottom-e').show();
    $('.qc-coupon-top-img2').css('z-index','0');
    $('.qc-coupon-top-img2').css('opacity','0');
    second(i);
    countdown_y.find('img').css({'display':'block'});
    img_h=countdown_y.find('img').eq(0).height();
    if(img_h!=0){
        countdown_y.children('div').height(img_h);
    }
    qctimer=setInterval(function(){
        if(!!img_h){
            i=i-100;
            if(i<0){i=0};
            k=img_h*j;
            millisecond.css('margin-top',k+'px');
            j--;
            if(j==-10){
                j=0;
                second(i);
            }
            if(i==0){
                $('.qc-coupon-top-img1').attr('src','img/img8_0612.png');
                $('.qc-coupon-bottom-e').hide();
                $('.qc-coupon-top-img2').css('z-index','10').animate({
                    opacity:'1'
                },500);
                sessionStorage.setItem("jwdgoIndex", 0);
                millisecond.css('margin-top',-9*img_h+'px');
                second_1.css('margin-top',-5*img_h+'px');
                minute_1.css('margin-top',-2*img_h+'px');
                second_2.css('margin-top',-9*img_h+'px');
                minute_2.css('margin-top',-9*img_h+'px');
                window.clearInterval(qctimer);
            }
        }
    },100)
}
var second=function(i){

    var m=parseInt(i/1000%60);
    var f=parseInt(i/1000/60);
    m=m.toString().split('');
    f=f.toString().split('');
    if(m.length>1){
        second_2.animate({
            margin:-img_h*(9-m[1])+"px 2% 0 2%"
        },300);
        second_1.animate({
            margin:-img_h*(5-m[0])+"px 2% 0 2%"
        },300);
        second_2a.animate({
            margin:-img_h*(9-m[1])+"px 2% 0 2%"
        },300);
        second_1a.animate({
            margin:-img_h*(5-m[0])+"px 2% 0 2%"
        },300);
    }else{
        second_2.animate({
            margin:-img_h*(9-m[0])+"px 2% 0 2%"
        },300);
        second_1.animate({
            margin:-img_h*5+"px 2% 0 2%"
        },300);
        second_2a.animate({
            margin:-img_h*(9-m[0])+"px 2% 0 2%"
        },300);
        second_1a.animate({
            margin:-img_h*5+"px 2% 0 2%"
        },300);
    }
    if(f.length>1){
        minute_2.animate({
            margin:-img_h*(9-f[1])+"px 2% 0 2%"
        },300);
        minute_1.animate({
            margin:-img_h*(2-f[0])+"px 2% 0 2%"
        },300);
        minute_2a.animate({
            margin:-img_h*(9-f[1])+"px 2% 0 2%"
        },300);
        minute_1a.animate({
            margin:-img_h*(2-f[0])+"px 2% 0 2%"
        },300);
    }else{
        minute_2.animate({
            margin:-img_h*(9-f[0])+"px 2% 0 2%"
        },300);
        minute_1.animate({
            margin:-img_h*2+"px 2% 0 2%"
        },300);
        minute_2a.animate({
            margin:-img_h*(9-f[0])+"px 2% 0 2%"
        },300);
        minute_1a.animate({
            margin:-img_h*2+"px 2% 0 2%"
        },300);
    }
}
// 分享参数
// 朋友
var wx_config = {
    onMSAM : {
        link: location.href,
        imgUrl: 'http://'+location.host+'/img/71144273203703788.png',
        title: "今天开始｜全城找鸭不犯法",
        desc: "没有绝味半小时，看什么1/8欧洲杯？",
        // 朋友
        trigger: function(){
            // 触发分享后回调  统计
            tongjiApi.query({"tag":"分享朋友触发"})
        },
        success: function(){
            // 分享成功后回调  统计
            tongjiApi.query({"tag":"分享朋友成功"})
        },
        cancel: function(){
            // 分享取消后回调  统计
            tongjiApi.query({"tag":"分享朋友取消"})
        },
        fail: function(){
            // 分享失败后回调  统计
            tongjiApi.query({"tag":"分享朋友失败"})
        }
    },
    // 分享朋友圈默认参数
    onMSTL : {
        link: location.href,
        imgUrl: 'http://'+location.host+'/img/71144273203703788.png',
        title: "今天开始｜全城找鸭不犯法",
        desc: "没有绝味半小时，看什么1/8欧洲杯？",
        // 朋友圈
        trigger: function(){
            // 触发分享后回调  统计
            tongjiApi.query({"tag":"分享朋友圈触发"})
        },
        success: function(){
            // 分享成功后回调  统计
            tongjiApi.query({"tag":"分享朋友圈成功"})
        },
        onMSTLCan: function(){
            // 分享取消后回调  统计
            tongjiApi.query({"tag":"分享朋友圈取消"})
        },
        onMSTLFail: function(){
            // 分享失败后回调  统计
            tongjiApi.query({"tag":"分享朋友圈失败"})
        },
    }
}
// 定位组件
// searchApi.config.btn = $('.map');
searchApi.config.fail = $('.map,.qcmap');//失败
searchApi.config.mapTitle = $('.map-title,.qctit');//标题
searchApi.config.mapCon = $('.map-con,.qccon');//内容
searchApi.config.mapShop = $('.go-shop');//去周边门店
searchApi.config.wxCon = wx_config;
searchApi.searchinit();