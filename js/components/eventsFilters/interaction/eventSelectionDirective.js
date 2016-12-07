/**
 * Created by jl on 03/06/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvEventSelection", fvEventSelection);

    fvEventSelection.$inject = [];

    /* @ngInject */
    function fvEventSelection() {
        var directive = {
            bindToController: true,
            controller: EventSelectionController,
            controllerAs: "eSelectionVm",
            link: link,
            restrict: "A",
            require:["fvEventSelection","fvEventsBeforeGoal"]

        };
        return directive;

        function link(scope, element, attrs,ctrl) {
            var vm = ctrl[0];
            var prevEventsController = ctrl[1];

            var prevEvents = d3.select(prevEventsController.getRawElement());
            var prevEventsSvg = prevEvents.select("svg");


            scope.$on("finishRendering",function(event,data) {

                    console.log("inside event",data);


                var goals = prevEventsSvg.selectAll(".goalEvent");
                goals.on("mouseover",mouseover);
            }) ;




            function mouseover(d) {

                console.log("Selected",d);
                vm.selectedEventId = d.id;

            }



        }
    }

    EventSelectionController.$inject = [];

    /* @ngInject */
    function EventSelectionController() {

        var vm = this;

        vm.getSelection = getSelection;

        ///////////////////////
        function getSelection() {
            return vm.selectedEventId;
        }


    }

})();

