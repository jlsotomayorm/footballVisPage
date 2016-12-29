/**
 * Created by jl on 28/09/15.
 */

angular.module("footballVisApp")
    .factory("motifsLoaderService", ["$http","$q",function ($http,$q) {

        var matchesMotifs = [];
        var deferred = $q.defer();

        var service =  {
            getMotifsData : getMotifsData,
            getMotifsNames : getMotifsNames
        }
        return service;


        /////////////////////////////////

        function getMotifsData() {


            if (matchesMotifs.length ==0) {

                $http.get("matches/turkish1617Motifs.js").success(function(data){
                    matchesMotifs = data;
                    deferred.resolve(data);

                });

            } else {
                deferred.resolve(matchesMotifs);
            }

            return deferred.promise;


        }

        function getMotifsNames(motifLength) {

            var alphabet = "";
            var start="A";

            for(var i=0;i<motifLength;i++) {
                alphabet += String.fromCharCode(start.charCodeAt() + i);
            }

            return enumerateMotifNames(motifLength);



            function enumerateMotifNames(motifLength) {


                function countDifferentPlayers(aMotif) {

                    var charHistogram = {};
                    for(var i=0;i<aMotif.length;i++) {
                        charHistogram[aMotif[i]]++;
                    }

                    return Object.keys(charHistogram).length;
                }

                function addMotifLetter(aMotif) {

                    var result = [];

                    var nDifPlayers = countDifferentPlayers(aMotif);
                    for(var i=0;i<nDifPlayers+1;i++) {

                        if(alphabet[i]!=aMotif[aMotif.length-1]) {
                            result.push(aMotif+alphabet[i]);
                        }

                    }

                    return result;

                }

                if(motifLength==2) return ["AB"];

                var list = enumerateMotifNames(motifLength-1);

                var result = [];
                for(var i =0; i< list.length;i++) {
                    result = result.concat(addMotifLetter(list[i]));
                }

                return result;
            }

         }




    }]);