"use strict";
// 2016-7-5 21:00:42 // 欧洲杯结束
var speed = 18, x, y, z, lastX,lastY,lastZ, uuid = '', mobile = '', tmp_mobile = '', verfy_btn_able = true, interval_tag, head_url = '',cou_can = false, device = device(),isCode = false,model_id;
var qctimer,_w, w, h,token,maxXYZ,windowInnerHeight;
var onfr=false;// 防止多次点击 第二次未登录领取
var severTime;
x = y  = lastX = lastY  = maxXYZ = 0;
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
                timer = setInterval(function () { eventCheck(fail) }, 100);
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
function init(){
    // 是否支持摇一摇
    if(window.DeviceMotionEvent){
        window.removeEventListener('devicemotion', on_devicemotion, false);
        window.addEventListener('devicemotion', on_devicemotion, false);
    }else{
        $.alert('您的设备不支持摇一摇');
    }

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
                $.alert('网络连接超时,请稍后重试',function(){
                    location.reload();
                })
            }
        })
    }else{
        getinfo();
        if(tmlobj){return false}
        setTimeout(function(){
            cou_can = true;
        },2000)
    }
    bindEvent();	// 绑定事件监听
}
init();

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
            severTime = new Date(d.time*1000);
            var data = severTime.getDate();
            if(data >= 10){
                $('#shake_bg2').css({'background':'rgba(0,0,0,.4) url(http://imgcdnjwd.juewei.com/h5/1467998106.png) no-repeat center center','background-size':'100%'})
                $('#shake_bak_bg')[0].src = 'http://imgcdnjwd.juewei.com/h5/1467998430.jpg';
            }
            var nowTime = Date.now();
            severTime = nowTime-severTime;
            $('#shake_ad').show();
            // 人数
            $('#numbers>span').text(d.people);
            $('#numbers').show();

            // 钱数
            var num = d.money;
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
       /* eventCheck(e,function(){
            $('.icon-cancel').hide();
            $(".yhq_box").css({"tap":"30%",'z-index':'950'});
        },function(){
            $('#yhq_box_show_input').blur();
            $('.icon-cancel').show();
            $(".yhq_box").css({"tap":"50%",'z-index':'899'});
        });*/
    })
    // 处理键盘弹出
    $(document).on("focus","#verfy_code", function(e){
     /*   eventCheck(e,
            function(){
                $('.close,.icon-cancel').hide();
                $(".login").css({"tap":"30%",'z-index':'950'});
            },
            function(){
                $.alert(1)
                $('#verfy_code').blur();
                $('.close').show();
                $(".login").css({"tap":"50%",'z-index':'899'});
            }
        );*/
    })
    // 二维码icon点击
    $(document).on("tap",".code-icon", function(){
        $(".code").show();
        qrcode_show();
        $(this).hide();
    })
    // 二维码icon 关闭点击
    $(document).on("tap",".icon-cancel2,.icon-cancel",function(){
        if(isCode){
            qrcode_hide();
            return
        }
        $(this).hide();
        cou_can = true;
        $('.spoondrift').hide();
        $('.clouds').hide();
        $('.shade').hide();
        $('.login').hide();
        $('.yhq_box2').hide();
        $('.yhq_box').hide();
        $('.sun').hide();
        $('.rain').hide();
        $('.sun-circle').hide();
        $(this).remove();
    });

    // 登录框的关闭按钮
    $(document).on("tap",".close",function(){
        $(this).remove()
        $('.spoondrift,.icon-cancel').hide();
        $('.clouds').hide();
        $('.shade').hide();
        $('.login').hide();
        $('.yhq_box2').hide();
        $('.yhq_box').hide();
        $('.sun').hide();
        $('.rain').hide();
        cou_can = true;
    });

    // 碎了的那个按钮
    $(document).on("tap","#apha_btn",function(){
        locationClearCache("positions.html");
        $('#screen_show').hide();
    });

    // 第二次背景按钮
    $(document).on("tap","#shake_bg2 div",function(){
        $('#shake_bg2').hide();
        cou_can = true;
    });
    // 我的优惠券
    $(document).on("tap",".go-mycoupon",function(){
        sessionStorage.setItem("jwdgoIndex", 1);
        $.router.load('/mycoupon.html?state=1');
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
    // 遮罩弹层事件绑定
    $(document).on("tap",'.icon-cancel',function(){
        if($(this).hasClass("close-code")){
            qrcode_hide();
            return
        }
        $(this).hide();
        cou_can = true;
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
        $('#verfy_btn').trigger('tap');
        $('#verify_mobile').text(tmp_mobile);
        $('.yhq_box,.icon-cancel').hide();
        $('.close,.login').show();
    })
    // 获取验证码按钮
    var verfy_btn_able_t = 1;
    $(document).on("tap",'#verfy_btn',function(){
        if(!verfy_btn_able_t) return;
        // 倒计时
        verfy_btn_able_t = false;
        $('#verfy_btn').text('60s').css('background', '#ccc');
        interval_tag = setInterval(function(){
            var _tmp = parseInt($('#verfy_btn').text()) - 1;
            if(_tmp <= 0){
                verfy_btn_able_t = true;
                clearInterval(interval_tag);
                $('#verfy_btn').text('获取验证码').css('background', '#e51a13');
                return;
            }
            $('#verfy_btn').text(_tmp+'s');
        }, 1000);
        $.ajax({
            type: 'post',
            url: url+'api/Verify/sendSms',
            dataType: 'json',
            timeout: 10000,
            data:{phone: tmp_mobile},
            success: function(data){
                if(data.code != 0){
                    $.alert(data.msg,function(){
                        verfy_btn_able_t = true;
                        clearInterval(interval_tag);
                        $('#verfy_btn').text('获取验证码').css('background', '#e51a13');
                    });
                }
            },
            error: function(xhr, type){
                verfy_btn_able_t = true;
                clearInterval(interval_tag);
                $('#verfy_btn').text('获取验证码').css('background', '#e51a13');
                $.alert('网络连接超时，请重试！')
            }
        });
    });
    // 校验验证码, 并领取奖品
    var submit_one=true;
    $(document).on("click",'#submit_btn',function(){

        if(!submit_one){return}
        var verfy_code = $('#verfy_code').val();
        if(verfy_code == ''){
            $.alert('请输入验证码')
            return;
        }
        submit_one = false;
        var thirdData = {
            mobile: tmp_mobile,
            code: verfy_code,
            money: coupon.money,
            tag: 'timelimit',
            coupon_type: 1,
            model_id: coupon.model_id
        };
        $.ajax({
            url:url + 'api/NewShake/noLogin',
            type:'post',
            dataType:'json',
            data:thirdData,
            success:function(res){
                submit_one = true;
                if(res.code != 0){
                    firstFill(res)
                    return;
                }
                 $('.close,.icon-cancel').css('opacity','0');
                 $('.close,.icon-cancel').hide();
                querySeccess(res)
            },
            error:function(){
                submit_one = true;
                localStorage[mobile+'shake_times'] = 0;
                $.alert('网络连接错误,请稍候重试');
            }
        });
    })
}
var winHeight = window.innerHeight;
window.onresize = function(){
    if($.device.ios){return}
    if(winHeight != window.innerHeight){
        $('.yhq_box,.login').css('z-index','950')
        $('.close,.icon-cancel').hide();
    }else {
        $('.yhq_box,.login').css('z-index','899')
        $('.close,.icon-cancel').show();
    }
}
//重力感应触发摇一摇
function on_devicemotion(e){
    var acceleration = e.accelerationIncludingGravity;
    x = acceleration.x;
    y = acceleration.y;
    z = acceleration.z;

    if(Math.abs(x-lastX) > speed || Math.abs(y-lastY) > speed){
        queryCou(x,y,z);
    }
    lastX = x;
    lastY = y;
    lastZ = z;
}
var cou_can_Ani = true; // 动画状态
var cou_can_Ani_time;   // 动画开始时间
var shakeQuertTime;
var coupon = {}; // 生成的优惠券模板
function queryCou(x,y,z){
    if(!cou_can) return;
    if(!get_local_times()) {

    }else if(get_local_times() >= 2){
        // 第三加次全在这
        cou_can = false;
        localStorage[mobile+'shake_times']++;
        localStorage.removeItem('shakeCou');
        shakeAnmi($('#shake')[0], $('#lottery2')[0], function(){
            $('#screen_show,#numbers,#moneys').show();
            $('.qc-coupon').css('top','100%');
        });
        return;
    }
    // 开始动画  从持续时间中获取最大值
    if(cou_can_Ani){
        cou_can_Ani_time = Date.now();
        shakeQuertTime = setInterval(function(){
            queryCou();
        },100)
        cou_can_Ani = false;
        shakeAnmi($('#shake')[0], $('#lottery')[0]);
    }
    var num = parseInt(Math.abs(x)+Math.abs(y)+Math.abs(z));
    maxXYZ = num > maxXYZ  ? num : maxXYZ;
    if(Date.now()- cou_can_Ani_time < 1000) return;
    window.clearInterval(shakeQuertTime);
    cou_can_Ani = true;
    cou_can = false;
    if(localStorage[mobile+'shake_times'] == 1){
        //shakeAnmi($('#shake')[0], $('#lottery')[0]);
        setTimeout(function(){
            $('.login,.shade').hide()
            $('#shake_bg2').show();
            localStorage[mobile+'shake_times'] = 2;
            return
        },1600)
        return
    }
    localStorage[mobile+'shake_times'] = 1;
    //根据摇的幅度 获取优惠券
   coupon = shakeLatitude(maxXYZ);
    maxXYZ = 0;
    // 为提高响应速度, 并行执行
    // 创建post参数
   var thirdData = mobile ? {mobile: mobile} : {};

    // 经纬度
    /*if(localStorage.commonable){
        var __common_able = JSON.parse(localStorage.commonable);
        if(__common_able.indexlatlon){
            var _latlon_arr = __common_able.indexlatlon.split(',');
            postData['lastitude'] = _latlon_arr[0];
            postData['longitude'] = _latlon_arr[1];
        }
    }*/
    // 系统参数
    thirdData['system'] = device.os;
    thirdData['system_version'] = device.osVersion;
    setTimeout(function(){
        if(!thirdData.mobile){
            queryNotLanding(coupon)
        }else {
           thirdData = {
                mobile: thirdData.mobile,
                money: coupon.money,
                tag: 'timelimit',
                coupon_type: 1,
                model_id: coupon.model_id
            };
            $.ajax({
                url:url + 'api/NewShake/index',
                type:'post',
                dataType:'json',
                data:thirdData,
                success:function(res){
                    if(res.code != 0){
                        firstFill(res)
                        return;
                    }
                    querySeccess(res)
                },
                error:function(){
                    localStorage[mobile+'shake_times'] = 0;
                    $.alert('网络连接错误,请稍候重试');
                }
            });
        }
    },1500)
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

function shakeLatitude(maxXYZ){
    var num = maxXYZ;
    var randSum = rand(100);
    var coupon = {};
    //摇的幅度中再计算概率值
    if(num >= 45 && num < 50){
        if( randSum == 100 ){
            coupon.money = 10;
            coupon.model_id = 84;
        }else if(randSum == 99){
            coupon.money = 20;
            coupon.model_id = 85;
        }else {
            coupon.money = 5;
            coupon.model_id = 83;
        }
        coupon.type = 2
    }else if(num >= 50 && num < 60){
        if( randSum == 100 ){
            coupon.money = 10;
            coupon.model_id = 84;
        }else if(randSum == 99){
            coupon.money = 20;
            coupon.model_id = 85;
        }else {
            coupon.money = 5;
            coupon.model_id = 83;
        }
        coupon.type = 3
    }else if(num >= 60 && num <= 65){
        if( randSum == 100 ){
            coupon.money = 10;
            coupon.model_id = 84;
        }else if(randSum == 99){
            coupon.money = 20;
            coupon.model_id = 85;
        }else {
            coupon.money = 5;
            coupon.model_id = 83;
        }
        coupon.type = 4
    }else if(num > 65 ){
        if( randSum == 100 ){
            coupon.money = 10;
            coupon.model_id = 84;
        }else if(randSum == 99){
            coupon.money = 20;
            coupon.model_id = 85;
        }else {
            coupon.money = 5;
            coupon.model_id = 83;
        }
        coupon.type = 5
    }else {
        if( randSum == 100 ){
            coupon.money = 10;
            coupon.model_id = 84;
        }else if(randSum == 99){
            coupon.money = 20;
            coupon.model_id = 85;
        }else {
            coupon.money = 5;
            coupon.model_id = 83;
        }
        coupon.type = 1
    }
    return coupon

}

function queryNotLanding(coupon){
    var money = coupon.money;
    $('.yhq_box_show_txt').html('<span>￥</span>'+money);
    $('.shade,.yhq_box,.yhq_box_show_input,.coup_btn,.icon-cancel').show();
    $('.clouds,.spoondrift').show();
    $('.rain,.sun').show();
    getNumbers();	// 主动刷新数据
}

var ani = {
    //乌云1
    clouds1:[{top : '0rem'},{top:'-2rem'},{top:'-2rem'},{top:'-3rem'},{top:'-6.5rem'}],
    //乌云2
    clouds2:[{top : '3.2rem'},{top:'0.5rem'},{top:'-5rem'},{top:'-8rem'},{top:'-8rem'}],
    //海浪1
    spoondrift1:[{bottom : 0},{bottom : '-0.5rem'},{bottom : '-0.5rem'},{bottom : '-4.8rem',left:'0'},{bottom:'-4.8rem'},{bottom:'-4.8rem'}],
    //海浪2
    spoondrift2:[{bottom : '3rem',left:'-20%'},{bottom : '-5rem',left:'0%'},{bottom : '-9rem',left:'0'},{'bottom': '-9rem',left:'0'},{'bottom': '-9rem',left:'0'}],
    //雨
    rain:[{opacity:'0.5'},{opacity:'0.5'},{opacity:'0.2'},{opacity:'0'},{opacity:'0'}],
    //太阳
    sun:[{opacity:'0'},{opacity:'0'},{opacity:'0'},{opacity:'0'},{opacity:'1'}],
    info:[{opacity:'0'},{opacity:'0'},{opacity:'0'},{opacity:'0'},{opacity:'1'}]
}
function querySeccess(res){
    // uuid token
    // 设置登录状态
    var d = res.data;
    commonable = getLdata("commonable") || {};
    commonable['uuid'] = uuid = d.uuid;
    commonable['token'] = token = d.token;
    commonable['phone']  = mobile =  d.mobile;
    setLdata("shakeCou",res);
    setLdata("commonable",commonable);
    coupon.type = getSdata("coupontype") || coupon.type;
    setSdata("coupontype",coupon.type);
    // 设置摇嗨状态
    localStorage[mobile+'shake_time'] = Date.now();
    localStorage[mobile+'shake_times'] = 1;
    // 成功领取
    $('.login,.close').hide();
    var money = moneyReZero(d.money);
    $('.yhq_box_show_txt').html('<span>￥</span>'+money);
    $('.shade,.yhq_box2,.go-index,.go-mycoupon').show();
    $('.yhq_box_show_notice').html('<span class="yhq_box_show_notice_font">已放入账号：</span>'+ d.mobile).css("display","block");
    $('.clouds,.icon-cancel2,.spoondrift').show();
    $('.rain').show();
    setTimeout(function(){
        $('.clouds.one').animate(ani.clouds1[coupon.type-1],2000);
        $('.clouds.two').animate(ani.clouds2[coupon.type-1],2000);
        $('.spoondrift.one').animate(ani.spoondrift1[coupon.type-1],2000);
        $('.spoondrift.two').animate(ani.spoondrift2[coupon.type-1],2000);
        $('.rain').animate(ani.rain[coupon.type-1],2000);
        if(coupon.type == 5){
            $('.sun,.sun-circle').show();
            setTimeout(function(){
                $('.sun').animate(ani.sun[coupon.type-1],2000,function(){
                    $('.sun').removeAttr('style').show().addClass('sun_ani');
                });
            },1000)
        }
        $('.head-top2').animate(ani.info[coupon.type-1],2000);
    },2000);
    getNumbers();	// 主动刷新数据

}
// 失败统一处理
function firstFill(data){
    if(data.msg == "验证码不正确"){
        $.alert('验证码不正确');
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
        $('.close,.icon-cancel').css('opacity','0');
        $('.close,.icon-cancel').hide();
        $('#screen_show,#numbers,#moneys').show();
        $('.login, .shade').hide();
        $('.qc-coupon').css('top','100%');
        $('.login,.shade').hide()
        $('#shake_bg2').show();
        $('.spoondrift').hide();
        $('.clouds').hide();
        $('.shade').hide();
        $('.yhq_box2').hide();
        $('.yhq_box').hide();
        $('.sun').hide();
        $('.rain,.close').hide();
        $('.sun-circle').hide();
        localStorage[mobile+'shake_times'] = 3;
        return
    }
    if(data.code == '209'|| data.code == '205'||　data.code == '220' || data.code == '201' || data.code == '202' || data.code == '203' || data.code == '206' || data.code == '204'　){
        $('.login,.shade').hide();
        $('.close,.icon-cancel').css('opacity','0');
        $('.close,.icon-cancel').hide();
        $('#shake_bg2').show();
        $('.spoondrift').hide();
        $('.clouds').hide();
        $('.shade').hide();
        $('.yhq_box2').hide();
        $('.yhq_box').hide();
        $('.sun').hide();
        $('.rain').hide();
        $('.sun-circle').hide();
        localStorage[mobile+'shake_times'] = 2;
        return
    }
    $.alert(data.msg,function(){
        localStorage[mobile+'shake_times'] = 2;
        cou_can = true;
    });
}
// 分享参数
// 朋友
var wx_config = {
    onMSAM : {
        link: location.href,
        imgUrl: 'http://'+location.host+'/img/1169.jpg',
        title: "先说抱歉！",
        desc: "还有，这次抢券不一般…",
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
        imgUrl: 'http://'+location.host+'/img/1169.jpg',
        title: "先说抱歉！",
        desc: "还有，这次抢券不一般…",
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