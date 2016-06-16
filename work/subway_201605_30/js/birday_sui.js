/*!
 * =====================================================
 * SUI Mobile - http://m.sui.taobao.org/
 *
 * =====================================================
 */
// jshint ignore: start
+function($){
	var birthday = [];
    var times = new Date();
    var year = times.getFullYear();
    var oldyear = year-100;
	var IsPinYear = function(year) {  //判断是否闰平年
	    return (0 == year % 4 && (year % 100 != 0 || year % 400 == 0))
	}   
	for(var i = oldyear,j=0; i<=year; i++,j++){
	  	birthday.push({name:i,sub:[]})
	  	for(var x = 1,z=0; x<13; x++,z++){
	  		if(x<10){x = "0"+ x}
	  		birthday[j].sub.push({name:x,sub:[]})
	  		x = parseInt(x);
	  		for(var y = 1,len = 31; y<= len; y++){
	  			// 第一天计算上限天数
	  			if(y == 1) {
	  				if(birthday[j].sub[z].name == 4|| birthday[j].sub[z].name == 6 || birthday[j].sub[z].name == 9 || birthday[j].sub[z].name == 11 ){
		  				len = 30;
		  			}else if(birthday[j].sub[z].name == 2) {
		  				if(IsPinYear(birthday[j].name)){
		  					len = 29
		  				}else {
		  					len = 28
		  				}
		  			}
	  			}
	  			if(y<10){y = "0" + y}
	  			birthday[j].sub[z].sub.push({name:y})
	  			y = parseInt(y);
	  		}
	  	}
	} 
$.smConfig.rawCitiesData = birthday
  
}(Zepto);
// jshint ignore: end

/* global Zepto:true */
/* jshint unused:false*/

+ function($) {
    "use strict";
    var format = function(data) {
        var result = [];
        for(var i=0;i<data.length;i++) {
            var d = data[i];
            result.push(d.name);
        }
        if(result.length) return result;
        return [""];
    };

    var sub = function(data) {
        if(!data.sub) return [""];
        return format(data.sub);
    };

    var getCities = function(d) {
        for(var i=0;i< raw.length;i++) {
            if(raw[i].name == d)  {
            	return sub(raw[i]);
            }
        }
        return [""];
    };
    var getDistricts = function(p, c) {
        for(var i=0;i< raw.length;i++) {
            if(raw[i].name == p) {
                for(var j=0;j< raw[i].sub.length;j++) {
                    if(raw[i].sub[j].name == c) {
                        return sub(raw[i].sub[j]);
                    }
                }
            }
        }
        return [""];
    };

    var raw = $.smConfig.rawCitiesData;
    var provinces = raw.map(function(d) {
        return d.name;
    });
    var initCities = sub(raw[0]);
    var initDistricts = [""];

    var currentProvince = provinces[0];
    var currentCity = initCities[0];
    var currentDistrict = initDistricts[0];

    var t;
    var defaults = {

        cssClass: "city-picker",
        rotateEffect: false,  //为了性能

        onChange: function (picker, values, displayValues,callback) {
            var newProvince = picker.cols[0].value;
            var newCity;
            if(newProvince !== currentProvince) {
                // 如果Province变化，节流以提高reRender性能
                clearTimeout(t);
                t = setTimeout(function(){
                    var newCities = getCities(newProvince);
                    newCity = newCities[0];
                    var newDistricts = getDistricts(newProvince, newCity);
                    picker.cols[1].replaceValues(newCities);
                    picker.cols[2].replaceValues(newDistricts);
                    currentProvince = newProvince;
                    currentCity = newCity;
                    picker.updateValue();
                }, 200);
                return;
            }
            newCity = picker.cols[1].value;
            if(newCity !== currentCity) {
                picker.cols[2].replaceValues(getDistricts(newProvince, newCity));
                currentCity = newCity;
                picker.updateValue();
            }
            setCookie("birday",picker.cols[0].value+"-"+picker.cols[1].value+"-"+picker.cols[2].value)
        },

        cols: [
        {
            textAlign: 'center',
            values: provinces,
            cssClass: "col-province"
        },
        {
            textAlign: 'center',
            values: initCities,
            cssClass: "col-city"
        },
        {
            textAlign: 'center',
            values: initDistricts,
            cssClass: "col-district"
        }
        ]
    };

    $.fn.birdayPicker = function(params) {
        return this.each(function() {
            if(!this) return;
            var p = $.extend(defaults, params);
            //计算value
            var val = $(this).val();
            if(val) {
                p.value = val.split("-");
                if(p.value[0]) {
                    currentProvince = p.value[0];
                    p.cols[1].values = getCities(p.value[0]);
                }
                if(p.value[1]) {
                    currentCity = p.value[1];
                    p.cols[2].values = getDistricts(p.value[0], p.value[1]);
                } else {
                    p.cols[2].values = getDistricts(p.value[0], p.cols[1].values[0]);
                }
                if(p.value[2]) {
                    currentDistrict = p.value[2];
                }
            }
            $(this).picker(p);
        });
    };

}(Zepto);
