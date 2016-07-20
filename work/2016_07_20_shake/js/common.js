;var common = (function($, undefind){
	var ua = navigator.userAgent.toLowerCase();//获取判断用的对象

	return {
		isWeixin: function(){
			return ua.match(/MicroMessenger/i) == "micromessenger";
		},
		isWeibo: function(){
			return ua.match(/WeiBo/i) == "weibo";
		},
		tpl: function(str, obj){
			// 简单模板解析
			obj = obj || null;
			for (var k in obj) {
				str = str.replace(new RegExp('{' + k + '}', 'g'), obj[k]);
			}
			return str;
		},
		ajaxApi: function(url, success, error, param) {
			var type = 'get';
			if(param){
				type = 'post';
			}else{
				param = null;
			}

			$.ajax({
				url: url,
				type: type,
				data: param,
				cache: false,
				async: true,
				dataType: 'json',
				timeout: 10000,
				success: function(data) {
					if(isResCode(data)) return;
					if (data.code != 0) {
						// error
						error && error(data);
					} else {
						// success
						success(data);
					}
				},
				error: function(xhr, type) {
					error && error(xhr, type)
				}
			});
		}
	}
})(Zepto);
var head_url = "http://imgcdn.juewei.com/",verify_time=60,
// 正则匹配
RE = [	/^[\u4e00-\u9fa5_a-zA-Z0-9]{1,20}$/,	//不能是特殊符号
		/^13[0-9]{9}$|^14[0-9]{9}$|^15[0-9]{9}$|^16[0-9]{9}$|^17[0-9]{9}$|^18[0-9]{9}$|^19[0-9]{9}$/,										//手机号码
		/^(\d{15}$|^\d{18}$|^\d{17}(\d|X|x))$/,			//身份证号码
		/^\d{1,10}$/,									//面积
		/[^\x00-\xff]|[A-Za-z0-9_]/ig,					
		/^[A-Za-z0-9]{2,200}$|^[\u4E00-\u9FA5]{1,200}/,	//留言 不能是特殊符号
		/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/	,		//email地址
		/\d{4}(\-|\/|\.)\d{1,2}(\-|\/|\.)\d{1,2}/,      // 时间
		/[`~!@#\$%\^\&\*\(\)_\+<>\?:"\{\},\.\\\/;'\[\]]+/,
		/^\d{4}$/   // 验证码
		],
times = new Date();//用于计算
// latlon_index, 

var debug = location.host != 'm.juewei.com';
// var ossImgWidth = "@"+$("body").width()+"w";
var ossImgWidth = "";
var head_url = "http://imgcdnjwd.juewei.com/";
var url = "http://api.juewei.com/";
var linkUrl = "http://m.juewei.com/";
var geo_config = {
	ak: 'pRtqXqnajTytAzWDL3HOnPRK',
	geotable_id: '134917'
}
var v = 103; //版本

// 清除缓存
var locationClearCache = function(url) {
	location = /\?/.test(url)? url+"&v000000018" : url+"?v000000018";
}
if(debug && location.host != 'api.juewei.com' && location.post != 9999) {
	head_url = "http://imgcdnjwd.juewei.com/";
	url = "http://testapi.juewei.com/";
	linkUrl = "http://testm.juewei.com/";
	$('title').html('测试')
	locationClearCache = function(url){
		location = /\?/.test(url)? url+"&v000000005" : url+"?v000000005";
	}
}else{
	// 百度统计
	var _hmt = _hmt || [];
	(function() {
		var hm = document.createElement("script");
		hm.src = "//hm.baidu.com/hm.js?b1f265b95a19f7b942ce4d86d2d67a0d";
		var s = document.getElementsByTagName("script")[0]; 
		s.parentNode.insertBefore(hm, s);
	})();
}

function load_geo_script(src){
	document.write('<script type="text/javascript" src="'+src+'"></script>');
}

// 注意：document.write
/*function get_script(src, version){
	version = version || Date.now();
	document.write('<script type="text/javascript" src="'+src+'?'+version+'"></script>');
}*/

var commonable = {};
var localData = {
	hname:location.hostname?location.hostname:'localStatus',
	isLocalStorage:window.localStorage?true:false,
	dataDom:null,

	initDom:function(){ //初始化userData
		if(!this.dataDom){
			try{
				this.dataDom = document.createElement('input');//这里使用hidden的input元素
				this.dataDom.type = 'hidden';
				this.dataDom.style.display = "none";
				this.dataDom.addBehavior('#default#userData');//这是userData的语法
				document.body.appendChild(this.dataDom);
				var exDate = new Date();
				exDate = exDate.getDate()+30;
				this.dataDom.expires = exDate.toUTCString();//设定过期时间
			}catch(ex){
				return false;
			}
		}
		return true;
	},
	set:function(key,value){
		if(this.isLocalStorage){
			window.localStorage.setItem(key,value);
		}else{
			if(this.initDom()){
				this.dataDom.load(this.hname);
				this.dataDom.setAttribute(key,value);
				this.dataDom.save(this.hname)
			}
		}
	},
	get:function(key){
		if(this.isLocalStorage){
			return window.localStorage.getItem(key);
		}else{
			if(this.initDom()){
				this.dataDom.load(this.hname);
				return this.dataDom.getAttribute(key);
			}
		}
	},
	remove:function(key){
		if(this.isLocalStorage){
			localStorage.removeItem(key);
		}else{
			if(this.initDom()){
				this.dataDom.load(this.hname);
				this.dataDom.removeAttribute(key);
				this.dataDom.save(this.hname)
			}
		}
	}
}
// 本地存储
// localData.set(name,val)
// 获取file的src 处理兼容问题
function getObjectURL(file) {
	var url = null;
	if (window.createObjectURL != undefined) { // basic
	return url = window.createObjectURL(file.files[0]);
	} else if (window.URL != undefined) { // mozilla(firefox)
	return url = window.URL.createObjectURL(file.files[0]);
	} else if (window.webkitURL != undefined) { // webkit or chrome
	return url = window.webkitURL.createObjectURL(file.files[0]);
	}
}
/**
 * /
 * 功能: 面向对象,tab切换;
 * 注意: 如果需要分别控制标题和内容的样式,再加一个类名,及修改tabFun赋值类名;
 * @param {[string]} titId      [点击标题父级ID]
 * @param {[string]} conId      [内容父级ID]
 * @param {[string]} titsTag    [点击标签]
 * @param {[string]} consTag    [内容标签]
 * @param {[string]} classNames [默认样式]
 * @param {[type]} objTag 	  [点击后this指向]
 */
function Tab(titId,conId,titsTag,consTag,classNames) {
	var _this = this;
	this.tits =document.getElementById(titId).getElementsByTagName(titsTag);
	this.cons =document.getElementById(conId).getElementsByTagName(consTag);
	for (var i = this.tits.length - 1; i >= 0; i--) {
		this.tits[i].index = i;
		this.tits[i].onclick = function() { _this.tabFun(this,classNames) };
	}
}
Tab.prototype.tabFun = function(objTag,classNames) {
	for (var i = this.tits.length - 1; i >= 0; i--) {
		this.tits[i].className = "";
		this.cons[i].className= "";
	};
	objTag.className= classNames;
	this.cons[objTag.index].className= classNames;
}
/**
 * 功能:设置得变量name的值,存储到cookie中
 * @param {[string]} name  [参数名]
 * @param {[string]} value [参数值]
 * @param {[string]} url   [接收的页面]
 * @param {[string]} hour   [保存的小时数]
 * 实例:setCookie('username','baobao')
 */
function setCookie(name,value,hour) {
	var exp  = new Date();
	exp.setTime(exp.getTime() + (hour*60*60*1000));
	document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
	// location.href = url; //接收页面.
}
function delCookie(name) 
{ 
    var exp = new Date(); 
    exp.setTime(exp.getTime() - 1); 
    var cval=getCookie(name); 
    if(cval!=null) 
        document.cookie= name + "="+cval+";expires="+exp.toGMTString(); 
} 
/**
 * 功能:取得cookie中 变量name的值
 * @param  {[string]} name [参数名]
 * @return {[string]}      [返回参数值]
 * 实例:alert(getCookie("baobao"));
 */
function getCookie(name) {
	var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
	if(arr !=null) return unescape(arr[2]); return null;
}
/**
 * 功能:获取地址栏各个参数的值
 * @param {[string]} name [参数名]
 */
function GetQueryString(name){
	var _str = window.location.toString().split('?')[1];	
	if(!_str) return '';
	var _arr = _str.split('&'); // ['aa=11',bb=22]
	var _obj = {};

	for(var i = 0, len = _arr.length; i < len; i++){
		var _tmp = _arr[i].split('=');
		_obj[_tmp[0]] = _tmp[1]
	}

	return name ? _obj[name] : _obj
}

// 时间零
function addTimeO(t) {
	var t = t.toString()
	return t.length == 1 ? ("0"+t) : t
}
/**
 * 功能: 通过时间戳 计算年月日时间 
 * @param  {[Number]} dateNum [时间戳]
 * @param  {[bool]}     bool  [判断返回种类]
 * @param  {[string]}     sign [年月的连接符号]
 * @return {[字符串]}         [返回 年月日 或者 年月日时秒分]
 */
function ormatDate(dateNum,bool,sign){
	var date=new Date(dateNum*1000);
	if(!sign) {
		var sign = "-" ;
	}
	if (bool) {
		return date.getFullYear()+sign+(date.getMonth()+1)+sign+(date.getDate());
	} else {
		return date.getFullYear()+sign+addTimeO(date.getMonth()+1)+sign+addTimeO(date.getDate())+"   "+addTimeO(date.getHours())+":"+addTimeO(date.getMinutes())+":"+addTimeO(date.getSeconds());
	};
}
// 判断是否登录状态
function oldCustom() {
	commonable = getLdata("commonable") || {};
	if(commonable["uuid"]) {
		return true 
	}else {
		return false;
	}
}
function tpl(str, obj) {
	obj = obj || {};
	for (var k in obj) {
		str = str.replace(new RegExp('{' + k + '}', 'g'), obj[k]);
	}
	return str;
}
// 对象合并
// o,n 分别是两个对象
// extend(a,b)
var extend=function(o,n){
   for(var p in n)if(n.hasOwnProperty(p) && !o.hasOwnProperty(p))o[p]=n[p];
};
// obj1内容
// obj2容器
// fun触发的事件
// range触发距离 默认是50
var inScroll = function(obj1,obj2,fun, offsetH) {
	obj1 =$(obj1)
	obj2 =$(obj2)
	obj2.scroll(function() {
		var scrollTop = obj2.scrollTop(),
		windowHeight = obj2.height(),
		scrollHeight = obj1.offset().height;
		if(scrollHeight == 0) return;
		// console.log(obj1)
		positionValue =  scrollHeight - windowHeight - scrollTop
		if (positionValue < offsetH) {
			fun();
		}
	});
}

// 去除所有空格
function Trim(str,is_global){
    var result;
    result = str.replace(/(^\s+)|(\s+$)/g,"");
    if(is_global.toLowerCase()=="g"){
        result = result.replace(/\s/g,"");
    }
    return result;
}

function getLocalTime(nS) {
	return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ").replace(/下午/g,"");     
}

// 本地存储
function setLdata(k, v){
	if(typeof v != 'string'){
		v = JSON.stringify(v)
	}
	localStorage[k] = v;
}
function getLdata(k, isJson){
	if(!localStorage[k]) return false;
	if(localStorage[k] == "undefined") return {};
	return !isJson ? JSON.parse(localStorage[k]) : localStorage[k]
}


// 本地 临时存储
function getSdata(k, isJson){
	if(!sessionStorage[k]) return false;
	if(sessionStorage[k] == "undefined") return {};
	return !isJson ? JSON.parse(sessionStorage[k]) : sessionStorage[k]
}
function setSdata(k, v){
	if(typeof v != 'string'){
		v = JSON.stringify(v)
	}
	sessionStorage[k] = v;
}

function spliturl(str) {
//	var str = 'http://www.123fdasfda.com?a=12&b=11'; 
	var arr = str.split('?');
	if(arr.length <= 1) return {}
	var arr2 = arr[1].split('&')
	var obj = {}
	for(var i = 0; i < arr2.length; i++){
		var tmp = arr2[i].split('=');
		obj[tmp[0]] = tmp[1]
	}
	return obj	
}


function sysApi(callback){
	$.get(url + 'api/system/get', function(d){
		callback(d)
	}, 'json')
}

function isLogin(backPage){
	if(!oldCustom()){
		localStorage['page'] = backPage || location.pathname.toString().split('/').pop() || 'index.html';
		location = url + 'wxZF/openid.php';
		return false;
	}
	return commonable.uuid;
}

//多选项卡滚动加载
var iscroll = false;
function Scr(box, cont, callback){
	this.box = box;
	this.cont = cont;
	this.callback = callback;
	this.running = false;
	this.onScr = (function(e){
		if(this.running || this.cont.get(0) !== $('#buy_price .tab').eq(localStorage.index_tab_type - 1).get(0)) return;		
		var boxTop = this.box.offset().height + this.box.offset().top;
		var contTop = this.cont.offset().height + this.cont.offset().top;
		if(boxTop > contTop){
			this.running = true;
			this.callback && this.callback(e);
		}
	}).bind(this);
	this.boxEle = this.box.get(0);
	this.boxEle.eventList = {};
}
Scr.prototype.init = function(){
	this.boxEle.eventList[this.cont.attr('id')] = this.onScr;	
	this.box.on('scroll', this.boxEle.eventList[this.cont.attr('id')]);
}

Scr.prototype.destory = function(){		
	this.box.off('scroll', this.boxEle.eventList[this.cont.attr('id')]);
	delete this.boxEle.eventList[this.cont.attr('id')]	
}

Scr.prototype.ok = function(){
	this.running = false;
}

function getMinute(startHour,timeSecs){   //8
	startHour = parseInt(startHour);
	var hour = new Date().getHours();
	if(hour < startHour){ 
		return timeSecs + (startHour - hour) * 60 * 60
	}else{
		// 当前0点的时间+0点到现在的时间+剩余时间+明天的时间=第二天送达的时间
		return timeSecs+(hour*60*60)+((24-hour)*60*60)+((startHour+1) * 60 * 60);
	}
}

function defImage(imgs, def){
	imgs = imgs || $('img');
	def = def || 'img/1077.png';
	for(var i = 0, len = imgs.length; i < len; i++){
		imgs[i].onerror = function(){
			$(this).attr('src', def)[0].onerror = null;
		}
	}
}

function param(p){
	var _arr = location.toString().split('?')
	if(_arr.length < 2) return '';
	_arr = _arr[1].split('&')
	for(var i = 0, len = _arr.length; i < len; i++){
		var _tmp = _arr[i].split('=')
		if(_tmp.length > 1 && _tmp[0] == p) return decodeURIComponent(_tmp[1])
	}
	return '';
}

function go(url, version){
	version = version || Date.now();
	url = /\?/i.test(url) ? url + '&version=' + version : url + '?version=' + version;
	window.location = url;
}

// query_string: 'demo=test&hello=world'
function tongji_filter(query_string){
	$(document).on('ajaxBeforeSend', function(e, xhr, options){
		if(options.type.toLowerCase() == 'post'){
			xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
			options.data = options.data ? options.data + '&' + query_string : query_string;
		}else{
			options.url += /\?/i.test(options.url) ? '&' + query_string : '?' + query_string;
		}
	})
}
//阻止组件冒泡事件
$(document).on("touchstart",".modal-overlay",function(e){
	e.stopPropagation();
	e.preventDefault();
})

// 末尾金额去零 如果带小数点 就去小数点
var moneyReZero = function(m){
	if(typeof m == "number") { m = m.toFixed(2);}
	if(!/\./g.test(m))return m
	money = m.replace(/0$/g,"")
	if(/0$/g.test(money)){
		money =  moneyReZero(money)
	}
	return money.replace(/\.$/,"")
}

// 返回几年几月几日0点的时间戳
function convertTimes(year,month,day){  
    var d = new Date();  
    d.setFullYear(year);  
    d.setMonth(month-1);  
    d.setDate(day);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0)
    return Date.parse(d);  
}

// 是否是空数组
function isNullObj(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)){
            return false;
        }
    }
    return true;
}

/**
 * 功能: 设置input长度;
 */
function setInputLength(target,len){
	len = len || 11;
	target.on("input",function(){
		var thisVal = "";
		var num = $(this).val();
		if(num.length>len){
			thisVal = num.substring(0,11);
			$(this).val(thisVal)
		}
	})
}
/**
 * /
 * @param {[type]} target [description]
 * @param {[type]} len    [description]
 */
function isResCode(res){
	$.hidePreloader();
	if((res.code == "4001")|| (res.code == "2003") || (res.code == "4002") || (res.code == "4200") || (res.code == "4300")) {
		$.alert(res.msg,function(){
			setLdata("page",location.href)
			location = url+ "wxZF/openid.php"
		})
		return true
	}else{
		return false
	}
}
// 统计代码
;(function(){
	var ja_url = 'http://rz.juewei.com/index.html', params = {};

	var init = function(){
		if(!sessionStorage.session_id) sessionStorage['session_id'] = 'wx_'+Date.now()+'_'+Math.random();
		params['session_id'] = sessionStorage.session_id;
		params['domain'] = document.domain || '';
		params['sh'] = window.screen.height || 0;
		params['sw'] = window.screen.width || 0;
		params['lang'] = navigator.language || '';
	}

	var query = function(param){
		if(debug) return;	// 调试模式不记录统计日志
		param = extend(params, param || {})
		param['url'] = document.URL || '';
		param['title'] = document.title || '';
		param['referrer'] = document.referrer || '';

		// 添加一个user_id参数，如果没登陆为空
		var cc = getLdata("commonable") || {};
		param['user_id'] = cc.uuid || '';

		$.get(ja_url, param, function(d){},"text");
	}

	var bindEvent = function(){
		document.addEventListener('touchstart', function(e){
			if(!$(e.target).data("statistics")){return};
			var point = e.touches[0];
			query({"tag":$(e.target).data("statistics")});
		})
	}

	var loop = function(){
		query();
		setTimeout(function(){
			loop();
		}, 30000)
	}

	var extend = function(current, target){
		for(k in current){
			if(!target[k]){
				target[k] = current[k];
			}
		}
		return target;
	}
	var Api = function(){
		return {
			query: query
		}
	}
	init();
	bindEvent(); // 要求删除点击记录
	loop();
	return tongjiApi = {
		query: query
	}
})();
;(function(){
    if (localStorage.carts) {
        var obj = getLdata("carts") || {};
        var flag = false;
        for(k in obj) {
            if(obj[k].goods_type == 'undefined' || !obj[k].goods_type) {
                flag = true;
                continue;
            }
        }
        if(flag) {
            localStorage.removeItem('carts');
        }
    }
})();

/**
 * 功能: 微信分享 
 * @param  {[对象]} opt             [分享的参数]
 * @param  {[方法]} errorCallback   [获取code错误回调]
 * @return {[无]}                 	[description]
 * opt = {
		title: String,	// 主标题
		desc: String,	// 副标题
		link: String,	// 分享链接
		imgUrl: String,	// 小图片地址,
		onMSAMTri: function(){} 
	}
 * 2016-5-2 17:25:21 wenwen
 */
function wx_init(opt,errorCallback){
	var targetUrl = encodeURI(location.toString().split('#')[0]);
	$.get(url+'service.php', {url: targetUrl}, function(resp) {
		if(resp.code != 0){
			if(errorCallback){
				errorCallback()
			}else{
				alert('网络连接失败，请刷新重新！')
			}
			return;
		}

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
				title: opt.title,
				desc: opt.desc,
				link: opt.link,
				imgUrl: opt.imgUrl,
				trigger: function (e) {
					// 菜单中触发分享
					opt.onMSAMTri && opt.onMSAMTri(e)
				},
				success: function (e) {
					// 分享成功
					opt.onMSAMSuc && opt.onMSAMSuc(e)
				},
				cancel: function (e) {
					// 分享取消
					opt.onMSAMCan && opt.onMSAMCan(e)
				},
				fail: function (e) {
					opt.onMSAMFail && opt.onMSAMFail(e)
				}
			});
			// 分享到朋友圈
			wx.onMenuShareTimeline({
				title: opt.title,
				desc: opt.desc,
				link: opt.link,
				imgUrl: opt.imgUrl,
				trigger: function () {
					//菜单中触发分享朋友圈
					opt.onMSTLTri && opt.onMSTLTri()
				},
				success: function () {
					//  成功分享朋友圈
					opt.onMSTLSuc && opt.onMSTLSuc()
				},
				cancel: function () {
					// 分享取消朋友圈
					opt.onMSTLCan && opt.onMSTLCan()
				},
				fail: function () {
					// 分享失败朋友圈
					opt.onMSTLFail && opt.onMSTLFail()
				}
			});
		});
	}, 'json')
}
function wx_init_en(opt,errorCallback){
	var targetUrl = location.toString().split('#')[0];
	$.get(url+'service.php', {url: targetUrl}, function(resp) {
		if(resp.code != 0){
			if(errorCallback){
				errorCallback()
			}else{
				alert('网络连接失败，请刷新重新！')
			}
			return;
		}

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
				title: opt.title,
				desc: opt.desc,
				link: opt.link,
				imgUrl: opt.imgUrl,
				trigger: function (e) {
					// 菜单中触发分享
					opt.onMSAMTri && opt.onMSAMTri(e)
				},
				success: function (e) {
					// 分享成功
					opt.onMSAMSuc && opt.onMSAMSuc(e)
				},
				cancel: function (e) {
					// 分享取消
					opt.onMSAMCan && opt.onMSAMCan(e)
				},
				fail: function (e) {
					opt.onMSAMFail && opt.onMSAMFail(e)
				}
			});
			// 分享到朋友圈
			wx.onMenuShareTimeline({
				title: opt.title,
				desc: opt.desc,
				link: opt.link,
				imgUrl: opt.imgUrl,
				trigger: function () {
					//菜单中触发分享朋友圈
					opt.onMSTLTri && opt.onMSTLTri()
				},
				success: function () {
					//  成功分享朋友圈
					opt.onMSTLSuc && opt.onMSTLSuc()
				},
				cancel: function () {
					// 分享取消朋友圈
					opt.onMSTLCan && opt.onMSTLCan()
				},
				fail: function () {
					// 分享失败朋友圈
					opt.onMSTLFail && opt.onMSTLFail()
				}
			});
		});
	}, 'json')
}
// 微信获取当前经纬度->百度转换坐标系->根据百度坐标获取当前城市信息
function get_city_name_by_geo(js_api_list,callback,fail,wx_callback){
	// 分享朋友默认参数
	var wx_onMenuShareAppMessage = {
		link: location.href,
		imgUrl: 'http://'+location.host+'/img/1110.png',
		title: "买前摇一摇，随机立减！好习惯，早养成！",
		desc: "绝味鸭脖官方特惠平台重磅来袭！",
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
	};
	// 分享朋友圈默认参数
	var wx_onMenuShareTimeline = {
		link: location.href,
		imgUrl: 'http://'+location.host+'/img/1110.png',
		title: "买前摇一摇，随机立减！好习惯，早养成！",
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
	};
	// 继承
	wx_onMenuShareAppMessage = $.extend(wx_onMenuShareAppMessage,js_api_list.onMSAM);
	wx_onMenuShareAppMessage = $.extend(wx_onMenuShareAppMessage,js_api_list);
	wx_onMenuShareTimeline = $.extend(wx_onMenuShareTimeline,js_api_list.onMSTL);
	wx_onMenuShareTimeline = $.extend(wx_onMenuShareTimeline,js_api_list);
	var targetUrl = location.toString().split('#')[0];
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
			jsApiList: js_api_list.api ? js_api_list.api : ["getLocation","onMenuShareTimeline","onMenuShareAppMessage"]
		});

		// bind wx ready event
		wx.ready(function(){
			// 通过微信获取当前经纬度
			callback && wx.getLocation({
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
			wx.onMenuShareTimeline(wx_onMenuShareTimeline)
			wx.onMenuShareAppMessage(wx_onMenuShareAppMessage);
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

// 系统相关信息	zepto.fn.device
function device(){
	var d = {};
	var ua = navigator.userAgent;

	var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
	var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
	var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
	var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

	d.ios = d.android = d.iphone = d.ipad = d.androidChrome = false;

	// Android
	if (android) {
		d.os = 'android';
		d.osVersion = android[2];
		d.android = true;
		d.androidChrome = !!~ua.toLowerCase().indexOf('chrome');
	}
	if (ipad || iphone || ipod) {
		d.os = 'ios';
		d.ios = true;
	}
	// iOS
	if (iphone && !ipod) {
		d.osVersion = iphone[2].replace(/_/g, '.');
		d.iphone = true;
	}
	if (ipad) {
		d.osVersion = ipad[2].replace(/_/g, '.');
		d.ipad = true;
	}
	if (ipod) {
		d.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
		d.iphone = true;
	}
	// iOS 8+ changed UA
	if (d.ios && d.osVersion && !!~ua.indexOf('Version/')) {
		if (d.osVersion.split('.')[0] === '10') {
			d.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
		}
	}

	return d;
}

// 文件上传
/*
opt = {
	selector: String,	// input[file]
	name: String,	// 上传文件字段名
	url: String,	// 请求url地址
	success: Function,	// 成功后回调
	error: Function,	// 失败回调
	before: function 	// 请求前钩子
}
*/
function file_upload(opt){
	$(document).on('change', opt.selector, function(e){
		var file = this.files[0];
		opt.before && opt.before.call(null, file);
		if(!file.size) return;

		var formdata = new FormData();
		formdata.append(opt.name, file);

		var xhr = new XMLHttpRequest();
		xhr.open('post', opt.url);

		xhr.onreadystatechange = function() {
			if (xhr.readyState != 4) return;

			if (xhr.status == 200) {
				opt.success.call(null, JSON.parse(xhr.responseText))
			}else {
				opt.error.call(null)
			};
		}

		xhr.send(formdata);
	})
}

/*;(function(){
	common.ajaxApi(url + 'api/WebVersion/check', function (res) {
		var locationPath = location.pathname;
		res.data.version = 103
		res.data.version !=  v  &&  locationClearCache(locationPath);
	})
})();*/

//是否更新文件
window.addEventListener('load', function(e) {
	window.applicationCache.addEventListener('updateready', function(e) {
		if(window.applicationCache.status == window.applicationCache.UPDATEREADY) {
			// Browser downloaded a newapp cache.
			// Swap it in and reload thepage to get the new hotness.
			window.applicationCache.swapCache();
			window.location.reload();
		} else {
			// Manifest didn't changed.Nothing new to server.
		}
	}, false);
}, false);