/**
 * Created by jl on 22/07/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvMotifsFrequency", fvMotifsFrequency);

    fvMotifsFrequency.$inject = [];

    /* @ngInject */
    function fvMotifsFrequency() {
        var directive = {
            bindToController: true,
            controller: MotifsFrequencyController,
            controllerAs: "motifFreqVm",
            templateUrl: "js/components/frequencySquares/motifsFrequencyTemplate.html",
            link: link,
            restrict: "E",
            scope: {
                teamName: "@",
                data: "="
            }
        };
        return directive;

        function link(scope, element, attrs) {


            var rawElement = element[0];
            var mainDiv = rawElement.querySelector("#freqView");
            var nRows = 8;
            var squareSizeInPixels = 50;
            var divHeight = squareSizeInPixels * nRows;
            var colorDomainMaxValue = parseInt(attrs.maxValue) || 174;
            var threshold = 352;

            // sequential
            var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"];
            //diverging
            /*var colors = ["#67001f",
                "#b2182b",
                "#d6604d",
                "#f4a582",
                "#fddbc7",
                "#ffffff",
                "#e0e0e0",
                "#bababa",
                "#878787",
                "#4d4d4d",
                "#1a1a1a"];*/

            var svg = d3.select(mainDiv)
                .append("svg")
                .style("width","100%")
                .style("height",divHeight);

        /*  var firstNColors = Math.floor(colors.length/2)+1;
            var lastNColors = colors.length - firstNColors;
            var firstStep = threshold / (firstNColors-1);
            var firstValues = d3.range(0,threshold+1,firstStep);
            var lastStep = (colorDomainMaxValue - threshold) / (lastNColors);
            var lastValues = d3.range(threshold+lastStep,colorDomainMaxValue+2,lastStep);
            var domainValues = firstValues.concat(lastValues);
        */

            var step = colorDomainMaxValue/ (colors.length-1);
            var domainValues = d3.range(0,colorDomainMaxValue+1,step);

            var colorScale = d3.scale.linear()
                .domain(domainValues)
                .range(colors);



            scope.$watch("motifFreqVm.data",function(newData) {
                if(newData) {

                    var clusterSqr = svg.selectAll(".clusterRow")
                        .data(newData);

                    clusterSqr.enter()
                        .append("g")
                        .attr("class","clusterRow")
                        .attr("transform",positionRow);

                    clusterSqr.each(createSquares);

                }
            });

            function createSquares(motifsFrequencyList) {

                    var squares = d3.select(this).selectAll(".motifSquare")
                        .data(motifsFrequencyList);

                    squares.enter()
                        .append("g")
                        .attr("class","motifSquare");

                    squares.append("rect")
                        .attr("x",positionSquare)
                        .attr("width",squareSizeInPixels)
                        .attr("height",squareSizeInPixels)
                        .style("fill",function(d) { return colorScale(d);});

                    squares.append("text")
                        .attr("class", "values")
                        .text(function(d) { return d;})
                        .attr("x",positionText)
                        .attr("y",squareSizeInPixels/2);


            }

            function positionText(d,i) {
                return i*squareSizeInPixels + squareSizeInPixels/2;
            }
            function positionSquare(d,i) {
                return i* squareSizeInPixels;
            }
            function positionRow(d,i) {
                var yPos = squareSizeInPixels*i;
                    return "translate(0," +  yPos +")";
            }
        }
    }

    MotifsFrequencyController.$inject = [];

    /* @ngInject */
    function MotifsFrequencyController() {

    }

})();

