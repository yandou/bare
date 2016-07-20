var comPage = {
		"1" : 1,
		"2" : 1,
		"3" : 1
},send_fee;

var comb = getLdata("commonable") || {};
var obj;
var city_name;
var flag = 0;
var is_open = 0;
var isOfficeHours = true,shop_start_time,shop_end_time;//营业时间
//微辣中辣重辣-列表页
function loads(taste_id, tab, cb, cb2) {
	
	var _loading_ele = $('#loading_img');
	var _current_ele = $('#' + tab).get(0);

	//添加gif加载状态图
	var addLoading = function() {						
		var _loading = '<div class="infinite-scroll-preloader"><div class="preloader"></div></div>';
		
		if (_loading_ele.length) {
			_loading_ele.html(_loading);
		} else {
			var _loading_html = '<div id="loading_img" style="text-align:center;padding-bottom:1.2rem;">' + _loading + '</div>';
			$('#buy_price').append(_loading_html);
			_loading_ele = $('#loading_img');
		}
	}
	
	if (_current_ele.loaded !== 1) {
		addLoading();
	}
	
	// $.showPreloader();
	// 获取页数
	for(var i in comPage) {
		if( i == taste_id) {
			var page = comPage[i];		
		}
	}
	$.ajax({
		type: "post",
		url: url + "api/goods/list",
		data: {
			location: latlon,
			page: page,
			taste_id: taste_id,
			city_name: city_name,
			province: commonable["pos_province"]
		},
		dataType: 'json',
		success: function(res) {
			cb && cb();
			if (res.code == "0") {

				var num = res.data.goods.length;
				if(num < 10){
					cb2 && cb2();
					_current_ele.loaded = 1;
				}
				// 是否在可配送范围
				flag = res.data.flag;
				// 是否在开通城市
				is_open = res.data.is_open;
				
				var main = document.getElementById(tab);
				// 对应的页数相加
				for(var i in comPage) {
					if( i == taste_id) {
						if(comPage[i] == 1){
							// 当第一次搜索的时候记录起送价和配送费
							send_fee = res.data.send_fee;	//起送金额
							$("#qsje").html(moneyReZero(send_fee));	
							$("#allprice").next().html("另需配送费"+ res.data.dispatch_fee +"元")	// 配送费
							// 临时存储 配送费和起送金额
							sessionStorage.setItem("send_fee",send_fee );
							sessionStorage.setItem("dispatch_fee",res.data.dispatch_fee );

							// 营业时间
							var timer = new Date(res.time+'000');
							timer.setTime(res.time+'000');
							var hours = timer.getHours();
							var mins = timer.getMinutes();
							shop_start_time = res.start_time.toString();
							shop_end_time = res.end_time.toString();
							var start_time_hh = shop_start_time.split(':')[0];
							var start_time_mm = shop_start_time.split(':')[1];
							var end_time_hh = shop_end_time.split(':')[0];
							var end_time_mm = shop_end_time.split(':')[1];
							//  判断当前小时
							if(hours > start_time_hh && hours < end_time_hh ){
								// 在营业时间
							}else if(hours == start_time_hh || hours == end_time_hh) {
								if(hours == start_time_hh){
									// 当小时一样的时候, 判断分钟
									//当前分钟 小于 开始时间
									if(mins <= start_time_mm){
										isOfficeHours = 'no';
									}
								}
								if(hours == end_time_hh ){
									// || 当前分钟 大于 结束时间
									if(mins >= end_time_mm){
										isOfficeHours = 'no';
									}
								}
							}else {
								isOfficeHours = 'no'
							}
							if(isOfficeHours == 'no' && taste_id == 1){
								$.alert('亲，请在营业时间'+shop_start_time+'-'+shop_end_time+'下单。<br>现在可以继续浏览商品哦！');
							}
							sessionStorage.setItem("isOfficeHours", isOfficeHours);
							sessionStorage.setItem("shop_start_time", shop_start_time);
							sessionStorage.setItem("shop_end_time", shop_end_time);
							deal_dispatch();
							subtotal();
							panduan();
						}
						comPage[i]++;
					}
				}
				if(num == 0 && page == 1){
					var mtp = $('<div class="mtp"><p>暂无商品，<a external href="shake.html">快抢福利</a></p></div>');
					main.appendChild(mtp[0])
				}
				// 商品数据
				for (var i = 0; i < num; i++) {
					var goodsArray = res.data.goods[i];
					var picitem12 = $('<div class="card demo-card-header-pic"><div class="card-header color-white no-border no-padding shop-good-id"></div></div>');
					if(res.data.big_sum > i){
						// 大图
						$('<img src="img/1102.png">').appendTo(picitem12.find('div'));
					}else {
						// 小图
						picitem12.addClass('demo-card-header-small').find('div').append('<img src="img/1104.png">');
					}
					picitem12.append("<div class='card-content'><div class='card-content-inner food-title' goods_id='" + goodsArray.uuid + "'><p><b class='font-small font-grey'>" + goodsArray.goods_name + "</b><span class='food_dw'>(" + goodsArray.taste_name + ")</span></p></div></div>");
					imgload(head_url + goodsArray.big_img +ossImgWidth,picitem12[0]);
					// 大图小图规格
					var unit = goodsArray.unit ? "/"+goodsArray.unit : "";	//规格
					if(res.data.big_sum > i){
						// 大图
						var menshiprice = (goodsArray.original_price && ((goodsArray.price*100) < goodsArray.original_price*100)) ? "<span class='menshiprice'>门市价:￥"+moneyReZero(goodsArray.original_price)+"</span>" : '';

						picitem12[0].innerHTML += "<div class='pricebuy'><span class='font-gray unitnone'>" + unit + "</span><b>¥</b><font class='price'><span>" + moneyReZero(goodsArray.price) + "</span></font><span class='font-gray unit'>" + unit + "</span>"+menshiprice+"<span class='add' id='ad" + goodsArray.uuid + "' goods_type='"+goodsArray.type+"' teste_id='1' goods_ids='" + goodsArray.uuid + "'><em data-statistics='外卖商品加/"+goodsArray.uuid+"/"+goodsArray.goods_name+"/"+goodsArray.taste_name+"'></em></span><span id='num_box" + goodsArray.uuid + "' disabled='disabled' class='text_box'>0</span><span class='min' teste_id='1' goods_type='"+goodsArray.type+"' id='mi" + goodsArray.uuid + "' goods_ids='" + goodsArray.uuid + "' data-statistics='外卖商品减/"+goodsArray.id+"/"+goodsArray.goods_name+"/"+goodsArray.taste_name+"'></span><span class='subtotal' style='display: none;'></span></div>";
					}else {
						// 小图
						// 折扣
						console.log(goodsArray.type,goodsArray.original_price != goodsArray.price)
						if(goodsArray.type == "2" || goodsArray.type == "3" && goodsArray.original_price != goodsArray.price){
							var pricebuy = "pricebuys"
						}else {
							var pricebuy = ""
						}
						picitem12[0].innerHTML += "<div class='pricebuy "+pricebuy+"'><b>¥</b><font class='price'><span>" + moneyReZero(goodsArray.price) + "</span></font><span class='font-gray unit'>" + unit + "</span><span class='add' id='ad" + goodsArray.uuid + "' goods_type='"+goodsArray.type+"' teste_id='1' goods_ids='" + goodsArray.uuid + "'><em data-statistics='外卖商品加/"+goodsArray.uuid+"/"+goodsArray.goods_name+"/"+goodsArray.taste_name+"' ></em></span><span id='num_box" + goodsArray.uuid + "' disabled='disabled' class='text_box'>0</span><span class='min' teste_id='1' goods_type='"+goodsArray.type+"' id='mi" + goodsArray.uuid + "' goods_ids='" + goodsArray.uuid + "' data-statistics='外卖商品减/"+goodsArray.uuid+"/"+goodsArray.goods_name+"/"+goodsArray.taste_name+"' ></span><span class='subtotal' style='display: none;'></span></div>";
					}
					main.appendChild(picitem12[0]);
				}

				if(flag == "0" && is_open == "1"){
					var obj = getLdata("carts") || {}; //判断本地存储是否为空
					for (k in obj) {
						$('#num_box' + k).text(obj[k].food_num);
						if($('#num_box' + k).text() != 0){
							$('#num_box' + k).show().parent().find('.min').show();
						}
					};
                    deal_dispatch();
				}else {
					$(".all_num").remove();
					var str = is_open == 1 ? "亲，您现在不在配送范围。" : "您所在的城市尚未开通。";
					$('.total').html(str).css({'line-height':'2.5rem',"left":"0.5rem"})
					$(".icon-car").remove();
					$(".order-link").removeClass("actives");
					$("#conOrder").css("background","#ccc").removeAttr("id")
				}
				$.refreshScroller()
			}else {
				if(res.msg == "附近没有门店"){
					var main = document.getElementById(tab);
					$(main).append('<div class="mtp"><p>您的地址不在配送范围</p></div>')
				}
			}
			// $.hidePreloader();
			_loading_ele.html('');
		},
		error: function(data) {
			// $.hidePreloader();
			cb && cb();
			$.alert('数据请求失败，请检查网络连接！');
			return;
		}
	});
}
function imgload(url,obj){
	var imgNode = new Image();
	imgNode.src= url;
	imgNode.onload = function(){
		$(obj).find("img").attr({"src":url})
	}
}
//跳转商品详情页
$(document).on('click', '.shop-good-id', function() {
	goods_id = $(this).next().find(".food-title").attr('goods_id');
	locationClearCache('product.html' + '?goods_id=' + goods_id + '&flag=' + flag + '&is_open=' + is_open)
})

//购物车弹出动画
var openstat = false;
$(".icon-car").on('click',function() {
	if($("#carts li").length == 0)return;
	if (openstat) {
		openstat = false;
		$('.tcbg').css("display", "none").animate({
			opacity: '0'
		});
		$('.selected-list').animate({
			"bottom": "-15rem"
		}, 200);
		$('.icon-car').animate({
			"bottom": "1.1rem"
		}, 200);
		$(this).next().animate({
			"left":"3rem"
		},200)
		$('.all_num').animate({
			"top": "-1.5rem"
		}, 200);
		$('.content').css('overflow', 'auto');
	} else {
		$('.content').css('overflow', 'hidden');
		openstat = true;
		$(this).next().animate({
			"left":"0.5rem"
		},350)
		$('.all_num').animate({
			"top": "-16.5rem"
		}, 200);
		$('.tcbg').css("display", "block").animate({
			opacity: '0.6'
		});
		$('.selected-list').animate({
			"bottom": "0rem"
		}, 200);
		$('.icon-car').animate({
			"bottom": "16rem"
		}, 200);
	}
})
//购物车弹出动画
$('.tcbg,.clear-cart').on('click', function() {

    $('.content').css('overflow','auto');
	openstat = false;
	$('.tcbg').css("display", "none").animate({
		opacity: '0'
	});
	$('.selected-list').animate({
		"bottom": "-15rem"
	}, 200);
	$('.icon-car').animate({
		"bottom": "1.1rem"
	}, 200);
	$('.all_num').animate({
		"top": "-1.5rem"
	}, 200);
	$(this).next().find("label").animate({
		"left":"3rem"
	},200)
})

//清空购物车
$('.clear-cart').on('click', function() {
	localData.remove("carts");
	clear_cart();
	$('.total').show();
	$('#qsje').text(moneyReZero(send_fee));
	$('.text_box').text("0").hide();
	$('.min').hide();
	$('#carts').html('');
	$('.icon-car').addClass('icon-car-grey');
	$('.tcbg').css("display", "none").animate({
		opacity: '0'
	});
	$('.selected-list').animate({
		"bottom": "-15rem"
	}, 200);
	$('.icon-car').animate({
		"bottom": "1.1rem"
	}, 200);
	$('.order-link').hide();
	$('.right-btn').show();
	$('.all_num').addClass("com-dis-none").css({"top":"-1.5rem"});
	$('#allprice').html('您的购物车还用吗').css('line-height','2.5rem');
	$('.total font').hide();
	$('.icon-car').addClass(".icon-car-grey");
	$(this).parent().next().children("label").animate({
		"left":"3rem"
	},200)
})
//清空购物车数据
function clear_cart() {
	$.ajax({
		type: "post",
		url: url + "api/cart/clean",
		data: {
			user_id: comb.uuid
		},
		dataType: 'json',
		success: function(res) {
		},
		error: function() {
			return;
		}
	});
}
//加入购物车请求
function addcart(t) {
	var aid = $(t).attr('goods_ids');
	var tid = $(t).attr('teste_id');
	var fnum = $(t).parent().find('.text_box').text();
	$.ajax({
		type: "post",
		url: url + "api/cart/add",
		data: {
			user_id: comb.uuid,
			goods_id: aid,
			taste_id: tid,
			goods_num: fnum
		},
		dataType: 'json',
		async: true,
		error: function() {
			return;
		}
	});
}
//购物车商品修改（增加）
$(document).on('click', '.add2', function() {
	var t = $(this).parent().find('span[class*=text_box]');
	t.text(parseInt(t.text()) + 1);
	if (isNaN(t.text())) {
		t.text(0);
	}
	var boxid = 'num_box' + $(this).attr('goods_ids');
	$('#' + boxid).text($(this).parent().find('.text_box').text());

	var jsid = $(this).attr('goods_ids');
	var price = $(this).parents().find('.prices span').html();
	var food_name = $(this).parents().find('.food-name b').html()
	var taste_name = $(this).parents().find('.food-name span').html()
	var food_num = $(this).parent().find('.text_box').text();
    var goods_type = $(this).attr('goods_type');

	//购物车本地存储
	obj = getLdata("carts") || {};
	obj[[jsid]] = {
		food_name: food_name,
		taste_name: taste_name,
		price: price,
		food_num: food_num,
                    goods_type: goods_type
	};
	setLdata('carts',obj)
	
	if (comb.uuid) {
		addcart(this);
	}
    deal_dispatch();
	subtotal();
	panduan();
});
//购物车商品修改（减少）
$(document).on('click', '.min2', function() {
	var t = $(this).parent().find('span[class*=text_box]');
	t.text(parseInt(t.text()) - 1);
	if (parseInt(t.text()) <= 0 || isNaN(t.text())) {
		t.text(0);
	}
	var boxid = 'num_box' + $(this).attr('goods_ids');
	var minid = 'mi' + $(this).attr('goods_ids');
	$('#' + boxid).text($(this).parent().find('.text_box').text());

	if($(this).parent().find('.text_box').text() == 0) {
		$('#' + boxid).hide();
		$('#' + minid).hide();
	}else {
		$('#' + boxid).text($(this).parent().find('.text_box').text());
	}

	var jsid = $(this).attr('goods_ids');
	var price = $(this).parents().find('.prices span').html();
	var food_name = $(this).parents().find('.food-name b').html();
	var taste_name = $(this).parents().find('.food-name span').html();
	var food_num = $(this).parent().find('.text_box').text();
    var goods_type = $(this).attr('goods_type');

	//购物车本地存储
	obj = getLdata("carts") || {};
	obj[[jsid]] = {
		food_name: food_name,
		taste_name: taste_name,
		price: price,
		food_num: food_num,
        goods_type: goods_type
	};
	setLdata("carts",obj)
		
	var nbid = $(this).attr('goods_ids')
	if ($('#nb' + nbid).text() == '0') {
		$('#nb' + nbid).parents('li').remove();
	}
	for (k in obj) {
		var tnb = obj[k].food_num
		if(tnb == 0){
			delete obj[k];
		}
		localStorage.carts = JSON.stringify(obj)
	}
	if (comb.uuid) {
		addcart(this);
	}
     //处理运费
    deal_dispatch();
	//总价判断
	subtotal();
	//状态判断
	panduan();
});
	//加入购物车按钮增加
$(document).on('click', '.add', function(event) {
	if(is_open == "0"){
		$.alert("亲，您所在的城市<br />还未开通外卖服务")
		return
	}else if (flag == 1) {
		$.alert("亲，您现在不在配送范围。<br />换个地址试试！", function(){
			locationClearCache('geo.html')
		})
		return
	}
	event.stopPropagation();
	var t = $(this).parent().find('span[class*=text_box],li[class*=text_box]');
	t.text(parseInt(t.text()) + 1);
	if (isNaN(t.text())) {
		t.text(0);
	}
	if (t.text = 0) {
		$(this).parent().find('.min').css("display", "none");
		$(t).css("display", "none");
	} else {
		$(this).parent().find('.min').css("display", "block");
		$(t).css("display", "block");
	}

	//加入购物车
	if (comb.uuid) {
		addcart(this);
	}
	var text_box = $(this).parent().find('.text_box').text();
	var Nid = 'num' + $(this).attr('goods_ids');
	var tid = $(this).attr('teste_id');
	var jsid = $(this).attr('goods_ids');
	var boxid = 'num_box' + jsid;
	var price = $(this).parent().find('.price span').html();
	var food_name = $(this).parents().find('.food-title b').html();
	var taste_name = $(this).parents().find('.food-title span').html();
	var food_num = $(this).parent().find('.text_box').text();
    var goods_type = $(this).attr('goods_type');
	//购物车本地存储
	obj = getLdata("carts") || {};
	obj[[jsid]] = {
		food_name: food_name,
		taste_name: taste_name,
		price: price,
		food_num: food_num,
        goods_type: goods_type
	};
	setLdata("carts",obj);
	//本地存储遍历并加入购物车
	for (k in obj) {
		var nbid = 'nb' + k;
		var b = $('#food' + k);
		if (b.length > 0) {
			$('#' + nbid).text(obj[k].food_num);
		} else {
			$('#carts').append("<li id='food" + k + "'><div class='food-name'><b>" + obj[k].food_name + "</b><span>" + obj[k].taste_name + "</span></div><div class='prices'>¥<span>" + moneyReZero(obj[k].price) + "</span></div><div class='num'><span class='add2' goods_type='"+obj[k].goods_type+"' teste_id='" + tid + "' goods_ids='" + k + "'></span><span id='" + nbid + "' disabled='disabled' class='text_box'>" + obj[k].food_num + "</span><span teste_id='" + tid + "' goods_type='"+obj[k].goods_type+"' goods_ids='" + k + "'  class='min2'></span></div></li>");
		}
		var tnb = obj[k].food_num
		$('#num_box' + k).text(tnb);
	}
    //处理运费
    deal_dispatch();
	//总价判断
	subtotal();
	//状态判断
	panduan();

});
//加入购物车按钮减少
$(document).on('click', '.min', function(event) {
	event.stopPropagation()
	if(is_open == "0"){
		$.alert("亲，您所在的城市<br />还未开通外卖服务")
		return
	}else if (flag == 1) {
		$.alert("亲，您现在不在配送范围。<br />换个地址试试！", function(){
			locationClearCache('geo.html')
		})
	}
	var t = $(this).parent().find('span[class*=text_box],li[class*=text_box]');
	t.text(parseInt(t.text()) - 1);
	if (parseInt(t.text()) <= 0 || isNaN(t.text())) {
		t.text(0);
	}
	var text_box = $(this).parent().find('.text_box').text();
	var price = $(this).parent().find('.price span').html();
	var jsid = $(this).attr('goods_ids');
	var Nid = 'num' + $(this).attr('goods_ids');
	var tid = $(this).attr('teste_id');
	var food_name = $(this).parents().find('.food-title b').html()
	var taste_name = $(this).parents().find('.food-title span').html()
	var food_num = $(this).parent().find('.text_box').text();
	var boxid = 'num_box' + $(this).attr('goods_ids');
    var goods_type = $(this).attr('goods_type');
	if (comb.uuid) {
		addcart(this);
	}
	if ($(Nid).length > 0) {
		$(Nid).text(obj[k].food_num)
	}
	$('#' + boxid).text($(this).parent().find('span[class*=text_box]').text());

	//购物车本地存储
	obj = getLdata("carts") || {};
	obj[[jsid]] = {
		food_name: food_name,
		taste_name: taste_name,
		price: price,
		food_num: food_num,
        goods_type: goods_type
	};
	setLdata("carts",obj)
	//本地存储遍历并加入购物车
	for (k in obj) {
		var nbid = 'nb' + k;
		var b = $('#food' + k);
		if (b.length > 0) {
			$('#' + nbid).text(obj[k].food_num)
		} else {
			$('#carts').append("<li id='food" + k + "'><div class='food-name'><b>" + obj[k].food_name + "<</b>span>" + obj[k].taste_name + "</span></div><div class='prices'>¥<span>" + obj[k].price + "</span></div><div class='num'><span class='add2' data-statistics='外卖商品加/"+k+"/"+obj[k].food_name+"/"+obj[k].taste_name+"' goods_type='"+obj[k].goods_type+"' teste_id='" + tid + "' goods_ids='" + k + "'></span><span id='" + nbid + "' disabled='disabled' class='text_box'>" + obj[k].food_num + "</span><span teste_id='" + tid + "' goods_type='"+obj[k].goods_type+"' goods_ids='" + k + "'  class='min2' data-statistics='外卖商品减/"+k+"/"+obj[k].food_name+"/"+obj[k].taste_name+"'></span></div></li>");
		}
		if ($('#' + nbid).text() == '0') {
			$('#' + nbid).parents('li').remove()
		}
		var nd = 'num_box' + k;
		var tnb = obj[k].food_num
		$('#' + nd).text(tnb);
		if(tnb == 0){
			delete obj[k];
		}
		localStorage.carts = JSON.stringify(obj)
	}
        //处理运费
        deal_dispatch();
	//总价判断
	subtotal();
	//状态判断
	panduan();
});

function key_exist(key, obj) {
	for (k in obj) {
		if (k == key) return true
	}
	return false
}


//购物车金额||总价计算||计数||弹跳动画
function subtotal() {
	// 当不在配送范围时 不再开通城市
	if(flag == "1" || is_open == "0"){
		return
	}
	allprice = 0;
	all_num = 0;
	obj = getLdata("carts") || {};
	if(!obj) return;
	for(k in obj){
		var single = (obj[k].food_num)*(obj[k].price)
		allprice+=single
		all_num+=parseInt(obj[k].food_num)
	}
	//弹跳动画
	$('.all_num').html(all_num).show();
	$(' .all_num').addClass('ball_animation')
	setTimeout(function(){
		$('.all_num').removeClass('ball_animation')
	},110)
	$('#allprice').html("共"+parseFloat(allprice.toFixed(2))+'元')
	$('#qsje').html(moneyReZero((send_fee-allprice).toFixed(2)))
	if(all_num <= 0){
		$('.all_num').addClass("com-dis-none");
	}else{
		$('.all_num').removeClass("com-dis-none");
	}
}

//购物车状态
function panduan() {
	// 当不在配送范围时 不再开通城市
	if(flag == "1" || is_open == "0"){
		return
	}
	var reg = /\d+/g;
	var str = $('#allprice').text();
	var ms = str.match(reg);
	var apc = parseInt(ms[0]);
	if (apc == 0) {
		// 购物车
		$('#allprice').html('您的购物车还用吗').css('line-height','2.5rem');
		$('.total font').hide();
		$("nav label").animate({
			"left":"3rem"
		},200)
		$('.icon-car').addClass('icon-car-grey');
		$('.tcbg').css("display", "none");
		$('.selected-list').animate({
			"bottom": "-15rem"
		}, 200);
		$('.icon-car').animate({
			"bottom": "1.1rem"
		}, 200);
		$(".content").css("overflow","auto");
		$(".all_num").animate({"top":"-1.5rem"})
	}else {
		$('.icon-car').removeClass('icon-car-grey');
		$('#allprice').css('line-height','1.7rem');
		$('.total font').show().css('display','block');
	}
	if (apc >= send_fee) {
		$('.order-link').show();
		$('.right-btn').hide();
	}else{
		$('.order-link').hide();
		$('.right-btn').show();
	}

}
function defImage(imgs){
	imgs = imgs || $('.plm img');
	for(var i = 0, len = imgs.length; i < len; i++){
		imgs[i].onerror = function(){
			$(this).attr('src', 'img/1077.png')[0].onerror = null;
		}
	}
}
$(document).on('click','.min',function(){
   	if($(this).parent().find('.text_box').text() == '0'){
		$(this).parent().find('.text_box').hide()
		$(this).hide()
	}
})

var deal_dispatch = function() {
	var carts = getLdata("carts") || {};
	var dispatch_fee = parseInt(sessionStorage.getItem("dispatch_fee"));
	var sum = 0;
	for(var k in carts){
		if(carts[k].goods_type == "1"){
			sum += carts[k].food_num * carts[k].price;
		}
	}
    if(sum >= 36 && sum < 56) {
        dispatch_fee = dispatch_fee / 2;
    }else if (sum >= 56) {
        dispatch_fee = 0;
    }
    $("#allprice").next().html("另需配送费"+ dispatch_fee +"元")	// 配送费
};

