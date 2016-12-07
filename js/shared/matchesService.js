/**
 * Created by jl on 08/09/15.
 */
angular.module("footballVisApp")
    .factory("matchesService",function () {

        var selectedMatches = [];

        var service = {
            setMatches: setMatches,
            getMatches: getMatches,
            getTeamsNameMap: getTeamsNameMap
        };

        return service;

        //////////////////////

        function setMatches(data) {
            selectedMatches = data;

        }

        function getMatches() {
            return selectedMatches;
        }

        function getTeamsNameMap() {


            var dict = selectedMatches.reduce(function(dictObj,aMatch){
                dictObj[aMatch["away_team_id"]] = aMatch["away_team_name"];
                dictObj[aMatch["home_team_id"]] = aMatch["home_team_name"];
                return dictObj;
            },{});

            return dict;
        }

    });
