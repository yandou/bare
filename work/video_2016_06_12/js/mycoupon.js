// 我的优惠券
// 2016-5-25 13:43:58 张世祥
"use strict";
// 微信分享
var wx_config = {
	onMSAM: {
		// 朋友
		link: "http://m.juewei.com/myaccounts.html",
		trigger: function(){
			// 触发分享后回调  统计
			tongjiApi.query({"tag":"分享朋友触发/我的优惠券"})
		},
		success: function(){
			// 分享成功后回调  统计
			tongjiApi.query({"tag":"分享朋友成功/我的优惠券"})
		},
		cancel: function(){
			// 分享取消后回调  统计
			tongjiApi.query({"tag":"分享朋友取消/我的优惠券"})
		},
		fail: function(){
			// 分享失败后回调  统计
			tongjiApi.query({"tag":"分享朋友失败/我的优惠券"})
		}
	},
	onMSTL: {
		// 朋友圈
		link: "http://m.juewei.com/myaccounts.html",
		trigger: function(){
			// 触发分享后回调  统计
			tongjiApi.query({"tag":"分享朋友圈触发/我的优惠券"})
		},
		success: function(){
			// 分享成功后回调  统计
			tongjiApi.query({"tag":"分享朋友圈成功/我的优惠券"})
		},
		onMSTLCan: function(){
			// 分享取消后回调  统计
			tongjiApi.query({"tag":"分享朋友圈取消/我的优惠券"})
		},
		onMSTLFail: function(){
			// 分享失败后回调  统计
			tongjiApi.query({"tag":"分享朋友圈失败/我的优惠券"})
		},
	}
}
get_city_name_by_geo(wx_config)
/**
 * 注意事项: 优惠券过期时间;
 * 			 满0元替换字样;
 */
// 我的优惠券页面
$(function() {
	var landingBool = oldCustom();
	// 是否刷新 反回空内容
	if(location.hash){
		locationClearCache("mycoupon.html")
	}

	// 预加载 图片
	var manifest = [],preload;
	//定义相关JSON格式文件列表
	function setupManifest() {
	   manifest.push({src:"img/1017.png"})
	}
	function startPreload() {
	    preload = new createjs.LoadQueue(true);
	    //注意加载音频文件需要调用如下代码行
	    preload.installPlugin(createjs.Sound);         
	    preload.on("complete", loadComplete);
	    preload.on("error", loadError);
	    preload.loadManifest(manifest);
	}
	function loadError(evt) {
	    console.log("加载出错！",evt.text);
	}
	function loadComplete(event) {
	    console.log("已加载完毕全部资源");
	    $(".com-dis-none").css({"display":"block"})
	}
	setupManifest();
	startPreload();

	// 二维码
	function phone(){
		var arr = commonable.phone;
			arr = arr.split("");
		$("#shakePhone").html(arr[0]+arr[1]+arr[2]+"-"+arr[3]+arr[4]+arr[5]+arr[6]+"-"+arr[7]+arr[8]+arr[9]+arr[10]).css({'color':'#333;font-size: 1.5rem;'});
		$(".get-code div").prepend('<img src="'+url+'api/user/genCode?mobile='+commonable.phone+'" /><span class="logo"></span>')
	};
	phone();

	var num = 0;	// 加载的页面
	var nowDay = new Date();	
	// 获取当前0点的时间
	var timer = parseInt(convertTimes(nowDay.getUTCFullYear(),nowDay.getUTCMonth()+1,nowDay.getUTCDate())/1000)
	var iscouponCode = true,number,gift;	// 防止重复兑换优惠券
	// $.showPreloader();
	// init
	common.ajaxApi(url+ "api/My/coupon",
		function(res){
			number = res.data.coupon.length;
			var gift_len = res.data.gift.length;
			if(!number) {
				$("#boxNum").html("");
				$("#orpBox").append('<div class="air">我已经准备好姿势，<span class="col-blue">等你来领</span></div>')
				$("#history").hide();
			}else {
				$("#boxNum").html('有<b>'+number+'</b>张优惠券可用');
			}
			if(!gift_len) {
				$("#giftboxNum").html("");
				$("#giftorpBox").append('<div class="air">我已经准备好姿势，<span class="col-blue ind">等你来领</span></div>')
				$("#gifthistory").hide();
			}else {
				$("#giftboxNum").html('有<b>'+gift_len+'</b>张礼品券可用');
			}
			$("#orpBox ul").remove();
			$("#giftorpBox ul").remove();
			// 输出
			outCou(res.data.coupon,$("#orpBox"));
			outGift(res.data.gift,$("#giftorpBox"));
		},function(res){
			$.alert(res.msg)
		},{token: commonable.token,user_id: commonable["uuid"],type: "list"
	})
	// 优惠券输出
	function outCou(couArr,obj) {
		var number = couArr.length;
		for(var i = 0; i < number; i++ ) {
			//过期时间
			var overDay = couArr[i].over_time == 0? "今天过期":"还有"+couArr[i].over_time+"天过期"; 
			// 输出
			var ul = $('<ul class="clearfix" data-way="'+couArr[i].way+'"></ul>');
			// 判断是什么类型的优惠券 种类 1普通2立减3摇嗨4新用户立减5红包6折扣 
			if(couArr[i].type == 6 ){
				ul.append('<li style="line-height:23vw"><strong>'+moneyReZero(couArr[i].money)+'</strong><span>折</span><em>全场无门槛使用</em></li>');
			}else if(couArr[i].full_money == 0 ){
				ul.append('<li><span>￥</span><strong>'+moneyReZero(couArr[i].money)+'</strong><em>全场无门槛使用</em></li>');
			}else {
				ul.append('<li><span>￥</span><strong>'+moneyReZero(couArr[i].money)+'</strong><em>满'+parseInt(couArr[i].full_money)+'元可以使用</em></li>');
			}
			ul.append('<li>不与其它优惠同享</li>');
			ul.append('<li>'+overDay+'</li>');
			ul.append('<li>有效期至'+ormatDate(couArr[i].end_time,1)+'</li>');
			ul.append('<li class="proper com-select-code select"></li>');
			ul.appendTo(obj);
		}
	}
	// 礼品券输出 
	function outGift(couArr,obj) {
		var number = couArr.length;
		for(var i = 0; i < number; i++ ) {
			//过期时间
			var overDay = couArr[i].over_time == 0? "今天过期":"还有"+couArr[i].over_time+"天过期"; 
			// 输出
			var div = $('<div class="mygift" data-way="'+couArr[i].way+'"></div>');
			// 判断是什么类型的优惠券 种类 1普通2立减3摇嗨4新用户立减5红包6折扣 
			div.append('<img src="img/li_p1.png" class="select" >')
			div.append('<p class="p1">余额<i>￥</i><span>'+couArr[i].remain_money+'</span></p>')
			div.append('<span>不与其它优惠同享</span>');
			div.append('<p class="p2">总额：'+couArr[i].money+'<br>有效期：'+ormatDate(couArr[i].end_time,1)+'</p>');
			div.appendTo(obj);
		}
	}
	// 过期输出
	function outCouOverdue(couArr,obj) {
		var number = couArr.length;
		for(var i = 0; i < number; i++ ) {
			//过期时间
			var overDay = parseInt((couArr[i].end_time - timer)/86400)+1; 
			// 输出
			var ul = $('<ul class="clearfix"></ul>');
			// 判断是什么类型的优惠券 种类 1普通2立减3摇嗨4新用户立减5红包6折扣 
			if(couArr[i].type == 6 ){
				ul.append('<li style="line-height:23vw"><strong>'+moneyReZero(couArr[i].money)+'</strong><span>折</span><em>全场无门槛使用</em></li>');
			}else if(couArr[i].full_money == 0 ){
				ul.append('<li><span>￥</span><strong>'+moneyReZero(couArr[i].money)+'</strong><em>全场无门槛使用</em></li>');
			}else {
				ul.append('<li><span>￥</span><strong>'+moneyReZero(couArr[i].money)+'</strong><em>满'+parseInt(couArr[i].full_money)+'元可以使用</em></li>');
			}
			ul.append('<li>不与其它优惠同享</li>');
			ul.append('<li>已过期</li>');
			ul.append('<li>有效期至'+ormatDate(couArr[i].end_time,1)+'</li>');
			ul.append('<li class="proper"></li>');
			ul.appendTo(obj);
		}
	}
	// 滚动加载 历史优惠卷
	$(document).on("infinite", function(e, pageId, $page) {
	  if(pageId == "couponHistory") {
	  	historyCou(couponPage,$("#popupBox"));
	  }
	  if(pageId == "moneyHistory") {
	  	historyMoney(moneyPage,$("#moneypopupBox"));
	  }
	});

	// 点击过期历史记录
	var boolSex = true;		//防止重复提交
	var firstbool = true;	//第一次加载历史优惠卷
	var couponPage = 1;
	
	$(document).on('click','.open-couponhistory', function () {
		if(firstbool){
			historyCou();
		}
	});

	// 点击过期历史记录
	var moneyboolSex = true;		//防止重复提交
	var moneyfirstbool = true;	//第一次加载历史优惠卷
	var moneyPage = 1;
	$(document).on('click','.open-moneyhistory', function () {
		if(moneyboolSex){
			$.router.loadPage("#moneyHistory")
			historyMoney(moneyboolSex,moneyPage,$("#moneypopupBox"));
		}else {
			$.router.loadPage("#moneyHistory")
		}
	});
	//  滚动加载优惠券函数   boolSex防止重复请求  firstbool是否第一次加载  couponPage优惠券页数  插入优惠的对象
	function historyCou() {
		if (!boolSex) {return};
		$("#popupBox").append('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>')	
		firstbool = false;
		boolSex = false;
		$.ajax({
			url: url+ "api/my/coupon",
			type: "post",
			data: {
				token: commonable.token,
				user_id: commonable["uuid"],
				type: "history",
				page: couponPage
			},
			dataType: "json",
			success:function(res){
				boolSex = true;
				if(isResCode(res))return
				if(res.code == 0) {
					couponPage++;
					// 删除加载提示符
					$('.infinite-scroll-preloader').remove();
					// 没有内容的时候
					if(res.data.coupon.length==0){
						boolSex = false;
			          	$.toast("没有优惠券了!");
			          	 // 加载完毕，则注销无限加载事件，以防不必要的加载
     					$.detachInfiniteScroll($('.infinite-scroll'));
			          	return;
					}
					// 正常加载
					$("#popupBox").find("div").remove();
					outCouOverdue(res.data.coupon,$("#popupBox"))
				}
			},
			error:function(){
				$.alert("网络连接失败，请重新刷新！")
			}
		})
	}
	//  滚动加载礼品券函数   boolSex防止重复请求  firstbool是否第一次加载  couponPage优惠券页数  插入优惠的对象
	function historyMoney() {
		if (!moneyboolSex) {return};
		$("#moneypopupBox").append('<div class="infinite-scroll-preloader"><div class="preloader"></div></div>')	
			moneyfirstbool = false;
		moneyboolSex = false;
		$.ajax({
			url: url+ "api/my/coupon",
			type: "post",
			data: {
				token: commonable.token,
				user_id: commonable["uuid"],
				type: "history",
				page: moneyPage
			},
			dataType: "json",
			success:function(res){
				moneyboolSex = true;
				if(isResCode(res)) return;
				if (res.code == 0) {
					moneyPage++;
					// 删除加载提示符
					$('.infinite-scroll-preloader').remove();
					// 没有内容的时候
					if(res.data.gift.length == 0){
						moneyboolSex = false;
			          	$.toast("没有礼品券了!");
			          	 // 加载完毕，则注销无限加载事件，以防不必要的加载
     					$.detachInfiniteScroll($('.infinite-scroll'));
			          	return;
					}
					// 正常加载
					$("#moneypopupBox").find("div").remove();
					outCouOverdue(res.data.gift,$("#popupBox"))
				}
			},
			error:function(){
				$.alert("网络连接失败，请重新刷新！")
			}
		})
	}
	// 等你来领
	$(document).on("tap",".air span",function(){
		if($(this).hasClass("ind")){
			locationClearCache("positions.html");
			return;
		}
		locationClearCache("shake.html")
	})
	// 返回我的
	$(document).on("tap",".back_myaccoutns",function(){
		history.go(-1)
	})
	// 去优惠券说明
	$(document).on("tap","#explain,#giftexplain",function(){
		locationClearCache("coupon_instructions.html?page=mycoupon")
	})
	// 点击兑换
	$(document).on("tap","#exchange",function(){
		console.log(1)
		$(".ordeform-time").show();
		$(".ordeform-t").show();
	})
	// 点击兑换背后的蒙版
	$(document).on("tap",".ordeform-time,.icon-cancel",function(e){
		e.stopPropagation();
		e.preventDefault();
		$("#cancel").trigger("tap")
	})
	// 点击兑换中的取消按钮
	$(document).on("tap","#cancel",function(e){
		$(".ordeform-time").hide();
		$(".ordeform-t").hide();
		$(".get-code").hide();
		$(".content").css({"overflow":"auto"})
	})
	// 点击兑换中的确定按钮
	$(document).on("tap","#confirm",function(e){
		var couponCode = $("#getCoupons").val();
		if(!couponCode){return}
		// $.showPreloader();
		$.ajax({
			url: url + "api/user/getCoupons",
			type: "post",
			data: {
				user_id: commonable["uuid"],
				token: commonable["token"],
				code: couponCode
			},
			dataType: "json",
			success:function(res){
				$.hidePreloader();
				if(isResCode(res))return;
				if(res.code == "0"){
					console.log(res)
					// 优惠券生成节点
					location.reload();
				}else{
					$.alert(res.msg)
				}
			}
		})
	})
	$(document).on("tap",".select",function(){

		console.log($(this).parent().data("way"))
		$(".content").css({"overflow":"none"})
		if($(this).parent().data("way") == "0"){
			// 外卖类型时去首页
			locationClearCache("positions.html")
		}else if($(this).parent().data("way") == "1") {
			// 线下类型时弹出二维码
			 $(".get-code").show();
		}else if($(this).parent().data("way") == "2") {
			// 通用类型时弹出提示框
			var modal = $.modal({
		      	title: '使用优惠券',
		      	buttons: [{
		          	text: '点外卖',
		          	onClick:function(){
		          		locationClearCache("positions.html")
		          	}
		        },{
		          	text: '<b>门店用</b>',
		          	onClick: function () {
		            	$(".get-code").show();
		          	}
		        }]
		    })
		}
	})
	$(document).on("tap",".modal-overlay",function(){
		$.closeModal();
	})
	$.init();
})
