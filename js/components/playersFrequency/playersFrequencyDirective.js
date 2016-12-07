/**
 * Created by jl on 19/08/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvPlayersFrequency", fvPlayersFrequency);

    fvPlayersFrequency.$inject = [];

    /* @ngInject */
    function fvPlayersFrequency() {
        var directive = {
            bindToController: true,
            controller: PlayersFrequencyController,
            controllerAs: "playerFreqVm",
            link: link,
            templateUrl: "js/components/playersFrequency/playersFrequencyTemplate.html",
            restrict: "E",
            scope: {
                data: "=",
                selectedMotif: "="
            }
        };
        return directive;

        function link(scope, element, attrs,vm) {



            scope.$watchCollection("playerFreqVm.selectedMotif",function(newSelectedMotif){
                    if(newSelectedMotif) {
                        if(!_.isEmpty(newSelectedMotif)) {
                            var teamId = newSelectedMotif.teamId;
                            var cluster = newSelectedMotif.cluster;
                            var area = newSelectedMotif.area;
                            var motifId = newSelectedMotif.motifId;

                            vm.colorScale.domain([]);
                            //console.log(vm.data[teamId][cluster][area][motifId]);
                        }

                    }

            });


        }
    }

    PlayersFrequencyController.$inject = [];

    /* @ngInject */
    function PlayersFrequencyController() {

        var vm = this;

        vm.setBgColor = setBgColor;
        vm.reorderTable = reorderTable;
        vm.colorScale = d3.scale.category20c();
        vm.tableOrderOptions = [
            {id:"all",label:"Four Players"},
            {id:"p1",label:"Player 1"},
            {id:"p2",label:"Player 2"},
            {id:"p3",label:"Player 3"},
            {id:"p4",label:"Player 4"}
        ];
        vm.selectedOrder = vm.tableOrderOptions[0].id;
        vm.playerFrequencyMap = {};


        function setBgColor(playerId) {
            return {"background-color":vm.colorScale(playerId)};
        }

        function reorderTable() {

            var queryObj = {
                teamId: vm.selectedMotif.teamId,
                cluster: vm.selectedMotif.cluster,
                area: vm.selectedMotif.area,
                motifId: vm.selectedMotif.motifId
            };

            createPlayerFrequencyMapPerPosition(vm.selectedOrder,queryObj);

            var sortOptions = {
                all: function(a,b) {
                    return b.count - a.count;


                },
                p1: function(a,b) {
                    return vm.playerFrequencyMap[b.p1] -
                            vm.playerFrequencyMap[a.p1];
                },
                p2: function(a,b) {

                    return vm.playerFrequencyMap[b.p2] -
                        vm.playerFrequencyMap[a.p2];
                },
                p3: function(a,b) {
                    return vm.playerFrequencyMap[b.p3] -
                        vm.playerFrequencyMap[a.p3];
                },
                p4: function(a,b) {
                    return vm.playerFrequencyMap[b.p4] -
                        vm.playerFrequencyMap[a.p4];
                }
            };


            vm.data[queryObj.teamId][queryObj.cluster][queryObj.area][queryObj.motifId]
                .sort(sortOptions[vm.selectedOrder]);
        }

        function createPlayerFrequencyMapPerPosition(playerPosition,queryObj) {
            var playerIds = vm.data[queryObj.teamId][queryObj.cluster][queryObj.area][queryObj.motifId]
                .map(function(motifObj) {
                    return motifObj[playerPosition];
                })

                vm.playerFrequencyMap = _.countBy(playerIds);

        }

    }

})();

