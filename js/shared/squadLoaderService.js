/**
 * Created by jl on 19/01/16.
 */
angular.module("footballVisApp")
    .factory("squadLoaderService",["$http","$q",function($http,$q) {

        var squadData = [];
        var deferred = $q.defer();

        var service = {
            getSquadData: getSquadData
        };


        return service;

        ////////////////////////////////

        function getSquadData () {

            if (squadData.length==0) {
                $http.get("matches/turkish1617Squad.js").success(function(data){

                    var byId ={};
                    data.forEach(function(entry) {
                        byId[entry.playerId] = entry;
                    })

                    squadData = byId;
                    deferred.resolve(byId);

                });


            } else {
                deferred.resolve(squadData);
            }


            return deferred.promise;

        }

    }]);