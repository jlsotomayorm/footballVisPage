/**
 * Created by jl on 15/06/16.
 */
(function () {
    "use strict";

    angular
        .module("footballVisApp")
        .factory("trajectoriesService", trajectoriesService);

    trajectoriesService.$inject = ["$http","$q"];

    /* @ngInject */
    function trajectoriesService($http,$q) {

        var preProcessedTrajectories = [];
        var clusters = [];
        var kmeansClusters = [];


        var service = {
            getPreProcessedData: getPreProcessedData,
            getClusters: getClusters,
            getSubClusters: getSubClusters,
            getKmeansClusters: getKmeansClusters,
            getDataWith8Clusters: getDataWith8Clusters,
            getDataWith50Clusters: getDataWith50Clusters
        };
        return service;

        ////////////////

        //0   1  2  3  4  5 6
        //[1,35,27,40 ,1, 3, 35, ....]
        //[5, 1, 5, 2, 3, 1]


        function getPreProcessedData() {

            var deferred = $q.defer();

            if(preProcessedTrajectories.length == 0) {
                $http.get("matches/noResample.js").success(function(data){
                    preProcessedTrajectories = data;
                    deferred.resolve(data);

                });

            } else {

                deferred.resolve(preProcessedTrajectories);

            }

            return deferred.promise;
        }

        function getClusters() {

            var deferred = $q.defer();

            if(clusters.length == 0) {
                $http.get("matches/clusterOnly.js").success(function(data){
                    clusters = data;
                    deferred.resolve(data);

                });
            } else {
                deferred.resolve(clusters);
            }

            return deferred.promise;
        }

        function getSubClusters() {

            var subClustersObj = {1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[]};

            if(clusters.length != 0 && kmeansClusters.length != 0) {

                clusters.forEach(function(clust,index) {
                    subClustersObj[clust].push(kmeansClusters[index]);
                });

            }

            for(var prop in subClustersObj) {
                subClustersObj[prop] = _.uniq(subClustersObj[prop]);
            }


            return subClustersObj;
        }

        function getKmeansClusters() {

            var deferred = $q.defer();

            if(clusters.length == 0) {
                $http.get("matches/50clusters.js").success(function(data){
                    kmeansClusters = data;
                    deferred.resolve(data);

                });
            } else {
                deferred.resolve(kmeansClusters);
            }

            return deferred.promise;

        }

        function getDataWith8Clusters() {
                return getPreProcessedData().then(function(data){
                        return getClusters().then(function(dataClusters){

                            var grouped = groupByCluster(data,dataClusters);

                            Object.keys(grouped).forEach(function(key){
                               grouped[key].forEach(function(motifObj,indx,arr) {
                                    arr[indx] = motifObj.data;
                               });
                            });
                            return grouped;
                        });
                })
        }

        function getDataWith50Clusters() {
                return getPreProcessedData().then(function(data) {
                        return getKmeansClusters().then(function(dataClusters) {
                            var grouped = groupByCluster(data,dataClusters);
                            Object.keys(grouped).forEach(function(key){
                                grouped[key].forEach(function(motifObj,indx,arr) {
                                    arr[indx] = motifObj.data;
                                });
                            });
                            return grouped;

                        });

                });
        }


        function groupByCluster(data,dataClusters) {

            var withCluster = data.map(function(d,i) { return {cluster:dataClusters[i],data:d}; });
            var grouped = _.groupBy(withCluster,function(value){ return value.cluster;});

            return grouped;
        }


    }

})();

