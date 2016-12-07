/**
 * Created by jl on 25/10/15.
 */
angular
    .module("footballControllers")
    .controller("MatchesDetailCtrl",["$http","$routeParams","matchesService","eventsLoaderService","trajectoriesService","motifsLoaderService",
    function($http,$routeParams,matchesService,eventsLoader,trajectoryLoader,motifsLoader){

        var vm = this;
        var matches = matchesService.getMatches();

        vm.teamNamesMap = matchesService.getTeamsNameMap();


        /*vm.subsetA = matches.slice(0,(matches.length-1)/2+1);
        vm.subsetB = matches.slice((matches.length-1)/2+1);*/
        vm.subsetA = matches;
        vm.matchIds = $routeParams.matchIds;
        vm.eventsByMatch = {};
        vm.selectedMatchEvents = [];
        vm.goalPrevEvents = [];
        vm.goalEventID = 16;
        vm.timeWindowInSecs = 30;
        vm.filteredByTeam = [];
        vm.clusters8Data = [];
        vm.clusters50Data = [];
        vm.subClustersObj = {};
        vm.motifsData = [];
        vm.filteredMotifs = null;
        vm.frequencyCount = null;
        vm.isUniqueEnabled = false;

        vm.motifPerCluster = {
            selectedCluster: "1",
            selectedArea: "defense",
            selectedMotif: "none",
            orderFrequenciesPerCluster:orderFrequenciesPerCluster

        };

        vm.mouseOnMotif = {};


        // Interaction
        vm.selectedEventId = 0;


        trajectoryLoader.getDataWith50Clusters().then(function(data50) {
            vm.clusters50Data = data50;
            vm.testTrajectories = _.mapValues(data50,function(trajectoryArr) {
                if(trajectoryArr.length>500)
                    return trajectoryArr.slice(0,500);
                return trajectoryArr;
            });
            trajectoryLoader.getDataWith8Clusters().then(function(data8) {
                vm.clusters8Data = data8;
                vm.subClustersObj =  trajectoryLoader.getSubClusters();


            });


        });

       /* ‌‌var aToFile = vm.clusters50Data[3];
        var points = aToFile.map(function(arr) { return {x:obj.x,y:obj.y};});*/

        activate();



        //////////////////////////


        function activate() {
           return  getMotifsData();
                   /* .then(getEvents)
                    .then(filterMatchEvents);*/

        }


        function getEvents() {
            return  eventsLoader.getEventsData()
                .then(function(dataByMatchId) {
                    vm.eventsByMatch = dataByMatchId;
                    return vm.eventsByMatch;

            });
        }


        function getMotifsData() {
            return motifsLoader.getMotifsData().then(function(data) {
                    vm.motifsData = data;
            });
        }



        function filterMatchEvents() {

            var matchesIds = vm.subsetA.map(function (e) {
                return parseInt(e.id);
            });


            var selectedMatchEvents = matchesIds.map(function(matchId) {
                return vm.eventsByMatch[matchId];
            });

            //move own goals to the other team  event list-----------------SBR


            vm.selectedMatchEvents = selectedMatchEvents.map(function(matchEvents,index) {
                    var nMatchEvents = {};
                    var homeId = vm.subsetA[index].home_team_id;
                    var awayId = vm.subsetA[index].away_team_id;

                    var homeTeam = removeOwnGoal(matchEvents[homeId]);
                    var awayTeam = removeOwnGoal(matchEvents[awayId]);

                nMatchEvents[homeId] = insertOwnGoal(homeTeam.events,awayTeam.ownGoals,homeId);
                nMatchEvents[awayId] = insertOwnGoal(awayTeam.events,homeTeam.ownGoals,awayId);

                return nMatchEvents;

            });

            filterPrevGoalEvents();

        }


        function filterPrevGoalEvents() {

            vm.goalPrevEvents = vm.selectedMatchEvents.map(function(matchEvents,index) {
                    var goalPrevEvents = {};
                    var homeId = vm.subsetA[index].home_team_id;
                    var awayId = vm.subsetA[index].away_team_id;


                    goalPrevEvents[homeId] = getPrevGoalEvents(matchEvents[homeId]);
                    goalPrevEvents[awayId] = getPrevGoalEvents(matchEvents[awayId]);

                    return goalPrevEvents;
            });

        }

        function getPrevGoalEvents(eventList) {
            var sortedEvents = sortEventByTime(eventList);

            var goalEvents = sortedEvents.filter(function(event){
                return event.type_id==vm.goalEventID;
            });

            var previousEvents = goalEvents.map(function(goalEvent) {
                var goalTimeInSecs = goalEvent.min*60 +goalEvent.sec;

                var prevs =  sortedEvents.filter(function(event) {
                    var timeInSecs = event.min*60+ event.sec;
                    return timeInSecs > goalTimeInSecs-vm.timeWindowInSecs &&
                        timeInSecs <= goalTimeInSecs;
                });

                return prevs;
            });

            return previousEvents;
        }

        var ownGoalProperty = "X28";
        function removeOwnGoal(eventList) {

            var team = {};
            team.events =  eventList.filter(function(event) {
                return !event.hasOwnProperty(ownGoalProperty);
            });

            team.ownGoals = eventList.filter(function(event) {
                return event.hasOwnProperty(ownGoalProperty);
            });

            return team;
        }

        function insertOwnGoal(teamEvents,goalEvents,teamId) {
            var goalsNewId = goalEvents.map(function(goalEvent) {
                goalEvent.team_id = teamId;
                return goalEvent;
            });

            return teamEvents.concat(goalsNewId);
        }


        function sortEventByTime(events) {
            var rEvents = angular.copy(events);

            rEvents.sort(function(a,b) {
                if(a.min== b.min) {
                    return a.sec - b.sec;
                } else {
                    return  a.min - b.min;
                }
            });

            return rEvents;
        }


        function orderFrequenciesPerCluster() {
            var cluster = vm.motifPerCluster.selectedCluster;
            var area = vm.motifPerCluster.selectedArea;
            var motif = vm.motifPerCluster.selectedMotif;

            if( motif != "none") {
                vm.frequencyCount.frequenciesPerCluster.sort(function(a,b) {
                    return b.clusters[cluster][area][motif] - a.clusters[cluster][area][motif];
                });
            } else {
                vm.frequencyCount.frequenciesPerCluster.sort(function(a,b) {
                    var sumB = _.sum(b.clusters[cluster][area]);
                    var sumA = _.sum(a.clusters[cluster][area]);
                    return sumB - sumA;
                });
            }


            console.log(vm.frequencyCount);
        }




    }]);