/**
 * Created by jl on 02/06/16.
 */
(function () {
    "use strict";

    angular
        .module("footballVisApp")
        .factory("colorsTopEvents", ColorsTopEvents);

    ColorsTopEvents.$inject = [];

    /* @ngInject */
    function ColorsTopEvents() {
        var service = {
            getColorScale: getColorScale,
            getInfo: getInfo
        };
        return service;

        ////////////////

        function getColorScale() {
            var eventsInfo = this.getInfo();
            //var color = d3.scale.category20();
            var color = d3.scale.ordinal();
            color.range(["#6786af", "#683d0d", "#add51f", "#0a4f4e", "#42952e","#21f0b6", "#b5d08d","#a27c59" , "#20f53d", "#e37021", "#1f9383", "#e9bf98"]);
            var eventIds = eventsInfo.map(function(event) {
                return event.id;
            });
            color.domain(eventIds);

            return color;
        }

        function getInfo() {
            var topEvents =  [
                {name: "Pass", id: 1},
                {name: "Out", id: 5},
                {name: "Ball Recovery", id: 49},
                {name: "Ball Touch",id:61},
                {name: "Interceptions", id:8},
                {name: "Turnover", id: 401},
                {name: "Dispossessed", id: 50},
                {name: "Tackle", id: 7},
                {name: "Take On", id: 3},
                {name: "Goal", id:16},
                {name: "Motifs",id:400},
                {name: "Possession Loss",id:402},
                {name: "Others", id: 0}


            ];

            return topEvents;
        }
    }

})();

