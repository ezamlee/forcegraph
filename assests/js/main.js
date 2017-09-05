angular.module('my-app', []).controller('main', function($scope) {
  $scope.width =  $("#mysvg").width()//determine width from drawing Parent
  $scope.height = $("#mysvg").height();//determine height from drawing Parent
  $scope.isSpaceBarPressed = false;
  $scope.graph = {
    "nodes": [{
        "x": 469,
        "y": 410,
        "r":23,
        "label":"Itemadljlsf1"
      },
      {
        "x": 493,
        "y": 364,
        "r":10,
        "label":"Item2"
      },
      {
        "x": 442,
        "y": 365,
        "r":5,
        "label":"Item3"
      },
      {
        "x": 467,
        "y": 314,
        "r":55,
        "label":"Item4"
      },
      {
        "x": 477,
        "y": 248,
        "r":23,
        "label":"Itexidklfkm5"
      },
      {
        "x": 425,
        "y": 207,
				.attr("dy",function(d){
					return ($scope.config.size(d.size) || $scope.config.nominal_base_node_size);
				})
        "r":60,
        "label":"Itecghjgjhkm5"
      },
      {
        "x": 402,
        "y": 155,
        "r":14,
        "label":"Itbvcbvnb,mem5"
      },
      {
        "x": 369,
        "y": 196,
        "r":21,
        "label":"Item6"
      },
      {
        "x": 350,
        "y": 148,
        "r":10,
        "label":"Item7"
      },
      {
        "x": 539,
        "y": 222,
        "r":3,
        "label":"Item8"
      },
      {
        "x": 594,
        "y": 235,
        "r":6,
        "label":"Item9"
      },
      {
        "x": 582,
        "y": 185,
        "r":12,
        "label":"Item10"
      },
      {
        "x": 633,
        "y": 200,
        "r":18,
        "label":"Item11"
      }
    ],
    "links": [{
        "source": 0,
        "target": 1,
        "strength":3
      },
      {
        "source": 1,
        "target": 2,
        "strength":12
      },
      {
        "source": 2,
        "target": 0,
        "strength":3
      },
      {
        "source": 1,
        "target": 3,
        "strength":1
      },
      {
        "source": 3,
        "target": 2,
        "strength":57
      },
      {
        "source": 3,
        "target": 4,
        "strength":12
      },
      {
        "source": 4,
        "target": 5,
        "strength":1
      },
      {
        "source": 5,
        "target": 6,
        "strength":2
      },
      {
        "source": 5,
        "target": 7,
        "strength":23
      },
      {
        "source": 6,
        "target": 7,
        "strength":52
      },
      {
        "source": 6,
        "target": 8,
        "strength":33
      },
      {
        "source": 7,
        "target": 8,
        "strength":12
      },
      {
        "source": 9,
        "target": 4,
        "strength":54
      },
      {
        "source": 9,
        "target": 11,
        "strength":15
      },
    ]
  }
  $scope.force = d3.layout.force()
                          .nodes($scope.graph.nodes)
                          .linkStrength(1)
                          .links($scope.graph.links)
                          .size([$scope.width, $scope.height/2])
                          .distance(200)
                          .charge(-1*80*$scope.graph.links.length > -1* $scope.width ? -1*$scope.width : -1*80*$scope.graph.links.length)
                          .chargeDistance(60*12)
                          .linkDistance(60*3 > $scope.width || 60*3 > $scope.height ? $scope.height: 60*3 )
                          .on("tick", tick)
                          .start();
  document.body.onkeyup = function(e) {
    $scope.isSpaceBarPressed = false;
  }
  document.body.onkeydown = function(e) {
    $scope.isSpaceBarPressed = true;
  }
  $scope.translate = [0,0];
  $scope.svg = d3.select("#mysvg")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .call(d3.behavior.zoom().on("zoom", function() {
      $scope.svg.attr("transform","translate("
			   		+	[parseInt(d3.event.translate[0]),parseInt(d3.event.translate[1])]
						+ ")"
						+ "scale("
						+ d3.event.scale
						+ ")"
			)
    }))
    .append("g")
  $scope.node = $scope.svg.selectAll(".node");
  $scope.label = $scope.svg.selectAll("text");
  $scope.link = $scope.svg.selectAll(".link");
  $scope.drag = $scope.force.drag().on("dragstart", dragstart);
  $scope.link = $scope.link.data($scope.graph.links)
                      .enter().append("line")
                      .style('stroke-width',(d,i)=>{
                        return i;
                      })
                      .attr("class", "link")
                      .attr("stroke-opacity",(d,i)=>{
                        return i/12
                      });
  $scope.node = $scope.node.data($scope.graph.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", (d)=>{return d.r < 20?20:d.r})
    .style('fill',(d)=>{
      return `rgb(${parseInt(Math.random()*256)},${parseInt(Math.random()*256)},${parseInt(Math.random()*256)})`
    })
    .on("click", dblclick)
    .call($scope.drag)
  $scope.label = $scope.label.data($scope.graph.nodes)
                            .enter()
                            .append("text")
                            .text(function(d,i) { return $scope.graph.nodes[i].label; })
                            .attr("x", (d,i)=>{
                              return d.x
                            })
                            .attr("y", (d,i)=>{
                              return d.y
                            })
                            .attr("fill", "black")
                            .attr({
                              "alignment-baseline": "middle",
                              "text-anchor": "middle",
                              'font-size':(d,i)=>{
                                return d.r/2 < 10 ? 10:d.r/2
                              }
                            })
                            .attr("class", "text")
  function tick() {
    $scope.link.attr("x1", function(d) {
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
      });
    $scope.node.attr("cx", function(d) {
        return d.x;
      }).attr("cy", function(d) {
        return d.y;
      });
    $scope.label.attr("x",function(d){
        return d.x
      }).attr("y",function(d){
        return d.y  + d.r*0.01*3
    })
  }
  function dblclick(d) {
    d3.select(this).classed("fixed", d.fixed = d.fixed?false:true);
  }
  function dragstart(d) {
    console.log("clicked");
  }
})
