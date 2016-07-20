/**
 * 依赖于common.js  跟首页定位逻辑同步
 * 功能: 定位当前位置 -> 查找lbs数据 获取店铺与距离 -> 跳转到指引路线
 * 2016-5-10 15:59:28
 */

(function(){
	var num = 0,my_lngX,my_latY,config,wxApi;
	var commonable = getLdata('commonable') || {};
	// 分享朋友默认参数
	config = {
		wxCon:{},
		btn: $(".onon"),	// 到这里节点
		fail: "", //失败了隐藏父节点
		mapTitle: "", // 名称节点
		mapCon: "",	// 内容节点
		wxApi:[],
		mapShop: "",// 周边门店
		link:"",	// 去指引页面链接
		isPos: false	// 定位成功或失败/首页用
	}
	// 定位成功后回调
	var loca = function(res) {
		// 自己的位置
		my_lngX = res.point.lng;
		my_latY = res.point.lat;
		if(!my_lngX || !my_latY) {
			fail();
			return
		}
		commonable["indexlatlon"] = my_lngX+","+ my_latY;
		baidumap();
		addressCabll(res)
	}
	// 定位失败后回调
	var fail = function(){
		config['mapTitle'].html("定位失败");
		config['btn'].off();
	}

	//百度当前位置查找lbs店铺
	var baidumap = function(){
		var mapUrl = 'http://api.map.baidu.com/geosearch/v3/nearby?location='+my_lngX+','+my_latY+'&ak='+geo_config.ak+'&geotable_id='+geo_config.geotable_id+'&radius=5000&sortby=distance:1';
		$.ajax({
			url:mapUrl,
			type:"get", 
			dataType: "jsonp",
			success:function(res) {
				console.log(res)
				if(res.status == 0 ) {
					// 清除超时记录
					clearInterval(timer);
					var con_num = res.contents.length;
					if(con_num == 0){
						config['mapShop'].show();
						config['fail'].hide();
						setTimeout(function(){
							$('.qcmap').show().find('h3').css({'margin-top':"0.5rem"});
							$('.qctit').html('周边暂无门店');
						},300)
						return
					}
					var _shops = res.contents[0];
					var _shopX = _shops.location[0];
					var _shopY = _shops.location[1];
					var _shopp = _shopX+','+_shopY;
					if(_shops.title==""){
						_shops.title="定位中...";
					}
					config["mapTitle"].html(_shops.title);
					config["mapCon"].html('距离：'+_shops.distance+'米 | '+_shops.address);
					config["btn"].attr("data-id",_shopp);
					config['link'] = '?shop_name='+_shops.title+'&my_XY='+my_lngX+','+my_latY+'&shop_XY='+_shopp;
				}
			},
			error:function(){
				$.alert("链接错误")
			}
		})
	}
	// 到这里
	var bindEvent = function(){
		config["btn"].click(function(){
			if(!$(this).attr('data-id')) return;
			var shop_name = $(".map-title").text(); //店铺名称
			var my_XY = my_lngX+','+my_latY; 		//定位坐标
			var shop_XY = $(this).attr('data-id'); 	//店铺坐标
			locationClearCache('search_shop_info.html?shop_name='+shop_name+'&my_XY='+my_XY+'&shop_XY='+shop_XY)
			return;
		})
	}
	
	var init = function(){
		// 定位时间超过20秒后失败;
		timer = setInterval(function(){
			num++;
			if(num>=20){
				clearInterval(timer);
				fail();
			}
		},1000)
		// 定位
		get_city_name_by_geo(config.wxCon,loca,fail)
		bindEvent();
	}
	var addressCabll = function(rs){
		var addComp = rs.addressComponents;
		var commonable = getLdata('commonable') || {};
		commonable["mapname"] = addComp.city;
		commonable["indexname"] = addComp.street;
		// 保存省份
		var _province = addComp.province;
		if(_province.substr(-1, 1) == '市') _province = _province.substr(0, _province.length - 1);
		commonable["pos_province"] = _province;
		setLdata("commonable", commonable);
		config.isPos = true;
	}
	return searchApi = {
		config: config,
		searchinit : init
	};
})();