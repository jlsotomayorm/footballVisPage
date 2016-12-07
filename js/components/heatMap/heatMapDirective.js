/**
 * Created by jl on 13/07/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvHeatMap", fvHeatMap);

    fvHeatMap.$inject = [];

    /* @ngInject */
    function fvHeatMap() {
        var directive = {
            bindToController: true,
            controller: HeapMapController,
            controllerAs: "heatMapVm",
            link: link,
            templateUrl: "js/components/heatMap/heatMapTemplate.html",
            restrict: "E",
            scope: {
                data: "="
            }
        };
        return directive;

        function link(scope, element, attrs,vm) {

            var rawElement = element[0];
            var canvas = rawElement.querySelector("#hmCanvas");

            fitToContainerWidth(canvas);


            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;

            var xScale = d3.scale.linear()
                .domain([0,100])
                .range([0,canvasWidth]);

            var yScale = d3.scale.linear()
                .domain([100,0])
                .range([0,canvasHeight]);



            var heat = simpleheat(canvas);


            var pointRadius = 9; // 7
            var blurRadius = 13; // 15

            var maxValue = 35; // Max value from each team.
            heat.radius(pointRadius,blurRadius);

            scope.$watchCollection("heatMapVm.data",function(newData) {
                if(newData) {


                    var positionCount = countPositionFrequency(newData);
                    var formatted = formatPositionFreq(positionCount);

                    var posScaled = formatted.matrix.map(function(aRow) {
                        return [ xScale(aRow[0]),yScale(aRow[1]), aRow[2]];
                    });

                    vm.helper.localMaxValue = formatted.maxValue;

                    heat
                        .data(posScaled)
                        .max(formatted.maxValue);

                    //console.log("MaxValue",formatted.maxValue);

                    heat.draw();

                }
            });

            scope.$watch("heatMapVm.globalNormalization", function(globalNormalizationEnabled) {
                    if(globalNormalizationEnabled) {
                        heat.max(maxValue);
                    } else {
                        heat.max(vm.helper.localMaxValue);
                    }

                    heat.draw();
            });



        }

        function formatPositionFreq(positionCountObj) {

                var returnObj = {
                    matrix: [],
                    maxValue: 0
                };

                Object.keys(positionCountObj).forEach(function(x) {
                    Object.keys(positionCountObj[x]).forEach(function(y) {
                        returnObj.matrix.push([parseInt(x),parseInt(y),positionCountObj[x][y].count]);
                        //Max Frequency
                        if(positionCountObj[x][y].count> returnObj.maxValue) {
                                returnObj.maxValue =positionCountObj[x][y].count ;
                        }
                    });
                })

            return returnObj;
        }

        function countPositionFrequency(newData) {

            var positionCount = {};

            var positionXY = newData.map(function(aMotifObj) {
                return aMotifObj.motifs.map(function(aMotif) {
                    return {x:aMotif.x,y: aMotif.y};
                });
            });
            var trajectoryPoints = positionXY.map(function(motifArr) {

                var points = [];
                for(var i=0; i< motifArr.length-1; i++) {
                    var segmentPoints = getTrajectoryPoints(motifArr[i],motifArr[i+1]);
                    points = points.concat(segmentPoints);
                }

                return points;
            });

            trajectoryPoints.forEach(function(motifPoints) {

                motifPoints.forEach(function(aPoint) {
                    var floorX = Math.floor(aPoint.x);
                    var floorY = Math.floor(aPoint.y);

                    if(!positionCount.hasOwnProperty(floorX)) {
                        positionCount[floorX]= {};
                    }

                    if(!positionCount[floorX].hasOwnProperty(floorY)) {
                        positionCount[floorX][floorY]= {};
                        positionCount[floorX][floorY].count = 1;
                    }
                    positionCount[floorX][floorY].count +=1;
                });


            });

            return positionCount;

        }

        function getTrajectoryPoints(motif1,motif2) {
            var points = [];
            var interp = d3.interpolateObject(motif1,motif2);

            for(var step=0; step<=1; step+=0.05) {
                points.push(angular.copy(interp(step)));
            }

            return points;
        }

        function fitToContainerWidth(canvas) {
                canvas.style.width = "100%";
                canvas.width = canvas.offsetWidth;

        }
    }

    HeapMapController.$inject = [];

    /* @ngInject */
    function HeapMapController() {

        var vm = this;
        vm.globalNormalization = false;
        vm.helper = {
            localMaxValue: 0
        };
    }

})();

