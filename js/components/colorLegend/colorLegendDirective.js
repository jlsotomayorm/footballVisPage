/**
 * Created by jl on 16/09/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvColorLegend", fvColorLegend);

    fvColorLegend.$inject = [];

    /* @ngInject */
    function fvColorLegend() {
        var directive = {
            bindToController: true,
            controller: ColorLegendController,
            controllerAs: "colorLegendVm",
            link: link,
            restrict: "E",
            scope: {
                minValue: "=",
                maxValue: "=",
                scaleName: "@"
            }
        };
        return directive;

        function link(scope, element, attrs,vm) {
            var rawElement = element[0];

            var svg = d3.select(rawElement)
                .append("svg")
                .style("width","100%")
                .style("height",50);

            var svgWidth = parseInt(svg.style("width"),10);

            var nColors = vm.colorScale.length;
            var squareWidth = svgWidth/nColors;

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
                .attr("x",function(d,i) { return xScale(i);})
                .attr("width",squareWidth)
                .attr("height",squareWidth)
                .style("fill",function(d){ return d;});


            scope.$watch("colorLegendVm.maxValue",function(newMaxValue) {
                var limitsData =[vm.minValue,vm.maxValue];
                var limitsText = svg.selectAll(".sqLabel")
                    .data(limitsData);

                var textXScale = d3.scale.linear()
                    .domain(limitsData)
                    .range([0,svgWidth-10]);

                limitsText.enter()
                    .append("text")
                    .attr("x",function(d) { return textXScale(d);})
                    .attr("y",10)
                    .attr("text-anchor",function(d,i){ return i%2==0? "start" : "end";})
                    .attr("font-weight","bolder")
                    .text(function(d) { return d;});
            });
        }
    }

    ColorLegendController.$inject = [];

    /* @ngInject */
    function ColorLegendController() {
        var vm = this;

        vm.colorScaleOptions= {
            YlGnBu: ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58']
        };

        vm.colorScale = vm.colorScaleOptions[vm.scaleName];
    }

})();

