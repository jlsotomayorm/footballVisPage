/**
 * Created by jl on 19/04/16.
 */
(function () {
    "use strict";

    angular
        .module("footballVisApp")
        .factory("timeUtils", timeUtils);

    timeUtils.$inject = [];

    /* @ngInject */
    function timeUtils() {
        var service = {
            maxMinuteFirstPeriod: 50,
            secondPeriodStartAt: 45,
            maxMinuteSecondPeriod: 96,
            getMaxMinute: getMaxMinute,
            convertMinutes: convertMinutes
        };
        return service;

        ////////////////

        function convertMinutes(passEvent) {
            var mins =parseInt(passEvent.min);
            if (passEvent.period_id=="2") {
                mins = (mins-this.secondPeriodStartAt + this.maxMinuteFirstPeriod);
            }
            return mins;
        }

        function getMaxMinute() {
            return (this.maxMinuteFirstPeriod+ this.maxMinuteSecondPeriod - this.secondPeriodStartAt);
        }
    }

})();

