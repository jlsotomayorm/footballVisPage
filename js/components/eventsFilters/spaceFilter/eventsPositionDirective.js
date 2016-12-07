/**
 * Created by jl on 31/05/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvEventsPosition", fvEventsPosition);

    fvEventsPosition.$inject = ["colorsTopEvents"];

    /* @ngInject */
    function fvEventsPosition(colorService) {
        var directive = {
            bindToController: true,
            controller: EventsPositionController,
            controllerAs: "eventPosVm",
            link: link,
            restrict: "A",
            require: ["fvEventsPosition","fvPitch"],
            scope: {
                events: "="
            }
        };
        return directive;

        function link(scope, element, attrs,ctrl) {
            var vm = ctrl[0];
            var pitchController = ctrl[1];

            var dims = pitchController.getDimensions();



            var xScale = d3.scale.linear()
                .domain([0,100])
                .range([dims.padding,dims.width-dims.padding]);

            var yScale = d3.scale.linear()
                .domain([0,100])
                .range([dims.height-dims.padding,dims.padding]);


            var pitchElement = d3.select(pitchController.getRawElement());
            var pitchSvg = pitchElement.select("svg");

            var eventsGroup = pitchSvg.append("g");


            var eventsInfo = colorService.getInfo();
            var topEventIds = eventsInfo.map(function(d) { return d.id});
            var colorScale = colorService.getColorScale();



            scope.$watchCollection("eventPosVm.events",function(newEvents) {
                    if(newEvents) {
                        console.log("Event pos",newEvents);

                        var posEvents = eventsGroup.selectAll(".goalGroup")
                            .data(newEvents);

                        posEvents.each(showGoal);

                        posEvents.enter()
                            .append("g")
                            .attr("class","goalGroup")
                            .each(showGoal);


                        posEvents.exit().remove();



                    }
            });


            function showGoal(events) {

                    var position = d3.select(this).selectAll(".marker")
                        .data(events);

                    var passEventId = 1;
                    var passes = events.filter(function(d){ return d.type_id==passEventId;});

                    var passLine = d3.select(this).selectAll(".passLine")
                        .data(passes);

                    passLine
                        .attr("x1",function(d) { return xScale(d.x);})
                    .attr("y1",function(d) { return yScale(d.y);})
                    .attr("x2",function(d) { return xScale(d.X140);}) //Pass destination x
                    .attr("y2",function(d) { return yScale(d.X141);}); //Pass destination y

                passLine.enter()
                    .append("line")
                    .attr("class","passLine")
                    .attr("x1",function(d) { return xScale(d.x);})
                    .attr("y1",function(d) { return yScale(d.y);})
                    .attr("x2",function(d) { return xScale(d.X140);})
                    .attr("y2",function(d) { return yScale(d.X141);})
                    .attr("stroke-width",1)
                    .style("stroke","#1F77B4");

                passLine.exit().remove();



                    position
                        .attr("cx",function(d) {return xScale(d.x);})
                        .attr("cy",function(d) { return yScale(d.y);})
                        .style("fill",fillMarker);

                    position.enter()
                        .append("circle")
                        .attr("class","marker")
                        .attr("r",4)
                        .attr("cx",function(d) {return xScale(d.x);})
                        .attr("cy",function(d) { return yScale(d.y);})
                        .style("fill",fillMarker)
                        .style("opacity",1);


                    position.exit().remove();



            }

            function fillMarker(d) {
                    return topEventIds.indexOf(d.type_id)>-1?colorScale(d.type_id):colorScale(0);
            }


        }
    }

    EventsPositionController.$inject = [];

    /* @ngInject */
    function EventsPositionController() {

    }

})();

