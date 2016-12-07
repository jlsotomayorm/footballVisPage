/**
 * Created by jl on 20/04/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvEventsBeforeGoal", fvEventsBeforeGoal);

    fvEventsBeforeGoal.$inject = ["matchesService","colorsTopEvents"];

    /* @ngInject */
    function fvEventsBeforeGoal(matchesService,colorService) {
        var directive = {
            bindToController: true,
            controller: eventsBeforeGoalController,
            controllerAs: "eventsVm",
            templateUrl: "js/components/goalAnalysis/eventsBeforeGoalTemplate.html",
            link: link,
            restrict: "E",
            scope: {
                prevEvents: "=",
                teamName: "@"
            }
        };
        return directive;

        function link(scope, element, attrs,ctrl) {

            var vm = ctrl;
            var rawElement = element[0];
            var mainDiv = rawElement.querySelector("#goalView");

            var eventSizeInPixels = 10;


            var segmentsYOffset = (attrs.yoffset===undefined ? 10 : parseInt(attrs.yoffset));

            var segmentWidth = eventSizeInPixels * vm.timeWindowInSecs;

            var xScale = d3.scale.ordinal()
                .rangeBands([0,segmentWidth]);


            var svg = d3.select(mainDiv)
                .append("svg")
                .style("width", segmentWidth);
                //.style("height",150);

            var bgColor = "#eee";


            // 0 : others
            var topEventIds = vm.topEvents.map(function(d) { return d.id});

            var color = colorService.getColorScale();




            scope.$watchCollection("eventsVm.prevEvents",function(newPrevEvents) {
                if(newPrevEvents) {


                    var ngoals = newPrevEvents.length;
                    var totalYOffSet = (ngoals-1) * segmentsYOffset;
                    svg.style("height",ngoals*eventSizeInPixels + totalYOffSet);

                    var segmentGoal = svg.selectAll(".goalSegment")
                        .data(newPrevEvents);

                    segmentGoal.attr("transform",positionSegment);
                    segmentGoal.each(createCells);

                    var group = segmentGoal.enter()
                        .append("g")
                        .attr("class","goalSegment")
                        .attr("transform",positionSegment);

                        group.append("rect")
                        .attr("height",eventSizeInPixels)
                        .attr("width",segmentWidth)
                        .attr("fill",bgColor);

                    group.each(createCells);




                    segmentGoal.exit().remove();

                    scope.$emit("finishRendering",true);



                }

            });


            function createCells(previousGoalEvents) {

                var goalTimeInSecs = 0;

                    //There should be just 1 goal event at this point
                previousGoalEvents.forEach(function(prevEvent) {
                    if(prevEvent.type_id==vm.goalEventID) {
                            goalTimeInSecs = prevEvent.min*60 + prevEvent.sec;
                    }
                });

                var nSecsBefore = goalTimeInSecs - vm.timeWindowInSecs;


                xScale.domain(d3.range(nSecsBefore,goalTimeInSecs+1));

                var cell = d3.select(this).selectAll(".goalCell")
                    .data(previousGoalEvents);

                cell
                    .attr("x",positionCell)
                    .style("fill",fillCell);

                cell
                    .enter().append("rect")
                   // .attr("class","goalCell")
                    .attr("class",function(d){ return d.type_id==vm.goalEventID? "goalEvent goalCell": "goalCell";})
                    .attr("x",positionCell)
                    .attr("width",xScale.rangeBand())
                    .attr("height",xScale.rangeBand())
                    .style("fill",fillCell);

                cell.exit().remove();

            }
            function positionSegment(d,i) {
                    return "translate(0," + ((eventSizeInPixels+ segmentsYOffset)*i) + ")";
            }


            function positionCell (d) {
                    return xScale(d.min*60+ d.sec);
            }

            function fillCell(d) {
                return topEventIds.indexOf(d.type_id)>-1?color(d.type_id):color(0);
            }



        }
    }

    eventsBeforeGoalController.$inject = ["$element","colorsTopEvents"];

    /* @ngInject */
    function eventsBeforeGoalController($element,colorService) {
        var vm = this;

        vm.eventsBeforeGoals = [];
        vm.timeWindowInSecs = 30;

        vm.topEvents = colorService.getInfo();
        vm.goalEventID = 16;
        vm.getRawElement = getRawElement;

        ///////////////////////////////////////////////////

        function getRawElement() {
            return $element[0];
        }









    }

})();

