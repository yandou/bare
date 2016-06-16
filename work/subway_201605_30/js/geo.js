// 微信获取当前经纬度->百度转换坐标系->根据百度坐标获取当前城市信息
function get_city_name_by_geo(callback, fail, js_api_list, wx_callback){
	var targetUrl = encodeURI(location.toString().split('#')[0]);
	$.getJSON(url + 'service.php', {url: targetUrl}, function(res) {
		if(res.code != 0){
			fail();
			return;
		}
		// 初始化微信接口
		wx.config({
			debug: false,
			appId: res.data.appid,
			timestamp: res.data.timestamp,
			nonceStr: res.data.rand,
			signature: res.data.sha1,
			jsApiList: js_api_list ? js_api_list : ["getLocation"]
		});

		// bind wx ready event
		wx.ready(function(){
			// 通过微信获取当前经纬度
			wx.getLocation({
				type: "wgs84",
				success:function(wx_res){
					if(wx_res.errMsg != "getLocation:ok"){
						fail();
						return;
					}
					// 通过百度api转换当前经纬度坐标
					$.ajax({
						url: "http://api.map.baidu.com/geoconv/v1/?",
						type: "get",
						data: {
							coords: wx_res.longitude+","+wx_res.latitude,
							ak: geo_config.ak
						},
						dataType:"jsonp",
						success:function(geo_res){
							if(geo_res.status != 0) {
								fail();
								return;
							}

							var point = new BMap.Point(geo_res.result[0].x.toFixed(6), geo_res.result[0].y.toFixed(6));
							var geoc = new BMap.Geocoder();   

							geoc.getLocation(point, function(city_info){
								callback(city_info);
							});
						},
						error:function(){
							fail();
						}
					})
				},
				cancel:function(){
					fail();
					return;
				}
			});
			wx_callback && wx_callback();
		})
	})
}

// 通过百度api, 使用ip换取城市名
function get_city_name_by_ip(callback, fail){
	$.get("http://api.map.baidu.com/location/ip?ak="+geo_config.ak,function(res){
		if(!res || res.status != 0 || !res.content || !res.content.address_detail || !res.content.address_detail.city) {
			// 失败
			fail();
		}else{
			// 成功
			callback(res);
		}
	},"jsonp")
}
