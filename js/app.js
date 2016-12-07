
angular.module("footballControllers",[]);

angular.module('footballDirectives', ['d3']);

var footballVisApp = angular.module("footballVisApp", [
  "ngRoute",
  "footballControllers",
    "footballDirectives",
    "footballFilters",
    "ui.bootstrap"
]);

footballVisApp
    .constant("_",window._)
    .run(function($rootScope) {
        $rootScope._ = window._;
    });

footballVisApp.config(["$routeProvider",
		      function($routeProvider){

                  $routeProvider.
                      when("/matches",{
                            templateUrl: "js/components/matchesList/match-list.html",
                          controller: "MatchListCtrl",
                          controllerAs: "vm"
                     }).
                      when("/matches/:matchIds",{
                          templateUrl: "js/components/matchesDetail/matches-detail.html",
                          controller: "MatchesDetailCtrl",
                          controllerAs: "vm"
                      }).
                   otherwise({
                          redirectTo:"/matches"
                      });
}]);



