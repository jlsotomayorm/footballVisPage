/**
 * Created by jl on 22/10/15.
 */
angular.module("footballDirectives")
    .directive("fvEventsMatrix", ["$timeout","timeUtils", "colorsTopEvents",function($timeout,timeUtils,colorService) {

            var directive = {
                restrict: "E",
                scope: {
                    matchesSubset:"=",
                    matchEvents: "=",
                    motifsData: "=",
                    isUniqueEnabled: "="
                },
                templateUrl: "js/components/matchesDetail/events-matrixTemplate.html",
                controller: ["$scope","colorsTopEvents","matchesService",eventsMatrixController],
                controllerAs: "vm",
                bindToController: true,
                require: ["fvEventsMatrix","^fvSavePng"],
                link: linkFunction
            };

            return directive;

             //////////////////////////////

            function linkFunction(scope,element,attrs,ctrl) {

                var vm = ctrl[0];
                var savePngController= ctrl[1];


                console.log("Inside matrix directive");

                var eventSizeInPixels = parseInt(attrs.size) || 10;



                var topEvents = vm.topEvents;
                // 0 : others
                var topEventIds = topEvents.map(function(d) { return d.id});


                var rawElement = element[0];


                var mainDiv = rawElement.querySelector("#mainView");

                //In pixels
                var margin = {
                    top: 60,
                    left:18
                };

                var svgSecondsY = margin.top- 10;
                var svgMinutesY = margin.top+7;


                var maxMinute = timeUtils.getMaxMinute();


                var startSecond = 0;
                var secondsPerRow= 60;
                var startMinute = 0;

                var matrixHeight = eventSizeInPixels * maxMinute;

                var limitPitchValues = {
                    min: -2 ,
                    max: 104
                };




                var svg = d3.select(mainDiv)
                    .append("svg")
                    .style("width", "100%")
                    .style("height",matrixHeight+margin.top)
                    .style("margin-left",-margin.left+"px");

                var matrixSvg = svg.append("g")
                                .attr("transform","translate("+margin.left+","+margin.top+")");

                var matrixWidth = parseInt(svg.style("width"),10)- margin.left;


                var secSvg = svg.append("g")
                    .attr("transform","translate("+margin.left+","+svgSecondsY+")");

                var minSvg = svg.append("g")
                    .attr("transform","translate("+ (margin.left-3) + ","+ svgMinutesY+") ");

                // Scales

                var xScale = d3.scale.ordinal()
                    .domain(d3.range(secondsPerRow))
                    .rangeBands([0,matrixWidth]);

                var xSpatialScale = d3.scale.linear()
                    .domain([limitPitchValues.min, limitPitchValues.max])
                    .range([0,matrixWidth]);

                var yScale = d3.scale.ordinal()
                    .domain(d3.range(maxMinute+1))
                    .rangeBands([0,matrixHeight]);

        /*        var color = d3.scale.category20();

                color.domain(topEventIds);*/

                var color = colorService.getColorScale();

                //Matrix bg

                //option #dadaeb
                var bgColor = "#eee";
                matrixSvg.append("rect")
                    .attr("height",matrixHeight)
                    .attr("width",matrixWidth)
                    .attr("fill",bgColor);

                var secondsSample = d3.range(startSecond,startSecond+secondsPerRow);
                var minutesSample = d3.range(startMinute,startMinute+maxMinute);
                var spatialXSample = [ {label: "Defense", value: 15},
                                        {label: "Middle", value: 50},
                                        {label: "Attack", value: 85}];

                secSvg.selectAll(".secText")
                    .data(secondsSample)
                    .enter()
                    .append("text")
                    .attr("class","secText")
                    .attr("x", function(d){ return xScale(d);})
                    .attr("text-anchor","start")
                    .style("font-size",9)
                    .text(function(d){ return d;});

                secSvg.selectAll(".xSpatialText")
                    .data(spatialXSample)
                    .enter()
                    .append("text")
                    .attr("class","xSpatialText")
                    .attr("x", function(d) { return xSpatialScale(d.value)})
                    .attr("text-anchor","start")
                    .style("font-size",12)
                    .style("visibility","hidden")
                    .text(function(d) { return d.label;});

                minSvg.selectAll(".minText")
                    .data(minutesSample)
                    .enter()
                    .append("text")
                    .attr("class","minText")
                    .attr("y",function(d){return yScale(d);})
                    .attr("text-anchor","end")
                    .style("font-size",9)
                    .text(function(d){ return d;});

                //seconds line
                matrixSvg.selectAll(".colLine")
                    .data(secondsSample)
                    .enter()
                    .append("line")
                    .attr("class","colLine")
                    .attr("x1",function(d){return xScale(d);})
                    .attr("y1",0)
                    .attr("x2",function(d){return xScale(d);})
                    .attr("y2",matrixHeight);

                //minutes line
                matrixSvg.selectAll(".rowLine")
                    .data(minutesSample)
                    .enter()
                    .append("line")
                    .attr("class","rowLine")
                    .attr("x1",0)
                    .attr("y1",function(d){return yScale(d);})
                    .attr("x2",matrixWidth)
                    .attr("y2",function(d){return yScale(d);});



                //Legend
                var legendView = rawElement.querySelector("#legend");

                var legendSvg = d3.select(legendView)
                    .append("svg")
                    .style("width", "100%")
                    .style("height","180px");

                var legendRectSize = 10;
                var legendSpacing = 4;

                var legendWidth = parseInt(legendSvg.style("width"),10);

                var legend = legendSvg.selectAll(".legend")
                    .data(topEvents)
                    .enter()
                    .append("g")
                    .attr("class","legend")
                    .attr("transform",function(d,i) {
                        var height = legendRectSize + legendSpacing;

                        var horz = 0.2 * legendWidth ;
                        var vert = i * height ;
                        return 'translate(' + horz + ',' + vert + ')';

                    });

                legend.append('rect')
                    .attr('width', legendRectSize)
                    .attr('height', legendRectSize)
                    .style('fill', function(d) { return color(d.id)});


                legend.append('text')
                    .attr('x', legendRectSize + legendSpacing)
                    .attr('y', legendRectSize )
                    .text(function(d) { return d.name; });


               /* var eventsChart = loadEventHistograms();

                var motifsChart = loadMotifBubbleChart();*/

             /*   var textureSize = 6;
                var lineTexture = textures.lines()
                                    .thicker()
                                    .stroke("#1f9383")
                                    .size(textureSize);
                var vLineTexture = textures.paths()
                                    .d("waves")
                                    .stroke("#1f9383")
                                    .size(textureSize);

                svg.call(lineTexture);
                svg.call(vLineTexture);*/


                vm.matrixPositionFunc = positionEvent;

                scope.$watch("vm.spaceFiltered",function(newEvents) {

                    if(newEvents) {

                        vm.updateCounts();

                       /* eventsChart.data = vm.countPerTeam;
                        eventsChart.draw();

                        motifsChart.data = vm.groupedStats;
                        motifsChart.draw();*/

                        vm.eventsLength = newEvents.length;
                        var grid = matrixSvg.selectAll(".cellGroup")
                            .data(newEvents);

                        grid.exit().remove();



                        var cellGroup = grid.enter().append("g")
                            .attr("class","cellGroup");

                        cellGroup.append("rect")
                            .attr("class","cell")
                            .attr("transform",vm.matrixPositionFunc)
                            .attr("width",xScale.rangeBand())
                            .attr("height",yScale.rangeBand())
                           // .style("fill", function(d) {return d.team_id==1339?"blue":"red";})
                            .style("fill",fillEvent)
                            .on("mouseover",mouseover)
                            .on("mouseout",mouseout);

                        grid.select(".cell")
                        //grid
                            .attr("transform",vm.matrixPositionFunc)
                            .style("fill",fillEvent);


                    }
                });

                scope.$watch("vm.columnAttribute",function(columnAttr) {
                    if(columnAttr=="seconds") {
                        vm.matrixPositionFunc = positionEvent;
                    } else {
                        vm.matrixPositionFunc = positionEventSpatial;
                    }

                    vm.filterSpace(vm.spaceFilterState);
                });



                var filterElement = rawElement.querySelector("[fv-pitch-selection]");
                var pitchSelectionController = angular.element(filterElement).controller("fvPitchSelection");
                pitchSelectionController.setFilterFunction(vm.filterSpace);

                savePngController.setElement(element);



                function mouseover(element) {

                    $timeout(function(){
                        vm.displayTime.period = element.period_id;
                        vm.displayTime.min = element.min;
                        vm.displayTime.sec = element.sec;

                    });

                }

                function mouseout(element) {
                    $timeout(function(){
                        vm.displayTime.period = 0;
                        vm.displayTime.min = 0;
                        vm.displayTime.sec = 0;
                    });
                }

                function positionEvent(d,i) {
                    var convertedMins = timeUtils.convertMinutes(d);
                    return "translate("+ xScale(d.sec)+ ","+ yScale(convertedMins)+")";
                }

                function positionEventSpatial(d,i) {
                    var convertedMins = timeUtils.convertMinutes(d);
                    return "translate(" + xSpatialScale(d.x) + "," + yScale(convertedMins) +")";
                }



                function fillEvent(d) {
                    return topEventIds.indexOf(d.type_id)>-1?color(d.type_id):color(0);
                  /*  var url = null;
                    if(d.y>80) {
                        url = lineTexture.url();
                    } else if (d.y<20) {
                        url = vLineTexture.url();
                    }

                    if(!url)
                        return topEventIds.indexOf(d.type_id)>-1?color(d.type_id):color(0);
                    else
                        return url;*/
                }

                function loadEventHistograms() {
                    var data = [];


                    var histMargin = 50;
                    var histWidth = 600;
                    var histHeight = 600;

                    var histogramSVG = dimple.newSvg("#eventHistograms",histWidth,histHeight);

                    var myChart = new dimple.chart(histogramSVG, data);
                    myChart.setMargins(histMargin,histMargin,histMargin,histMargin);
                    var x = myChart.addCategoryAxis("x", ["event_id","team_id"]);
                    x.showGridlines = true;

                    x.addOrderRule("frequency",true);
                    var y = myChart.addMeasureAxis("y", "frequency");
                    var s = myChart.addSeries("team_id", dimple.plot.bar);

                    myChart.setBounds(50,50,"80%","80%");


                    s.lineWeight = 4;
                    s.lineMarkers = true;
                    //s.aggregate = dimple.aggregateMethod.count;

                    myChart.draw();

                    return myChart;
                }

                function loadMotifBubbleChart() {


                    var data = [];

                    var container = d3.select("#motifVsPossessionChart");
                    var histWidth = container.style("width");
                    var histMargin = 50;
                    var histHeight = 820;

                    var histogramSVG = dimple.newSvg("#motifVsPossessionChart",histWidth,histHeight);

                    var myChart = new dimple.chart(histogramSVG, data);
                    myChart.setMargins(histMargin,histMargin,histMargin,histMargin);

                    var x = myChart.addCategoryAxis("x", "rival_name");
                    var y = myChart.addMeasureAxis("y", "Motifs_frequency");
                    var z = myChart.addMeasureAxis("z", "Possession_loss");
                    var s = myChart.addSeries("team_id", dimple.plot.bubble);

                    x.title = "Matches";
                    x.fontSize = "auto";
                    x.addOrderRule("Possession_loss",true);

                    y.title = "Motifs Frequency";
                    y.fontSize = "auto";

                    //myChart.setBounds(80,50,"80%","60%");
                    myChart.setMargins(80,50,50,"30%");



                    s.lineWeight = 4;
                    s.lineMarkers = true;
                    //s.aggregate = dimple.aggregateMethod.count;

                    myChart.draw();

                    return myChart;

                }


            }

        }
    ]);


function eventsMatrixController($scope,colorService,matchesService) {

    var vm = this;
    vm.data = [];
    vm.allEvents = [];
    vm.teamFiltered = [];
    vm.eventFiltered = [];
    vm.spaceFiltered = [];
    vm.teams = [];
    vm.displayTime = {min: 0, sec:0, period:0};
    vm.spaceFilterState = {
        point:{x:-2,y:-2},
        width: 104,
        height: 104
    };
    vm.isGroupByMatchEnabled = false;
    vm.countPerTeam = [];
    vm.groupedStats = [];
    vm.columnAttribute = "seconds";

    var eventInfo = colorService.getInfo();
    var teamsNameMap = matchesService.getTeamsNameMap();


    vm.topEvents = eventInfo.map(function(eventObj) {
        return angular.extend(eventObj,{checked: false});
    });

    vm.topEvents[10].checked = true;
    vm.topEvents[11].checked = true;


    vm.filterTeam = filterTeam;
    vm.filterEvent = filterEvent;
    vm.filterSpace = filterSpace;
    vm.filterHelper = filterTeamMatchHelper;
    vm.updateCounts = updateCounts;
    vm.groupByMatchChanged = groupByMatchChanged;
    vm.columnAttributeChanged = columnAttributeChanged;

    populateTeams();

    vm.selectedTeam = vm.teams[0];

    var matchesIds = vm.matchesSubset.map(function (e) {
        return parseInt(e.id);
    });





    $scope.$watch("vm.matchEvents",function(newMatchEventsList) {
        if(newMatchEventsList) {

                newMatchEventsList.forEach(function(matchEvents) {
                    Object.keys(matchEvents).forEach(function(matchId) {
                        vm.allEvents = vm.allEvents.concat(matchEvents[matchId]);
                    });
                });

            createTurnoverEvent(vm.allEvents);
            var possessionLossList = getPossessionLossEvent(vm.allEvents);
            vm.allEvents = vm.allEvents.concat(possessionLossList);
            vm.data = vm.data.concat(vm.allEvents);

            filterTeam(vm.teams[0].id);
        }
    });


    $scope.$watchCollection("vm.motifsData",function(motifsData) {
        if(motifsData) {
            console.log(motifsData);

            var passes = getPassesListFromMotifs(motifsData);
            vm.data = vm.allEvents.concat(passes);

            filterTeam(vm.selectedTeam.id);

        }
    });

    $scope.$watch("vm.isUniqueEnabled",function(isUniqueEnabled) {
        if(isUniqueEnabled) {
            vm.filterHelper = filterTeamHelper;
        } else {
            vm.filterHelper = filterTeamMatchHelper;
        }

        filterTeam(vm.selectedTeam.id);
    });



    ///////////////

    function groupByMatchChanged() {
        if(vm.isGroupByMatchEnabled) {
            vm.filterHelper = filterMatchHelper;
        } else {
            vm.filterHelper = filterTeamMatchHelper;
        }

        filterTeam(vm.selectedTeam.id);

    }

    function getPossessionLossEvent(allEvents) {
        var possessionLossId = 402;
        var ballRecoveryEvent = _.find(eventInfo,{name:"Ball Recovery"});

        var matchTeamNames = allEvents.map(function(eventObj) {
            return {match_id: eventObj.match_id, team_id: eventObj.team_id};
        });

        var perMatch = _.groupBy(matchTeamNames,"match_id");
        var teamsIdDict = _.mapValues(perMatch,function(events) {
            var teamIds = events.map(function(e){ return e.team_id;})
            return _.uniq(teamIds);
        });

        var eventList = allEvents.filter(function(eventObj) {
            return eventObj.type_id == ballRecoveryEvent.id;
        });

        var possessionLossList = eventList.map(function(eventObj) {
                var newTeamId = getRivalTeamId(eventObj.match_id,eventObj.team_id,teamsIdDict);
                return angular.extend({},eventObj,{type_id:possessionLossId,team_id:newTeamId})
        });

        return possessionLossList;

        function getRivalTeamId(matchId,teamId,teamsIdDict) {
            if (teamsIdDict[matchId][0]==teamId)
                return teamsIdDict[matchId][1];

            return teamsIdDict[matchId][0];
        }

    }



    function createTurnoverEvent(allEvents) {

        var ballTouchEvent = _.find(eventInfo,{name:"Ball Touch"});
        var takeOnEvent = _.find(eventInfo, {name: "Take On"});

        allEvents.forEach(function(eventObj) {
                if( (eventObj.type_id == takeOnEvent.id && eventObj.hasOwnProperty("X211"))
                    || (eventObj.type_id == ballTouchEvent.id && eventObj.outcome == "0")) {
                    eventObj.type_id = 401;
                }
        });
    }

    function getPassesListFromMotifs(motifsData) {

        var motifsCopy = angular.copy(motifsData);
        var extendedPasses = motifsCopy.map(function(motifObj) {
            motifObj.motifs.forEach(function(aPass) {
                aPass.motifData = {};
                aPass.type_id = 400;
                aPass.motifData.cluster = motifObj.cluster;
                aPass.motifData.spatial = motifObj.spatial;
            });

            return motifObj.motifs;
        });

        var passesList = extendedPasses.reduce(function(flat,toFlatten) {
                return flat.concat(toFlatten);
        },[]);

        return passesList;

    }

    function filterTeamMatchHelper(d){
        return d.team_id==vm.selectedTeam.id && d.match_id==vm.selectedTeam.match_id;
    }

    function filterTeamHelper(d) {
        return d.team_id == vm.selectedTeam.id;
    }

    function filterMatchHelper(d) {
        return d.match_id == vm.selectedTeam.match_id;
    }

    function filterTeam() {

        vm.teamFiltered = vm.data.filter(vm.filterHelper);

        filterEvent();

    }

    function isOtherEvent(eventId) {
        return !vm.topEvents.some(function(val){
                    return val.id == eventId;
        })

    }

    function filterEvent() {
        vm.eventFiltered = vm.teamFiltered.filter(function(d) {
                return vm.topEvents.some(function(val){

                    return d.type_id==val.id && val.checked ||
                            isOtherEvent(d.type_id) &&  val.id==0 && val.checked;
                });
        });

        filterSpace(vm.spaceFilterState);
    }

    function populateTeams() {
        vm.matchesSubset.forEach(function(match,i) {
            vm.teams.push({id: match.home_team_id, name: match.home_team_name, match_id: match.id});
            vm.teams.push({id: match.away_team_id, name: match.away_team_name, match_id: match.id});

        });
    }


    function updateCounts() {
        updateCountPerTeam();
        updateStatsPerGroupedTeam();

        console.log("test");
    }

    function updateStatsPerGroupedTeam() {

        vm.groupedStats = [];
        if (vm.isUniqueEnabled) {
             var perMatch = _.groupBy(vm.spaceFiltered,"match_id");
             var countPerMatch = _.mapValues(perMatch,function(events) {
                return _.countBy(events,"type_id");
             });

             var matchesObj = _.mapValues(countPerMatch, function(matchObj,matchId) {
                    matchObj["Possession_loss"] = matchObj["402"];
                 if(matchObj.hasOwnProperty("400"))
                        matchObj["Motifs_frequency"] = matchObj["400"]/4;
                 else
                        matchObj["Motifs_frequency"] = 0;
                    matchObj["rival_name"] = formatRivalName(getRivalId(matchId,vm.selectedTeam.id));
                  return angular.extend({},matchObj,{match_id:matchId});
             });

            vm.groupedStats = Object.keys(matchesObj).reduce(function(arr,matchId) {
                    return arr.concat(matchesObj[matchId]);
            },[]);

        }
    }


    function getRivalId(matchId,teamId) {
        var matchObj = _.find(vm.matchesSubset,{id:matchId});
        return matchObj.away_team_id==teamId? matchObj.home_team_id: matchObj.away_team_id;
    }

    function formatRivalName(rivalId) {
        return "vs " + teamsNameMap[rivalId];
    }

    function updateCountPerTeam() {
        var perTeam = _.groupBy(vm.spaceFiltered,"team_id");
        var countPerTeam = _.mapValues(perTeam,function(events) {
            return _.countBy(events,"type_id");
        });

        var teamsObj = _.mapValues(countPerTeam,function(teamObj,teamId){
            var mapped =  _.mapValues(teamObj,function(freq,eventId){
                if(eventId==400) freq /= 4;
                return {event_id: eventId, frequency: freq,team_id: teamId};
            });
            return _.values(mapped);
        });

        vm.countPerTeam = Object.keys(teamsObj).reduce(function(arr,teamId){
            return arr.concat(teamsObj[teamId]);
        },[]);
    }

    function columnAttributeChanged() {

        if(vm.columnAttribute=="seconds") {
            d3.selectAll(".xSpatialText")
                .style("visibility","hidden");

            d3.selectAll(".secText")
                .style("visibility","visible");
        } else {
            d3.selectAll(".xSpatialText")
                .style("visibility","visible");

            d3.selectAll(".secText")
                .style("visibility","hidden");
        }


    }
    function filterSpace(spaceState) {

        setSpaceDimensions(spaceState);

        var px = spaceState.point.x;
        var py = spaceState.point.y;
        var width = spaceState.width;
        var height = spaceState.height;

        vm.spaceFiltered = vm.eventFiltered.filter(function(d) {
            return d.x>=px &&
                d.y>= py &&
                d.x<= px+width &&
                d.y <= py+height;

        });

    }

    function setSpaceDimensions(spaceState) {
        vm.spaceFilterState.point.x = spaceState.point.x;
        vm.spaceFilterState.point.y = spaceState.point.y;
        vm.spaceFilterState.width = spaceState.width;
        vm.spaceFilterState.height = spaceState.height;

    }


}
