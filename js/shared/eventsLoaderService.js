/**
 * Created by jl on 22/10/15.
 */
angular.module("footballVisApp")
.factory("eventsLoaderService",["$http","$q",function($http,$q) {

        var matchesEvents = {};
        var deferred = $q.defer();

        var service = {
            getEventsData: getEventsData
        };


        return service;

        ////////////////////////////////

        function getEventsData () {

            if (Object.keys(matchesEvents).length==0) {
                $http.get("matches/events.js").success(function(data){

                    data.forEach(function(event) {
                        event.min = parseInt(event.min);
                        event.sec = parseInt(event.sec);

                        if(!matchesEvents.hasOwnProperty(event.match_id)) {
                            matchesEvents[event.match_id] = {};
                        }

                        var matchObj = matchesEvents[event.match_id];

                        if(!matchObj.hasOwnProperty(event.team_id)) {
                            matchesEvents[event.match_id][event.team_id] = [];
                        }

                        matchesEvents[event.match_id][event.team_id].push(event);
                    });

                    deferred.resolve(matchesEvents);

                });


            } else {
                deferred.resolve(matchesEvents);
            }


            return deferred.promise;

        }



    }]);