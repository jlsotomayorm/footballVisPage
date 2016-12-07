/**
 * Created by jl on 28/04/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvTeamFilter", fvTeamFilter);

    fvTeamFilter.$inject = [];

    /* @ngInject */
    function fvTeamFilter() {
        var directive = {
            bindToController: true,
            controller: teamFilterController,
            controllerAs: "teamFilterVm",
            templateUrl: "js/components/eventsFilters/teamFilter/teamFilterTemplate.html",
            link: link,
            restrict: "E",
            scope: {
                matchEvents: "=",
                selectedMatches: "=",
                filteredByTeam: "=result",
                selectedEventId: "=selectedEvent"
            }
        };
        return directive;

        function link(scope, element, attrs) {

        }
    }

    teamFilterController.$inject = [];

    /* @ngInject */
    function teamFilterController() {
        var vm = this;
        vm.teams = [{id:0,name:""}];
        vm.filterTeam = filterTeam;
        vm.selectedTeam = vm.teams[0];

       // vm.filteredByTeam = [];
        vm.orderOptions = [
            {
                name: "Match Date",
                sortFunc:function(arr1,arr2) {
                    var obj1 = arr1[arr1.length-1];
                    var obj2 = arr2[arr2.length-1];

                    return Date.parse(obj1.timestamp)
                          - Date.parse(obj2  .timestamp);
                }
            },
            {
                name:"Goal X",
                sortFunc: function(arr1,arr2) {
                    var obj1 = arr1[arr1.length-1];
                    var obj2 = arr2[arr2.length-1];

                    return obj1.x - obj2.x;
                }
            },
            {
                name: "Goal Y",
                sortFunc: function(arr1,arr2) {
                    var obj1 = arr1[arr1.length-1];
                    var obj2 = arr2[arr2.length-1];

                    return obj1.y - obj2.y;
                }
            },
            {
                name:" Passes",
                sortFunc: function(arr1,arr2) {
                    var passEventId = 1;
                    var passCount1 = arr1.reduce(countPasses,0);
                    var passCount2 = arr2.reduce(countPasses,0);

                    return passCount1-passCount2;




                    function countPasses(prev,curr) {
                        return curr.type_id==passEventId? prev+1:prev;
                    }

                }
            }
        ];
        vm.selectedOrder = vm.orderOptions[0];
        vm.updateOrder = updateOrder;
        populateTeams();




        function populateTeams() {
            var teamObjs = vm.selectedMatches.map(function(match) {
                return [{id: match.away_team_id ,name: match.away_team_name},
                    {id: match.home_team_id,name:match.home_team_name}];
            });

            var flattened = teamObjs.reduce(function(prev,curr) {
                return prev.concat(curr);
            });


            var teamNames = flattened.map(function(d) {return d.name});

            var uniqueNames = flattened.filter(function(teamObj,index,self) {
                    return (teamNames.indexOf(teamObj.name) === index);


            });

            vm.teams = vm.teams.concat(uniqueNames);

        }


        function filterTeam () {
            var matchIndices = vm.selectedMatches.map(function(match,index) {
               if (match.away_team_name==vm.selectedTeam.name ||
                    match.home_team_name==vm.selectedTeam.name)
                        return index;

                return -1;
            });

            var validIndices = matchIndices.filter(function(d){ return d!=-1;});


             var perMatch = validIndices.map(function(index) {
                    return vm.matchEvents[index][vm.selectedTeam.id];
            }) ;

            var byTeam  = perMatch.reduce(function(prev,curr) {
                    return prev.concat(curr);
            });

            updateOrder(angular.copy(byTeam));
            //console.log(byTeam);

        }

        function updateOrder(filteredByTeam) {
            vm.filteredByTeam =  filteredByTeam.sort(vm.selectedOrder.sortFunc);



        }


    }

})();

