/**
 * 周边门店导航
 * 2016-5-25 14:08:24 zsx
 * 
 */
	$(function(){
	var urlobj = spliturl(window.location.href); //读取url信息
	var my_XY = urlobj.my_XY;//定位坐标
	var shop_XY = urlobj.shop_XY; //店铺坐标 
	document.title = decodeURI(urlobj.shop_name);//设置标题
	// 百度地图API功能
	var map = new BMap.Map("l-map");
	var _Mytmp = my_XY.split(',');
	var _Stmp = shop_XY.split(',');
	map.centerAndZoom(new BMap.Point(_Mytmp[0], _Mytmp[1]), 12);
	map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
		var p1 = new BMap.Point(_Mytmp[0], _Mytmp[1]);
	var p2 = new BMap.Point(_Stmp[0], _Stmp[1]);
	var transit = new BMap.TransitRoute(map, {renderOptions: {map: map, panel: "r-result", autoViewport: true}});
	var walking = new BMap.WalkingRoute(map, {renderOptions: {map: map, panel: "r-result2", autoViewport: true}});
	var driving = new BMap.DrivingRoute(map, {renderOptions:{map: map, panel: "r-result3", autoViewport: true}});
	transit.search(p1,p2);//步行
	walking.search(p1,p2);//公交
	driving.search(p1,p2);//驾车
	if($('#r-result').html() == '' ){
		$('#r-result').html('距离太近，无法规划线路')
	}
	// 二维码
var commonable = getLdata("commonable");
if(commonable.phone){
	phone();
}
function phone(){
	console.log(1)
	var arr = commonable.phone;
		arr = arr.split("");
	$("#shakePhoneMap").html(arr[0]+arr[1]+arr[2]+"-"+arr[3]+arr[4]+arr[5]+arr[6]+"-"+arr[7]+arr[8]+arr[9]+arr[10]).css({'color':'#333;font-size: 1.5rem;'});
	$(".get-code-map div").prepend('<img src="'+url+'api/user/genCode?mobile='+commonable.phone+'" /><span class="logo"></span>')
	$(".code-icon-map").show();

};
	$(document).on('tap',".code-icon-map",function(){
		$(".bg-map").show();
		$(".get-code-map").show();
	})
	$(document).on('tap',".icon-cancel-map",function(){
		$(".bg-map").hide();
		$(".get-code-map").hide();
	})
	})
