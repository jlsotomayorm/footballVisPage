/**
 * Created by jl on 01/12/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvColorLegendDiscrete", fvColorLegendDiscrete);

    fvColorLegendDiscrete.$inject = [];

    /* @ngInject */
    function fvColorLegendDiscrete() {
        var directive = {
            bindToController: true,
            controller: ColorLegendDiscreteController,
            controllerAs: "discreteLegendVm",
            link: link,
            restrict: "E",
            scope: {
                scaleName: "@",
                labelNames: "="
            }
        };
        return directive;

        function link(scope, element, attrs,vm) {

            var rawElement = element[0];
            var svg = d3.select(rawElement)
                .append("svg")
                .style("width","100%")
                .style("height","100%");

            var svgWidth = parseInt(svg.style("width"),10);

            var nColors = vm.colorScale.length;
            var squareWidth = 20;

            var xScale = d3.scale.linear()
                .domain([0, nColors])
                .range([0,svgWidth]);

            var squares = svg.selectAll(".sqLegend")
                .data(vm.colorScale);
            squares.enter()
                .append("g")
                .attr("class","sqLegend")
                .attr("transform",function(d,i) { return "translate(0,15)";})
                .append("rect")
                .attr("y",function(d,i) { return 30*i;})
                .attr("width",squareWidth)
                .attr("height",squareWidth)
                .style("fill",function(d){ return d;});



            scope.$watch("discreteLegendVm.labelNames",function(newValues) {
                if(newValues) {
                    var labels = svg.selectAll(".sqLabel")
                        .data(newValues.reverse());
                    labels.enter()
                        .append("text")
                        .attr("x",30)
                        .attr("y",function(d,i){ return (30*i)+30;})
                        .text(function(d) {return d;});
                }
            });


        }
    }

    ColorLegendDiscreteController.$inject = [];

    /* @ngInject */
    function ColorLegendDiscreteController() {
        var vm = this;

        vm.colorScaleOptions= {
            YlGnBu: ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'],
            Set1: ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6'].reverse(),
            Top3: ['#4daf4a','#377eb8','#e41a1c'].reverse()
        };

        vm.colorScale = vm.colorScaleOptions[vm.scaleName];
    }

})();

