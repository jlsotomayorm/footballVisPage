/**
 * Created by jl on 25/10/15.
 */
 angular
     .module("footballControllers")
     .controller("MatchListCtrl",["$http","$location","matchesService",function($http,$location,matchesService){

        var vm = this;

        vm.selection = [];
        vm.setSelectedMatches = setSelectedMatches;
        vm.showDetails = showDetails;
        vm.selectAllMatches = selectAllMatches;
        vm.selectSecondRoundMatches = selectSecondRoundMatches;

         vm.fieldSides = [
             {id: "all", label: "All"},
             {id:"home", label:"Home"},
             {id: "away",label:"Away"}];


         vm.matchesResult = [
             {id: "all",label: "All"},
             {id:"win", label: "Win"},
             {id:"draw", label:"Draw"},
             {id:"lose", label:"Lose"}
         ];

         vm.homeAway = vm.fieldSides[0].id;
         vm.winOrLose = vm.matchesResult[0].id;

         //matchInfo.js
        $http.get("matches/turkishMatchInfo.js").success(function(data){
             vm.matches = data.map(function(obj) { obj.selected = false; return obj;});
        });






         function showDetails () {
            vm.selection = vm.matches.filter(function(match){ return match.selected;});
            vm.setSelectedMatches(vm.selection);
             $location.path("/matches/1")
        }

         function setSelectedMatches (matches) {
             matchesService.setMatches(matches);
         }


         function selectAllMatches() {
             vm.filteredMatches.forEach(function(fmatch) {
                fmatch.selected = true;
             });
         }

         function selectSecondRoundMatches() {
             vm.filteredMatches.forEach(function(fmatch) {
                 var dateString = fmatch.game_date;
                 var dateArr = dateString.split("-");
                 var day = dateArr[0];
                 var month = dateArr[1];
                 if( (month=="08" && day>="22") || month>"08")
                     fmatch.selected = true;
             });
         }





}]);
