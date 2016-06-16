//用户ID
			function keydown(){
				if ($('#search').val().length >= '1') {
					$('.searchbar-cancel1').css('display', 'block');
					$('.searchbar-cancel2').css('display', 'none');
					$('.clear_sc').css('display','block');
					search_food();
				}else if($('#search').val() == '') {
					$('.searchbar-cancel1').css('display', 'none');
					$('.searchbar-cancel2').css('display', 'block');
					$('.clear_sc').css('display','none');
				}
			}
			//热门搜索
			function hotsearch() {
				// $.showPreloader()
				$.ajax({
					type: "post",
					url: url + "api/goods/gethotgoods",
					data: {},
					dataType: 'json',
					success: function(res) {
						console.log("热门搜索")
						console.log(res)
						$.hidePreloader()
						if (res.code == "0") {
							var num = res.data.length;
							for (var i = 0; i < num; i++) {
								var picobj = res.data[i];
								$('.hot_search').append("<li>"+picobj.name+"</li>")
							}
						}
					},
					error: function(data) {
						$.alert('数据请求失败！');
						return;
					}
				});
				//搜索记录
				console.log(uuid)
				if(uuid) {
					$.ajax({
						type: "post",
						url: url + "api/goods/searchGoods",
						data: {
							user_id: uuid
						},
						dataType: 'json',
						success: function(res) {
							console.log(uuid)
							if (res.code == "0") {
								var num = res.data.length;
								for (var i = 0; i < num; i++) {
									var picobj = res.data[i];
									$('.his_search').append("<li>"+picobj.name+"</li>")
								}
							}
						},
						error: function(data) {
							$.alert('记录请求失败！');
							return;
						}
					});
				}
			}
			function search_food(){
				$('.sclist').html('');
				//添加历史记录
				$.ajax({
					type: "post",
					url: url + "api/goods/addSearchGoods",
					data: {
						name:$('#search').val(),
						user_id:uuid
					},
					dataType: 'json',
					success: function(res) {
						
					},
					error: function(data) {
						$.alert('记录请求失败！');
						return;
					}
				});
				//搜索内容
				$.ajax({
					type: "post",
					url: url + "api/goods/getGoodsInfo",
					data: {
						name:$('#search').val()
					},
					dataType: 'json',
					success: function(result) {
						if (result.code == "0") {
							var num = result.data.length;
							for (var i = 0; i < num; i++) {
								var picobj = result.data[i];
								var _tmp = $("<li><b>"+picobj.name+"</b></li>");
								_tmp.appendTo($('.sclist'))
								for (var j = 0, num2 = picobj.res.length; j < num2; j++) {
									var picobj2 = picobj.res[j];
									_tmp.append("<span data-id='"+picobj2.uuid+"'>"+picobj2.tastename+"</span>");					
									
								}
							}
						}
						
							$('.search_list').css('display','block')
						if (result.code == "1") {
							$('.search_list').css('display','none')
							$('.search_no').show();
							$('.search_no').html("<p>暂时没有搜到“<b>"+$('#search').val()+"</b>”相关商品</p><span>您可以试试更换其他关键词试试看</span>")
							$('.bqlist').hide();
							$('.hot_foods').show();
							
							hotlist();
						}
					}, 
					error: function(data) {
						$.alert('数据请求失败！');
						return;
					}
				});
				$('.search_list').css('display','block')
			}
			//清除记录
			function delsearch(){
				$.ajax({
					type: "post",
					url: url + "api/goods/deleteSearchGoods",
					data: {
						user_id:uid
					},
					dataType: 'json',
					success: function(res) {
						
						$.alert('已删除');
					},
					error: function(data) {
						$.alert('记录请求失败！');
						return;
					}
				});
			}
			//商品列表
			$('.sclist li b').live('click',function(){
				$('.search_list').hide();
				$('.search_no').hide();
				$('.bqlist').hide();
				$.ajax({
					type: "post",
					url: url + "api/goods/list",
					data: {
						page: page,
						location:"116.557947,39.911765",
						goods_name:$(this).text()
					},
					dataType: 'json',
					success: function(res) {
					console.log('picobj')
						page++;
						if (res.code == "0") { 
							var num = res.data.goods.length;
							var main = document.getElementById("search_food_list");
							$('#search_food_list').html('')//清空之前搜索结果
							for (var i = 0; i < num; i++) {
								
								var picobj = res.data.goods[i];
								
								var picitem12 = document.createElement("div");
								picitem12.className = "sm_foods";
								main.appendChild(picitem12);
								var jds = localData.get('num_box'+picobj.uuid)
									if(!jds){
										jds=0;
									}
								var imgstage = document.createElement("div");
								imgstage.className = "pics";
								imgstage.innerHTML += "<img src='" + picobj.img1 + "'/>";
								picitem12.appendChild(imgstage);
								picitem12.innerHTML += "<div class='food-title' uuid='" + picobj.id + "'><p><b>" + picobj.goods_name + "</b><span>(" + picobj.taste_name + ")</span></p></div>"
								picitem12.innerHTML += "<div class='pricebuy'><b>¥</b><font class='price'>" + picobj.price + "</font><b>/</b><span>"+picobj.unit+"</span><span class='add' type='button' teste_id='1' goods_ids='" + picobj.id + "'></span><span id='num_box" + picobj.id + "' disabled='disabled' class='text_box'>"+jds+"</span><span class='min' teste_id='1' goods_ids='" + picobj.id + "'></span><span class='subtotal' style='display: none;'></span></div>";
								$('.food-title').click(function() {
									goods_id = $(this).attr('goods_id');
									$.router.loadPage("product.html")
									// $.showPreloader()
									shopDetails()
									
								})
								$('.pics').click(function() {
									goods_id = $(this).parent().find('.food-title').attr('uuid');
									$.router.loadPage("product.html")
									// $.showPreloader()
									shopDetails()
									
								})
								
								var obj = JSON.parse(localStorage.carts);
								for(k in obj){
									var nd = 'num_box'+k;
									$('#'+nd).text(obj[k].food_num);	
								};
								
							}
						}
					},
					error: function(data) {
						$.alert('数据请求失败，服务器已断开连接！');
						return;
					}
				})
			})
			
			function hotlist(){
				$.ajax({
					type: "post",
					url: url + "api/goods/getUserBuyGoods",
					data: {
						page: page
					},
					dataType: 'json',
					success: function(res) {
						page++;
						if (res.code == "0") { 
							var num = res.data.length;
							var main = document.getElementById("hot_list");
							$('#hot_list').html('')//清空之前搜索结果
							for (var i = 0; i < num; i++) {
								var picobj = res.data[i];
								
								var picitem12 = document.createElement("div");
								picitem12.className = "sm_foods";
								main.appendChild(picitem12);
								var jds = localData.get('num_box'+picobj.uuid)
									if(!jds){
										jds=0;
									}
								var imgstage = document.createElement("div");
								imgstage.className = "pics";
								imgstage.innerHTML += "<img src='http://oss-cn-beijing.aliyuncs.com" + picobj.img1 + "'/>";
								picitem12.appendChild(imgstage);
								picitem12.innerHTML += "<div class='food-title' goods_id='" + picobj.uuid + "'><p><b>" + picobj.name + "</b><span data-ids='"+picobj.taste_id+"'></span></p></div>"
								picitem12.innerHTML += "<div class='pricebuy'><b>¥</b><font class='price'>" + picobj.price + "</font><b>/</b><span>"+picobj.unit+"</span><span class='add' teste_id='1' goods_ids='" + picobj.uuid + "'></span><span id='num_box" + picobj.uuid + "'class='text_box'>"+jds+"</span><span class='min' teste_id='1' goods_ids='" + picobj.uuid + "'><span class='subtotal' style='display: none;'></span></div>";
								$('.food-title p span').each(function(k, v){
									if($(v).attr('data-ids') == '1'){
										$(v).html('(微辣)');
									}else if($(v).attr('data-ids') == '2'){
										$(v).html('(中辣)');
									}else if($(v).attr('data-ids') == '3'){
										$(v).html('(重辣)');
									}
								})
								
								
								$('.food-title').click(function() {
									goods_id = $(this).attr('goods_id');
									$.router.loadPage("product.html")
									// $.showPreloader()
									shopDetails()
									
								})
								
								$('.pics').click(function() {
									goods_id = $(this).parent().find('.food-title').attr('uuid');
									$.router.loadPage("product.html")
									// $.showPreloader()
									shopDetails()
									
								})
								
							}
						}
					},
					error: function(data) {
						$.alert('数据请求失败，服务器已断开连接！');
						return;
					}
				})
			}
			$(document).on("click",".searchbar-cancel1",function(){
				search_food();
			})
			$(document).on("click",".search_main ul li",function(){
			$('#search').val($('#search').val() +' '+ $(this).text());
				$('#search').val($(this).text());
				$('#search').trigger('keyup');
			})
			$(document).on("click",".clear_sc",function(){
				$('#search').val('')
				$('.clear_sc').css('display','none');
				$('.searchbar-cancel1').css('display', 'none');
				$('.searchbar-cancel2').css('display', 'block');
				$('.search_list').css('display','none');
				$('.search_food_list').hide();
				$('.bqlist').show();
				$('.hot_foods').hide();
				$('.search_no').hide();
			})
			$(document).on("click",".clear_oldsearch span",function(){
				delsearch();
				$('.his_search li').css('display', 'none')
			})
			$(document).on("click",".sclist li span",function(){
				goods_id = $(this).attr('data-id')
				$.router.loadPage("product.html")
				// $.showPreloader()
				shopDetails()
			})