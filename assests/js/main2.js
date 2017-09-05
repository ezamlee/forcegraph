angular.module('my-app', []).controller('main', function($scope) {
	$scope.data = {
		linkedByIndex:{},
		field_1_buckets:[],
		field_2_buckets:[]
	};
	$scope.config={
		charge:function(d, i) { return $scope.config.size(d.freq) * 100 *-1; },
		selected_index:"",
		selected_type:"",
		selected_field_1:"",
		selected_field_2:"",
		max_bucket:[10,10],
		elasticdata:{
			host:"127.0.0.1",
			port:"9200",
			index:[],
			type:null,
			field:null
		},
		color:["#ed4646","#01d78d"],
		opaq:0.3,
		outline: false,
		tocolor : "fill",
		towhite : "stroke",
		w:window.innerWidth -20,
		h:window.innerHeight -20,
		width:window.innerWidth -20,
		height:window.innerHeight -20,
		focus_node: null,
		highlight_node: null,
		text_center: false	,
		highlight_color: "#000",
		highlight_trans: 0.1,
		default_node_color: "#060606",
		default_link_color: "#060606",
		min_base_node_size: 8,
		min_text_size: 10,
		min_stroke: 1.5,
		max_text_size: 24,
		max_stroke: 43,
		max_base_node_size: 100,
		min_zoom: 0.1,
		max_zoom: 7,
		text_color:"#060606",
		max_node_freq:10000,
		min_node_freq:0,
		min_stroke_freq:0,
		max_stroke_freq:100
 	};
	$scope.graph ={};
	$scope.init = ()=>{
		//set size scaling
		$scope.config.size=d3.scale.pow().exponent(1).domain([$scope.config.min_node_freq,$scope.config.max_node_freq]).range([$scope.config.min_base_node_size,$scope.config.max_base_node_size]);
		$scope.config.stroke_size = d3.scale.pow().exponent(1).domain([$scope.config.min_stroke_freq,$scope.config.max_stroke_freq]).range([$scope.config.min_stroke,$scope.config.max_stroke]);
		$scope.config.linkDistance= 500;//$scope.config.size($scope.config.max_base_node_size)*20

		// get elastic indexes
		$scope.ElasticRest.get_index($scope.config.elasticdata.host,$scope.config.elasticdata.port);
		// define zoome scale
		$scope['zoom'] = d3.behavior.zoom().scaleExtent([$scope.config.min_zoom, $scope.config.max_zoom]);
		// define forces
		$scope['force'] = d3.layout
			.force()
		  .linkDistance($scope.config.linkDistance)
		  .charge($scope.config.charge)
		  .size([$scope.config.w,$scope.config.h]);

		$scope['svg'] = d3.select("#mysvg").append("svg").style("cursor", "move");
		$scope['g'] = $scope.svg.append("g");
		$scope.links = $scope.g.selectAll(".link")
    	.data($scope.graph.links)
    	.enter().append("line")
    	.attr("class", "link")
			.style("stroke-width", (d)=>{
				return $scope.config.stroke_size(d.strength);
			})
			.style("stroke-opacity",(d)=>{
				return  $scope.config.opaq;
			})
			.style("stroke", function(d) {
				return $scope.config.default_link_color;
			});


		$scope.node = $scope.g.selectAll(".node")
			.data($scope.graph.nodes)
			.enter().append("g")
			.attr("class", "node")
			.call($scope.force.drag);
		$scope.config.tocolor =  $scope.config.outline ? "stroke" : "fill";
		$scope.config.towhite =  $scope.config.outline ? "fill"   : "stroke";
		$scope.circle = $scope.node
			.append("path")
			.attr("d", d3.svg.symbol().size(function(d) {return Math.PI * Math.pow($scope.config.size(d.size), 2);}))
			.attr("r", function(d) { return $scope.config.size(d.size);})
			.style($scope.config.tocolor, function(d) {
				return $scope.config.color[d.color_id];
			})
			.style("stroke-width", $scope.config.min_stroke)
			.style($scope.config.towhite, "white")  // if outline fill white if not stroke white
			.on("mouseover",(d)=>{
				$("#tooltip")
					.append("span")
					.text(`The Frequency is: ${d.freq}  Name : ${d.id}`)
					.css("padding","5px")
					.css("background-color","rgba(20,120,20,0.5)")
					.css("position","absolute")
					.css("top",`20px`)
					.css("left",`${$scope.config.w - 310}px`)
					.css("font-size","24px");
			})
			.on("mouseout",(d)=>{
				$("#tooltip").empty().css("background-color","rgba(20,120,20,0)");
			})
			.on("dblclick", (d)=>{
			  d3.select(this).classed("fixed", d.fixed = d.fixed? false:true);
			});

		$scope.text = $scope.g.selectAll(".text")
			.data($scope.graph.nodes)
			.enter().append("text")
			.attr("dx", function(d) {return (($scope.config.size(d.size)) + 10);})
			.attr("dy", ".35em")
			.style("font-size", $scope.config.max_text_size + "px")
			.style("fill",$scope.config.text_color)
			.text(function(d) {return d.id;});


		$scope.events();
	};
	$scope.events = ()=>{
		$scope.zoom
			.on("zoom", function() {
				///////////////////////////Stroke///////////////////////////////////
				$scope.links
					.style("stroke-width",(d)=>{
						return $scope.config.stroke_size(d.strength);
					})
					.style("stroke-opacity",(d)=>{
						return  $scope.config.opaq;
					})
					.style("stroke", function(d) {
						return $scope.config.default_link_color;
					});
				///////////////////////////circle///////////////////////////////////

					$scope.config.tocolor =  $scope.config.outline ? "stroke" : "fill";
					$scope.config.towhite =  $scope.config.outline ? "fill"   : "stroke";


				var stroke =
					$scope.config.min_stroke * $scope.zoom.scale() > $scope.config.max_stroke ?
						$scope.config.max_stroke / $scope.zoom.scale() :
							$scope.config.min_stroke;

				$scope.circle
					.style("stroke-width", stroke)
					.style($scope.config.tocolor, function(d) {
						return $scope.config.color[d.color_id];
					})
					.style($scope.config.towhite, "white");

				var base_radius =
						$scope.config.min_base_node_size * $scope.zoom.scale() > $scope.config.max_base_node_size ?
								$scope.config.max_base_node_size / $scope.zoom.scale():
									$scope.config.min_base_node_size;
				$scope.circle.attr("d", d3.svg.symbol()
					.size(function(d) {
						return Math.PI * Math.pow($scope.config.size(d.size) * base_radius / $scope.config.min_base_node_size, 2);
					})
				);

				///////////////////////////Text///////////////////////////////////
				var text_size = $scope.config.max_text_size * $scope.zoom.scale() > $scope.config.max_text_size ? $scope.config.max_text_size / $scope.zoom.scale() :$scope.config.max_text_size;
				$scope.text
					.style("fill",$scope.config.text_color)
					.attr("dx", function(d) {return(($scope.config.size(d.size)) + 10);})
					.style("font-size", text_size + "px");

				///////////////////////////g///////////////////////////////////
				$scope.g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
			});
		$scope.svg.call($scope.zoom);
		$scope.helperFun.resize();
		$scope.force
				.nodes($scope.graph.nodes)
				.links($scope.graph.links)
				.start()
				.on("tick", function() {
					$scope.node
						.attr("transform", function(d) {
							return "translate(" + d.x + "," + d.y + ")";
						})
						.attr("cx", function(d) {
							return d.x;
						})
						.attr("cy", function(d) {
							return d.y;
						})
						.on("mouseover", function(d) {
							$scope.helperFun.set_highlight(d);
						})
						.on("mousedown", function(d) {
							d3.event.stopPropagation();
							$scope.config.focus_node = d;
							$scope.helperFun.set_focus(d);
							if ($scope.config.highlight_node === null)
								$scope.helperFun.set_highlight(d);
						})
						.on("mouseout", function(d) {
							$scope.helperFun.exit_highlight();
						});
						// .on("dblclick.zoom", function(d) {
						// 	d3.event.stopPropagation();
						// 	var dcx = (window.innerWidth / 2 - d.x * $scope.zoom.scale());
						// 	var dcy = (window.innerHeight / 2 - d.y * $scope.zoom.scale());
						// 	$scope.zoom.translate([dcx, dcy]);
						// 	$scope.g.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + $scope.zoom.scale() + ")");
						// });
					$scope.text
								.attr("transform", function(d) {
									return "translate(" + d.x + "," + d.y + ")";
								})
								.style("fill",$scope.config.text_color);
					$scope.links
						.attr("x1", function(d) {
							return d.source.x;
						})
						.attr("y1", function(d) {
							return d.source.y;
						})
						.attr("x2", function(d) {
							return d.target.x;
						})
						.attr("y2", function(d) {
							return d.target.y;
						})
						.style("stroke-opacity",(d)=>{
							return  $scope.config.opaq;
						})
						.style("stroke", function(d) {
							return $scope.config.default_link_color;
						});
					$scope.circle
						.style($scope.config.tocolor, function(d) {
							return $scope.config.color[d.color_id];
						});

				});
		d3.select(window).on("mouseup",function() {
			if ($scope.config.focus_node !== null) {
				focus_node = null;
				if ($scope.config.highlight_trans < 1) {
					$scope.circle.style("opacity", 1);
					$scope.text.style("opacity", 1);
					$scope.links.style("opacity", 1);
				}
			}
			if ($scope.config.highlight_node === null) $scope.helperFun.exit_highlight();
		});
		d3.select(window).on("resize", $scope.helperFun.resize);
	};
	$scope.helperFun={
		isNumber:(n)=>{
		  return !isNaN(parseFloat(n)) && isFinite(n);
		},
		resize:()=>{
			$scope.config.width = window.innerWidth;
			$scope.config.height = window.innerHeight;
			$scope.svg.attr("width", $scope.config.width ).attr("height", $scope.config.height);
			$scope.force.size([$scope.force.size()[0] + ($scope.config.width  - $scope.config.w) / $scope.zoom.scale(), $scope.force.size()[1] + ($scope.config.height - $scope.config.h) / $scope.zoom.scale()]).resume();
			$scope.config.w = $scope.config.width ;
			$scope.config.h = $scope.config.height;
		},
		exit_highlight:()=>{
			$scope.config.highlight_node = null;
			if ($scope.config.focus_node === null) {
				$scope.svg.style("cursor", "move");
				if ($scope.config.highlight_color != "white") {
					$scope.circle.style($scope.config.towhite, "white");
					$scope.text.style("font-weight", "normal");
					$scope.links.style("stroke", function(o) {
						return $scope.config.default_link_color;
					});
				}

			}
		},
		set_focus:(d)=>{
			if ($scope.config.highlight_trans < 1) {
				$scope.circle.style("opacity", function(o) {
					return $scope.helperFun.isConnected(d, o) ? 1 : $scope.config.highlight_trans;
				});

				$scope.text.style("opacity", function(o) {
					return $scope.helperFun.isConnected(d, o) ? 1 : $scope.config.highlight_trans;
				});

				$scope.links.style("opacity", function(o) {
					return o.source.index == d.index || o.target.index == d.index ? 1 : $scope.config.highlight_trans;
				});
			}
		},
		set_highlight:(d)=>{
			$scope.svg.style("cursor", "pointer");
			if ($scope.config.focus_node !== null)
				d = $scope.config.focus_node;
			$scope.config.highlight_node = d;
			if ($scope.config.highlight_color != "white") {
				$scope.circle.style($scope.config.towhite, function(o) {
					return $scope.helperFun.isConnected(d, o) ? "white" : "white";
				});
				$scope.text.style("font-weight", function(o) {
					return $scope.helperFun.isConnected(d, o) ? "normal" : "normal";
				});
				$scope.links.style("stroke", function(o) {
					return $scope.config.default_link_color;
				});
			}
		},
		isConnected:(a, b)=>{
			return $scope.data.linkedByIndex[a.index + "," + b.index] || $scope.data.linkedByIndex[b.index + "," + a.index] || a.index == b.index;
		},
		hasConnections:(a)=>{
			for (var property in $scope.data.linkedByIndex) {
				s = property.split(",");
				if ((s[0] == a.index || s[1] == a.index) && $scope.data.linkedByIndex[property]) return true;
			}
			return false;
		}
	};
	$scope.ElasticRest= {
		get_index: (host,port)=>{
			$.ajax({
				method:"GET",
				url : `http://${host}:${port}/_cat/indices?format=json`,
				header:{
					"Access-Control-Allow-Origin":"*"
				},
				crossDomain: true,
				success:(data)=>{
					$scope.config.elasticdata.index = [];
					data.map((obj)=>{
						$scope.config.elasticdata.index.push(obj.index);
					});
				},
				fail : (err)=>{
					console.log(err);
				}
			});
		}
		,get_type:(host,port,index)=>{
			$.ajax({
				method:"GET",
				url : `http://${host}:${port}/${index}/_mapping?format=json`,
				header:{
					"Access-Control-Allow-Origin":"*"
				},
				crossDomain: true,
				success:(data)=>{
					if(data[index])
						$scope.config.elasticdata.type = Object.keys(data[index].mappings);
				},
				fail : (err)=>{
					console.log(err);
				}
			});
		}
		,get_field:(host,port,index,type)=>{
			$.ajax({
				method:"GET",
				url : `http://${host}:${port}/${index}/_mapping?format=json`,
				header:{
					"Access-Control-Allow-Origin":"*"
				},
				crossDomain: true,
				success:(data)=>{
					if(data[index]&& data[index].mappings[type])
						$scope.config.elasticdata.field = Object.keys(data[index].mappings[type].properties);
				},
				fail : (err)=>{
					console.log(err);
				}
			});
		}
		,get_buckets:(host,port,index,type,field,max,id)=>{
			$.ajax({
				method:"POST",
				url:`http://${host}:${port}/${index}/${type}/_search`,
				headers: {
					"content-type": "application/json",
					"cache-control": "no-cache",
				},
				"data": `{"size": 0,"_source": false,"aggs" : {"count" : {"terms" : { "field": "${field}","size":"${max}"}}}}`,
				success:(data)=>{
					if(id == 1)
					 	$scope.data.field_1_buckets = data.aggregations.count.buckets;
					if(id == 2)
						$scope.data.field_2_buckets = data.aggregations.count.buckets;

				},
				fail:(err)=>{
					console.log(err);
				}
			});
		}
		,create_nodes:()=>{
			$scope.graph.nodes = [];
			$scope.data.field_1_buckets.map((obj)=>{
				$scope.config.max_node_freq = $scope.config.max_node_freq <= parseInt(obj.doc_count) ? parseInt(obj.doc_count) : $scope.config.max_node_freq;
				$scope.config.min_node_freq = $scope.config.min_node_freq >= parseInt(obj.doc_count) ? parseInt(obj.doc_count) : $scope.config.min_node_freq;
				$scope.graph.nodes.push({
					"size": parseInt(obj.doc_count),
					"id"  : obj.key,
					"freq": parseInt(obj.doc_count),
					"color_id" : 0
				});
			});
			if($scope.config.selected_field_1 != $scope.config.selected_field_2){
				$scope.data.field_2_buckets.map((obj)=>{
					$scope.config.max_node_freq = $scope.config.max_node_freq <= parseInt(obj.doc_count) ? parseInt(obj.doc_count) : $scope.config.max_node_freq;
					$scope.config.min_node_freq = $scope.config.min_node_freq >= parseInt(obj.doc_count) ? parseInt(obj.doc_count) : $scope.config.min_node_freq;
					$scope.graph.nodes.push({
						"size": parseInt(obj.doc_count),
						"id"  : obj.key,
						"freq": parseInt(obj.doc_count),
						"color_id" : 1
					});
				});
			}
		}
		,get_coterm_count:(host,port,index,type,field1,field2,term1,term2,sumfield,i1,i2)=>{
			var settings = sumfield ? {
			  "async": true,
			  "crossDomain": true,
			  "url": `http://${host}:${port}/_search?pretty=`,
			  "method": "POST",
			  "headers": {
			    "content-type": "application/json",
			    "cache-control": "no-cache",
			    "postman-token": "cee5e77e-74fb-1f44-d118-a92430bf65ea"
			  },
			  "processData": false,
			  "data": `{"_source": false,"size":"0","query":{"bool":{"must":[{"terms":{"${field1}":["${term1}"]}},{"terms":{"${field2}":["${term2}"]}}]}},"aggs":{"sum":{"sum":{"field": "${sumfield}"}}}}`
			} : {
			  "async": true,
			  "crossDomain": true,
			  "url": `http://${host}:${port}/_search?pretty=`,
			  "method": "POST",
			  "headers": {
			    "content-type": "application/json",
			    "cache-control": "no-cache",
			    "postman-token": "cee5e77e-74fb-1f44-d118-a92430bf65ea"
			  },
			  "processData": false,
			  "data": `{"_source": false,"size":"0","query":{"bool":{"must":[{"terms":{"${field1}":["${term1}"]}},{"terms":{"${field2}":["${term2}"]}}]}}}`
			};

			$.ajax(settings).done(function (response) {
				if(parseInt(response.hits.total) > 0){
					$scope.config.max_stroke_freq = $scope.config.max_stroke_freq <= parseInt(response.hits.total) ? parseInt(response.hits.total) : $scope.config.max_stroke_freq;
					$scope.config.min_stroke_freq = $scope.config.min_stroke_freq >= parseInt(response.hits.total) ? parseInt(response.hits.total) : $scope.config.min_stroke_freq;
					$scope.graph.links.push({
						"source" :parseInt(i1),
						"target" :parseInt(i2),
						"strength":parseInt(response.hits.total)
					});
				}
			});
		}
		,create_links:(host,port)=>{
			$scope.graph.links = [];
			$scope.graph.nodes.map((obj1,i1)=>{
				$scope.graph.nodes.map((obj2,i2)=>{
					if(obj2.id != obj1.id && i1 != i2){
						$scope.ElasticRest.get_coterm_count(host,port,$scope.config.selected_index,$scope.config.selected_type,$scope.config.selected_field_1,$scope.config.selected_field_2,obj1.id,obj2.id,null,i1,i2);
					}
				});
			});
		}
	};
	$scope.calculateData = (host,port,index,type,field1,max1,field2,max2)=>{
		$scope.ElasticRest.get_buckets(host,port,index,type,field1,max1,1);
		$scope.ElasticRest.get_buckets(host,port,index,type,field2,max2,2);
		$scope.ElasticRest.create_nodes();
		$scope.ElasticRest.create_links(host,port);
	};
	$scope.ElasticRest.get_index($scope.config.elasticdata.host,$scope.config.elasticdata.port);
	$(".reload").click(()=>{
		$scope.ElasticRest.get_type($scope.config.elasticdata.host,$scope.config.elasticdata.port,$scope.config.selected_index);
		$scope.ElasticRest.get_field($scope.config.elasticdata.host,$scope.config.elasticdata.port,$scope.config.selected_index,$scope.config.selected_type);
	});
	$("#fun").click(()=>{
		$scope.calculateData(
			$scope.config.elasticdata.host ,
			$scope.config.elasticdata.port ,
			$scope.config.selected_index ,
			$scope.config.selected_type,
			$scope.config.selected_field_1,$scope.config.max_bucket[0],
			$scope.config.selected_field_2,$scope.config.max_bucket[1]
		);
	});
	$("#draw").click(()=>{
		setInterval(draw(),3000);
	});
	function draw(){
			$scope.graph.links.forEach(function(d) {
				$scope.data.linkedByIndex[d.source + "," + d.target] = true;
			});
			$("#mysvg").empty();
			$scope.init();
	}
});
