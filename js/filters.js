/**
 * Created by jl on 26/08/15.
 */
angular.module('footballFilters', [])
    .filter('homeAwayNames', function() {
    return function(matches,query) {
        var filtered = [];


        if(query)
        {

            query = query.toLowerCase();
            angular.forEach(matches, function(match){
                if(match.home_team_name.toLowerCase().indexOf(query)>= 0 ||
                    match.away_team_name.toLowerCase().indexOf(query)>= 0)
                    filtered.push(match);
            });

            return filtered;
        }

        return matches;

    };
})
    .filter("homeAwayFilter",function() {
        return function(matches,query,homeAway) {

            if(matches && query) {

                query = query.toLowerCase();

                var match = {
                    all: function(matchList) {
                        return matchList;
                    },
                    home: function(matchList) {
                        return matchList.filter(function(aMatch) {
                            return aMatch.home_team_name.toLowerCase().indexOf(query)>= 0;
                        });
                    } ,
                    away: function(matchList) {
                        return matchList.filter(function(aMatch) {
                            return aMatch.away_team_name.toLowerCase().indexOf(query) >= 0;
                        })

                    }
                };


                return match[homeAway](matches);

            }

            return matches;

        }
    })
    .filter("winLoseFilter",function() {
        return function(matches,query,winOrLose) {
                if(matches && query) {

                    query = query.toLowerCase();

                    var match = {
                        all: function(matchList) {
                          return matchList;
                        },
                        win: function(matchList) {
                            return matchList.filter(function(aMatch) {
                                    if(aMatch.home_team_name.toLowerCase().indexOf(query) >= 0) {
                                            return aMatch.home_score> aMatch.away_score;

                                    } else if(aMatch.away_team_name.toLowerCase().indexOf(query) >= 0) {
                                            return aMatch.away_score > aMatch.home_score
                                    }
                            })

                        },
                        lose: function(matchList) {
                            return matchList.filter(function(aMatch) {
                                    if(aMatch.home_team_name.toLowerCase().indexOf(query) >= 0) {
                                        return aMatch.home_score < aMatch.away_score;
                                    } else if (aMatch.away_team_name.toLowerCase().indexOf(query) >= 0) {
                                            return aMatch.away_score < aMatch.home_score;
                                    }
                            });

                        },
                        draw: function(matchList) {
                            return matchList.filter(function(aMatch) {
                                if(aMatch.home_team_name.toLowerCase().indexOf(query) >= 0) {
                                    return aMatch.home_score == aMatch.away_score;
                                } else if (aMatch.away_team_name.toLowerCase().indexOf(query) >= 0) {
                                    return aMatch.away_score == aMatch.home_score;
                                }
                            });
                        }
                    };

                    return match[winOrLose](matches);
                }

                return matches;
        }
    })
    .filter("playerNames",["squadLoaderService",function(squadLoader) {
        var squadIndex = [];
        squadLoader.getSquadData().then(function(data) {
            squadIndex = data;
        });

        return function(input) {
            if(typeof squadIndex[input] === "undefined") return "ID "+input;
            return squadIndex[input].playerName;
        };
    }]);