/**
 * Created by jl on 11/11/15.
 */
angular.module('footballDirectives')
    .directive('fvPitchSelection', ["$timeout",function($timeout) {

        var directive = {
            restrict: 'A',
            require: ["fvPitchSelection","fvPitch"],
            controller: pitchSelectionController,
            controllerAs: "pitchSelectionVm",
            bindToController:true,
            link: linkFunction,
            priority:1

        };
        return directive;


        ////////////////////////////////

        function linkFunction(scope, element,attrs,ctrl) {



            var vm = ctrl[0];
            var pitchController = ctrl[1];



            var pitchElement = d3.select(pitchController.getRawElement());
            var dims = pitchController.getDimensions();
            var pitchSvg = pitchElement.select("svg");

            // Duplicated code --- do something
            var realPitchWidth = 104;
            var realPitchHeight = 104;

            var pitchXScale = d3.scale.linear()
                .domain([0,realPitchWidth])
                .range([dims.padding,dims.width-dims.padding]);

            var pitchYScale = d3.scale.linear()
                .domain([0,realPitchHeight])
                .range([dims.height-dims.padding,dims.padding]);


            var brush = d3.svg.brush()
                .x(pitchXScale)
                .y(pitchYScale)
                .on("brush",filterBySpace);

            pitchSvg.append("g")
                .attr("class","brush")
                .call(brush);



            function filterBySpace() {


                var extentLowerBounds = brush.extent()[0];
                var extentUpperBounds = brush.extent()[1];


                var dims = {};
                if(brush.empty()) {
                    dims = {
                        point:{x:-2, y:-2 },
                        width:realPitchWidth,
                        height: realPitchHeight};
                } else {

                    dims = {
                        point:{x: extentLowerBounds[0], y: extentLowerBounds[1]},
                        width: extentUpperBounds[0]-extentLowerBounds[0],
                        height: extentUpperBounds[1]-extentLowerBounds[1]

                    };
                }

               // eventsController.setSpaceDimensions(dims);

                $timeout(function(){
                    //eventsController.filterSpace(dims);
                    vm.filterSpace(dims);
                });



            }

        }

    }]);


pitchSelectionController.$inject = [];
function pitchSelectionController() {
    var vm = this;
    vm.filterSpace = {};
    vm.setFilterFunction = setFilterFunction;

    function setFilterFunction(filterFunction) {
        vm.filterSpace = filterFunction;
    }



}




