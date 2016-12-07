/**
 * Created by jl on 30/05/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvSpaceFilter", fvSpaceFilter);

    fvSpaceFilter.$inject = [];

    /* @ngInject */
    function fvSpaceFilter() {
        var directive = {
            bindToController: true,
            controller: spaceFilterController,
            controllerAs: "spaceFilterVm",
            templateUrl: "js/components/eventsFilters/spaceFilter/spaceFilterTemplate.html",
            link: link,
            restrict: "E",
            scope: {
                filteredEvents: "="
            }
        };
        return directive;

        function link(scope, element, attrs) {

        }
    }

    spaceFilterController.$inject = [];

    /* @ngInject */
    function spaceFilterController() {

    }

})();

