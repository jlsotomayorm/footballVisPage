/**
 * Created by jl on 10/08/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvMotifsFreqPerType", fvMotifsFreqPerType);

    fvMotifsFreqPerType.$inject = ["$timeout"];

    /* @ngInject */
    function fvMotifsFreqPerType($timeout) {
        var directive = {
            bindToController: true,
            controller: MotifsFrequencyPerTypeController,
            controllerAs: "motifFreqPerTypeVm",
            templateUrl: "js/components/frequencySquares/motifsFreqPerTypeTemplate.html",
            link: link,
            restrict: "E",
            scope: {
                data: "=",
                selectedMotif:"="
            }
        };
        return directive;

        function link(scope, element, attrs,vm) {
            var rawElement = element[0];
            var mainDiv = rawElement.querySelector("#freqPerTypeView");
            var colorDomainMaxValue = parseInt(attrs.maxValue) || 0;
            var clusterId = parseInt(attrs.clusterId);
            var motifId = attrs.motifId;
            var pitchAreas = ["defense","middle","attack"];


            var teamId = parseInt(attrs.teamId);

            var squareHeight = 30;
            var svg = d3.select(mainDiv)
                .append("svg")
                .style("width","100%")
                .style("height",30);

            var svgWidth = parseInt(svg.style("width"),10);

            var dataNAttributes = vm.data.length;
            var squareWidth = svgWidth / dataNAttributes;

           //var colors = ["#fff5f0","#fee0d2","#fcbba1","#fc9272","#fb6a4a","#ef3b2c","#cb181d","#a50f15","#67000d"];

            var colors = ['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#253494','#081d58'];
            var domainValues = d3.range(0,colors.length,1);

            if(colorDomainMaxValue != 0 ) {
                var step = colorDomainMaxValue / (colors.length -1);
                domainValues = d3.range(0,colorDomainMaxValue+1,step);
            }








            var colorScale = d3.scale.linear()
                .domain(domainValues)
                .range(colors);

            scope.$watch("motifFreqPerTypeVm.data",function(newData) {
                if(newData) {

                    var squares = svg.selectAll(".squares")
                        .data(newData.map(function(d) { return {value:d};}));

                    squares.enter()
                        .append("rect")
                        .attr("x",positionSquare)
                        .attr("width",squareWidth)
                        .attr("height",squareHeight)
                        .style("fill",function(d){ return colorScale(d.value);})
                        .on("mouseover",function(d,i) {

                            $timeout(function(){
                                vm.selectedMotif.cluster=clusterId;
                                vm.selectedMotif.area = pitchAreas[i];
                                vm.selectedMotif.motifId = motifId;
                                vm.selectedMotif.teamId = teamId;
                            });

                            //console.log("Pos ",clusterId,pitchArea,i);
                        });
                   /* squares.enter()
                        .append("text")
                        .attr("class","squares")
                        .text(function(d) {return d;})
                        .attr("x",positionText)
                        .attr("y",squareHeight/2);*/




                }
            });

            function positionSquare(d,i) {
                return i* squareWidth;
            }

            function positionText(d,i) {
                return i*squareWidth + squareWidth/2;
            }


        }
    }

    MotifsFrequencyPerTypeController.$inject = [];

    /* @ngInject */
    function MotifsFrequencyPerTypeController() {

    }

})();

