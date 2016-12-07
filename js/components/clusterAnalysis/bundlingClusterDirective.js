/**
 * Created by jl on 02/11/16.
 */
(function () {
    'use strict';

    angular
        .module('footballDirectives')
        .directive('fvBundlePassCluster', fvBundlePassCluster);

    fvBundlePassCluster.$inject = [];

    /* @ngInject */
    function fvBundlePassCluster() {
        var directive = {
            bindToController: true,
            controller: BundlePassClusterController,
            controllerAs: 'bundleVm',
            link: link,
            templateUrl: "js/components/clusterAnalysis/passClusterTemplate.html",
            restrict: 'E',
            scope: {
                data: "="
            }
        };
        return directive;

        function link(scope, element, attrs,vm) {

            var rawElement = element[0];
            var clusterDiv = rawElement.querySelector("#clusterDiv");
            var svg = d3.select(clusterDiv)
                .append("div")
                .append("svg")
                .style("width", "100%");

            var svgSize = parseInt(svg.style("width"),10);
            svg.style("height",svgSize);


            var clusterGroup =  svg.append("g");

            var xScale = d3.scale.linear()
                .domain([-80,80])
                .range([0,svgSize]);

            var yScale = d3.scale.linear()
                .domain([-80,80])
                .range([0,svgSize]);

            var d3line = d3.svg.line()
                .x(function(d){ return  xScale(d.x);})
                .y(function(d){ return yScale(d.y);})
                .interpolate("linear");

            scope.$watchCollection("bundleVm.data",function(newData) {
                if(newData) {
                    vm.clusterLength = newData.length;
                   /* var nodeData = newData.reduce(function(obj,pointArr,currIndex) {
                        var xy = pointArr.map(function(aPoint) {
                            return {x: aPoint.x,y:aPoint.y};
                        });
                        var offset = 4 * currIndex;
                        obj[offset] = xy[0];
                        obj[offset+1] = xy[1];
                        obj[offset+2] = xy[2];
                        obj[offset+3] = xy[3];

                        return obj;
                    },{});*/

                    var horizontalOffset = 1;
                    var nodeData = newData.reduce(function(obj,pointArr,currIndex) {
                        var xy = pointArr.map(function(aPoint) {
                            return {x: aPoint.x,y:aPoint.y};
                            });
                            var offset = 2 * currIndex;


                            obj["set1"][offset]= xy[0];
                            obj["set1"][offset+1]= xy[1];

                            obj["set2"][offset]= {x:xy[1].x+horizontalOffset,y:xy[1].y};
                            obj["set2"][offset+1]= xy[2];

                            obj["set3"][offset]= {x:xy[2].x+horizontalOffset,y:xy[2].y};
                            obj["set3"][offset+1]= xy[3];

                        return obj;


                    },{set1:{},set2:{},set3:{}});

                    var edgeIds = d3.range(0,Object.keys(nodeData["set1"]).length)
                        .filter(function(id) { return id%2==0;});

                    var edgeData = edgeIds.map(function(id) {
                        return {"source":id,"target":id+1};
                    });



                    var nsets = 3;
                    var setIds = d3.range(1,nsets+1);
                    var resultArr = setIds.map(function(setId) {
                        var setName = "set"+setId;
                        var fbundling = d3.ForceEdgeBundling()
                            .step_size(0.1)
                            .compatibility_threshold(0.9)
                            .nodes(nodeData[setName])
                            .edges(edgeData);
                        return fbundling();
                    });

                /*    var resultArr = setIds.map(function(setId) {
                        var setName = "set"+setId;
                        return _.values(nodeData[setName]);
                    });*/

                    var colorPallette = {
                        0: "#e41a1c",
                        1: "#377eb8",
                        2: "#4daf4a"
                    };

                    resultArr.forEach(function(results,idx) {

                        results.forEach(function(edgeSubpointData){
                            var path = clusterGroup.append("path")
                                .attr("d",d3line(edgeSubpointData))
                                .style("stroke-width",1)
                                .style("stroke",colorPallette[idx])
                                .style("fill", "none")
                                .style('stroke-opacity',0.15);
                        });

                    });




                    /*clusterGroup.selectAll(".node")
                        .data(d3.entries(nodeData))
                        .enter()
                        .append("circle")
                        .attr("class","node")
                        .attr({r:2,fill:"black"})
                        .attr("cx",function(d){return xScale(d.value.x);})
                        .attr("cy",function(d){return yScale(d.value.y);});*/

                   /* results.forEach(function(edgeSubpointData) {

                    });*/

                }



            });

        }
    }

    BundlePassClusterController.$inject = [];

    /* @ngInject */
    function BundlePassClusterController() {
        var vm = this;
        vm.clusterLength = 0;

    }

})();

