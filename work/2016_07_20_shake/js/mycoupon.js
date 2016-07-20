// 我的优惠券
// 2016-6-10 00:27:32张世祥
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
	if(GetQueryString("shakeData")){
		commonable = JSON.parse(decodeURI(GetQueryString("shakeData")));
	}
	//判断显示礼品卷
	var state=GetQueryString('state');
	if(state==1){
		$('.tab-link').eq(0).removeClass('active');
		$('#tab1').removeClass('active');
		$('.tab-link').eq(1).addClass('active');
		$('#tab2').addClass('active');
	}
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
	var overObj = {}; //存放倒计时时间和节点
	// 获取当前0点的时间
	var timer = parseInt(convertTimes(nowDay.getUTCFullYear(),nowDay.getUTCMonth()+1,nowDay.getUTCDate())/1000)
	var iscouponCode = true,number,gift;	// 防止重复兑换优惠券
	// $.showPreloader();
	// init
	if(GetQueryString("shakeData")){
		$.showPreloader();
		setTimeout(function(){
			initCoupon()
		},3000)
	}else {
		initCoupon()
	}
	function initCoupon() {
		common.ajaxApi(url+ "api/My/coupon",
			function(res){
				number = res.data.coupon.length;
				var gift_len = res.data.gift.length;
				if(!number) {
					$("#boxNum").html("");
					$("#orpBox").append('<div class="air">我已经准备好姿势，<span class="col-blue">等你来领</span></div>')
					$("#history").css({
						position: 'absolute',
						bottom: '0rem',
						left: 0,
						right: 0,
						margin: '0 auto'
					});
				}else {
					$("#boxNum").html('有<b>'+number+'</b>张满减券可用');
				}
				if(!gift_len) {
					$("#giftboxNum").html("");
					$("#giftorpBox").append('<div class="air">更多立减券，<span class="col-blue ind">尽在热门活动</span></div>')
					$("#gifthistory").css({
						position: 'absolute',
						bottom: '0rem',
						left: 0,
						right: 0,
						margin: '0 auto'
					});
				}else {
					$("#giftboxNum").html('有<b>'+gift_len+'</b>张立减券可用');
				}
				$('#orpBox ul').remove();
				$("#giftorpBox ul").remove();
				//测试数据
				/*var ceshi={
					bonus_model_id:"0",
					code:"",
					coupon_type:"3",
					create_time:"1465891970",
					end_time:(new Date().getTime()+30*60*1000)/1000,
					from_order_id:"0",
					full_money:"0.00",
					get_time:"1465891970",
					head_img:"",
					id:"298371",
					is_get:"1",
					is_used:"0",
					max_reduce_money:"0.00",
					model_id:"58",
					money:"30.00",
					name:"30元礼品券",
					nick_name:"",
					over_time:34,
					phrase:"",
					remain_money:"30.00",
					remark:"superAdmin添加备注：",
					start_time:"1465833600",
					type:"7",
					update_time:"0",
					url:"",
					used_order_id:"0",
					used_time:"0",
					user_id:"41985",
					uuid:"e46ff5c7-5531-ca4b-5e40-d1d89e18ffd5",
					way:"2"
				};
				res.data.gift.push(ceshi);*/
				// 输出
				outCou(res.data.coupon,$("#orpBox"));
				outGift(res.data.gift,$("#giftorpBox"));
			},function(res){$.alert(res.msg)},
			{token: commonable.token,user_id: commonable["uuid"],type: "list"}
		)

		// 拉新大礼包提示
		common.ajaxApi(url + 'api/CouponsActivity/getRemindInfo',
			function(res) {
				var multiple = res.data.people;
				var couponsList = res.data.couponsList;
				if(!couponsList) {
					return
				}
				var len = couponsList.length;
				var target = $('#peckgiftCon');
				if(!len){return}
				$('.peckgift').show();
				for(var i = 0; i < len; i++ ){
					for(var j = 0; j < multiple; j++) {
						target.append('<ul><li><span>¥</span>'+moneyReZero(couponsList[i].money)+'</li><li>满'+moneyReZero(couponsList[i].full_money) +'元可用，全场通享</li></ul>')
					}
				}
				common.ajaxApi(url + 'api/CouponsActivity/getRemindInfo',
					function(){},function(){},
					{token: commonable.token,user_id: commonable["uuid"],type:1})
			},
			function(res){$.alert(res.msg)},
			{token: commonable.token,user_id: commonable["uuid"]}
		)
	}
	// 满减券输出
	function outCou(couArr,obj) {
		var number = couArr.length;
		for(var i = 0; i < number; i++ ) {
			//过期时间
			var overDay = couArr[i].over_time == 0? "今天过期":"还有"+couArr[i].over_time+"天过期";
			var way;
			// 输出
			var ul = $('<ul class="clearfix" data-way="'+couArr[i].way+'"></ul>');
			if(couArr[i].way == 0){
				way = '外卖专享';
			}else if(couArr[i].way == 1){
				way = '门店专享';
			}else {
				way = '全场通享';
			}
			// 判断是什么类型的优惠券 种类 1普通2立减3摇嗨4新用户立减5红包6折扣
			if(couArr[i].type == 6 ){
				ul.append('<li style="line-height:23vw"><strong>'+moneyReZero(couArr[i].money)+'</strong><span>折</span><em>全场无门槛使用</em></li>');
			}else if(couArr[i].full_money == 0 ){
				ul.append('<li><span>￥</span><strong>'+moneyReZero(couArr[i].money)+'</strong><em>全场无门槛使用</em></li>');
			}else {
				ul.append('<li><span>￥</span><strong>'+moneyReZero(couArr[i].money)+'</strong><em>满'+parseInt(couArr[i].full_money)+'元可用，'+ way + '</em></li>');
			}
			ul.append('<li>不与其它优惠同享</li>');
			ul.append('<li>'+overDay+'</li>');
			ul.append('<li>有效期至'+ormatDate(couArr[i].end_time,1)+'</li>');
			ul.append('<li class="proper com-select-code select"></li>');
			ul.appendTo(obj);
		}
	}
	// 立减券输出
	function outGift(couArr,obj) {
		var number = couArr.length;
		var way;
		for(var i = 0; i < number; i++ ) {
			var div = $('<div class="mygift" data-way="'+couArr[i].way+'" id="o'+ couArr[i].uuid +'"></div>');
			//过期时间  type类型7 就显示倒计时
			if( couArr[i].type==7){
				var t = overDate(Date.now()/1000+couArr[i].valid_day)
				overObj[couArr[i].uuid] = Date.now()/1000+couArr[i].valid_day;
				if(couArr[i].valid_day<=0){
					div.addClass('mygift_g');
				}
				div.addClass('overgift');
			}
			if(couArr[i].way == 0){
				way = '外卖专享';
			}else if(couArr[i].way == 1){
				way = '门店专享';
			}else {
				way = '全场通享';
			}
			// 输出
			// 判断是什么类型的优惠券 种类 1普通2立减3摇嗨4新用户立减5红包6折扣
			div.append('<i><img src="img/li_p1.png" class="select" ></i>')
			div.append('<p class="p1">余额<i>￥</i><span>'+couArr[i].remain_money+'</span></p>')
			div.append('<span>' + way + '，不与其它优惠同享</span>');
			if(div.hasClass('overgift')){
				div.append('<p class="p2"><i>还有:</i><i class="hh">'+t.mm+'</i><i>:</i><i class="mm">'+t.ss+'</i><i>:</i><i class="ss">'+0+'</i> 过期</p>');
			}else {
				div.append('<p class="p2">总额：'+couArr[i].money+'<br>有效期至：'+ormatDate(couArr[i].end_time,1)+'</p>');
			}
			if(couArr[i].type==7){
				div.prependTo(obj);
			}else{
				div.appendTo(obj);
			}

		}
		overTime()// 倒计时执行
		console.log(overObj)
	}
	//过期满减券输出
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
				ul.append('<li><span>￥</span><strong>'+moneyReZero(couArr[i].money)+'</strong><em>满'+parseInt(couArr[i].full_money)+'元可用，全场通享</em></li>');
			}
			ul.append('<li>不与其它优惠同享</li>');
			ul.append('<li>已过期</li>');
			ul.append('<li>有效期至'+ormatDate(couArr[i].end_time,1)+'</li>');
			ul.append('<li class="proper"></li>');
			ul.appendTo(obj);
		}
	}
	
	//过期立减券记录
	function outGiftOverdue(couArr,obj) {
		var number = couArr.length;
		var way;
		for(var i = 0; i < number; i++ ) {
			//过期时间
			var overDay = couArr[i].over_time == 0? "今天过期":"还有"+couArr[i].over_time+"天过期";
			// 输出
			var div = $('<div class="mygift mygift_g" data-way="'+couArr[i].way + '"></div>');
			// 判断是什么类型的优惠券 种类 1普通2立减3摇嗨4新用户立减5红包6折扣
			if(couArr[i].way == 0){
				way = '外卖专享';
			}else if(couArr[i].way == 1){
				way = '门店专享';
			}else {
				way = '全场通享';
			}
			div.append('<i></i>')
			div.append('<p class="p1">余额<i>￥</i><span>'+couArr[i].remain_money+'</span></p>')
			div.append('<span>' + way + '，不与其它优惠同享</span>');
			div.append('<p class="p2">总额：'+couArr[i].money+'<br>有效期：'+ormatDate(couArr[i].end_time,1)+'</p>');
			div.appendTo(obj);
		}
	}
	//处理时间格式
	function overDate(time){
		var ts = parseInt(time) * 1000 - Date.now();
		if(ts <= 0){
			return false
		}
		var hh = parseInt(ts / 1000 / 60 / 60, 10);
		var mm = parseInt(ts / 1000 / 60 % 60, 10);
		var ss = parseInt(ts / 1000 % 60, 10);
		return {
			hh: hh > 9 ? hh : '0'+hh,
			mm: mm > 9 ? mm : '0'+mm,
			ss: ss > 9 ? ss : '0'+ss
		}
	}
	function overTime(){
		var j=9;
		var timer = setInterval(function(){
			j--;
			for(var i in overObj){
				$("#o"+i).find('.ss').text(j)
				if(j==0){
					second();
					j=9;
				}
			}
		},100)
		var second=function(){
			for(var i in overObj){
				var t = overDate(overObj[i])
				if(t){
					$("#o"+i).find('.hh').text(t.mm)
					$("#o"+i).find('.mm').text(t.ss)
				}else{
					$("#o"+i).find('.hh').text('00')
					$("#o"+i).find('.mm').text('00')
					$("#o"+i).find('.ss').text('0')
					$("#o"+i).addClass('mygift_g')
					$('#o'+i).children('i').eq(0).remove();
					delete overObj[i];
					//clearInterval(timer);
				}
			}
		}
	}
	// 滚动加载 历史优惠卷
	$(document).on("pageInit", "#couponHistory",function(e, id, page) {
		$(document).on("infinite", function () {
			historyCou(couponPage, $("#popupBox"));
		});
	});
	$(document).on("pageInit", "#moneyHistory",function(e, id, page) {
		$(document).on("infinite", function () {
			historyMoney(moneyPage, $("#moneypopupBox"));
		});
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
	//大礼包消失按钮
	$(document).on('click','.peckgift-icon-cancel',function(){
		$('.peckgift').hide();
	})

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
					if(res.data.length == 0){
						boolSex = false;
			          	 // 加载完毕，则注销无限加载事件，以防不必要的加载
     					$.detachInfiniteScroll($('.infinite-scroll'));
			          	return;
					}
					// 正常加载
					$("#popupBox").find("div").remove();
					outCouOverdue(res.data,$("#popupBox"))
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
				is_gift:'1',
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
					if(res.data.length == 0){
						moneyboolSex = false;
			          	 // 加载完毕，则注销无限加载事件，以防不必要的加载
     					$.detachInfiniteScroll($('.infinite-scroll'));
						$("#moneypopupBox").append('<div style="height: 1rem"></div>')
			          	return;
					}
					// 正常加载
					$("#moneypopupBox").find(".air").remove();
					outGiftOverdue(res.data,$("#moneypopupBox"))
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
			locationClearCache("activity.html");
			return;
		}
		locationClearCache("shake.html")
	})
	function historyGift(){
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
				is_gift:'1',
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
						// 加载完毕，则注销无限加载事件，以防不必要的加载
						$.detachInfiniteScroll($('.infinite-scroll'));
						return;
					}
					// 正常加载
					$("#moneypopupBox").find("div").remove();
					outCouOverdue(res.data.gift,$("#moneypopupBox"))
				}
			},
			error:function(){
				$.alert("网络连接失败，请重新刷新！")
			}
		})
	}
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
	$(document).on("click",".select",function(){
		var mygift=$(this).parents('div.mygift');
		if($(this).hasClass('com-select-code')){
			var tit = '使用满减券'
		}else {
			var tit = '使用立减券'
		}
		if(mygift.hasClass('overgift')){
			var modal = $.modal({
		      	title: tit,
		      	buttons: [{
					text: '<b>门店用</b>',
					onClick: function () {
						$(".get-code").show();
					}
				}]
		    })
		}else if(mygift.attr('data-way')==0){
			var modal = $.modal({
		      	title: tit,
		      	buttons: [{
					text: '<b>点外卖</b>',
					onClick: function () {
		          		locationClearCache("positions.html")
					}
				}]
		    })
		}else{
			var modal = $.modal({
		      	title:tit,
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
