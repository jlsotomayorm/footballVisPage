/**
 * Created by jl on 22/10/15.
 */
/**
 * Created by jl on 25/08/15.
 */
angular.module('footballDirectives')
    .directive('fvArrowMotifs', ["$timeout","timeUtils", function($timeout,timeUtils) {

        var directive = {
            restrict: 'E',
            scope:{
                matchesSubset: "=",
                motifsData: "=",
                matchEvents: "=",
                filteredData: "=",
                freqCount: "=",
                isUniqueEnabled: "="
            },
            require: ["fvArrowMotifs","fvPitch"],
            controller: arrowMotifsController,
            controllerAs: "motifsVm",
            bindToController: true,
            templateUrl: "js/components/matchesDetail/pitchTemplate.html",
            link: linkFunction
        };
        return directive;

        /////////////////////////////

        function linkFunction(scope, element,attrs,ctrl) {

            var vm = ctrl[0];
            var pitchController = ctrl[1];



            var dims = pitchController.getDimensions();

            console.log("Inside pitch directive");

            var margin = parseInt(attrs.margin) || 20,
                timeLineHeight = parseInt(attrs.timeLineHeight) || 20;




            //Colors
            var motifColors = d3.scale.ordinal();
            // red , blue, yellow, purple, orange
            //motifColors.range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"]);
            motifColors.range(['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e']);

            var clusterColors = d3.scale.ordinal();
            clusterColors.domain([1,2,3,4,5,6,7,8]);
            //clusterColors.range(['#7fc97f','#beaed4','#fdc086','#ffff99','#386cb0','#f0027f','#bf5b17','#666666']);
            clusterColors.range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00']);






            var line = d3.svg.line()
                .interpolate("linear")
                .x(function(d) { return xScale(d.x); })
                .y(function(d) { return yScale(d.y); });



            var pitchElement = d3.select(pitchController.getRawElement());
            var pitchSvg = pitchElement.select(".pitchSvg");




            var xScale = d3.scale.linear()
                .domain([0,100])
                .range([dims.padding,dims.width-dims.padding]);

            var yScale = d3.scale.linear()
                .domain([0,100])
                .range([dims.height-dims.padding,dims.padding]);


            //Mini

            var rawElement = element[0];
            var timeLineDiv = rawElement.querySelector("#timeLine");

            var timeLineSvg = d3.select(timeLineDiv)
                .append("svg")
                .style("width","100%")
                .style("height",timeLineHeight);

            var timeLineWidth = parseInt(timeLineSvg.style("width"),10);


            var maxMinute = timeUtils.getMaxMinute();

            var timeLineXScale = d3.scale.linear()
                .domain([0,maxMinute])
                .range([0,timeLineWidth]);

            var topPadding = 25;

            var timeLineYScale = d3.scale.linear()
                .domain([0,100])
                .range([timeLineHeight,topPadding]);

            var timeAxis = d3.svg.axis()
                .scale(timeLineXScale)
                .ticks(20)
                .orient("top");

           var goalsIcon =  timeLineSvg.append("g")
                .attr("class","goalGroup");



            timeLineSvg.append("g")
                .attr("transform","translate(0.5,"+topPadding+")")
                .attr("class","x axis")
                .call(timeAxis);

            var miniLine = d3.svg.line()
                .interpolate("linear")
                .x(function(d) {

                    var mins = timeUtils.convertMinutes(d);
                    var x = timeLineXScale(mins + parseInt(d.sec)/60);
                    return x;
                })
                .y(function(d){ return timeLineYScale(d.y);});

            var miniGroup = timeLineSvg
                .append("g")
                .attr("class","linesGroup")
                .attr("fill","none");

            var passesGroup = pitchSvg.append("g")
                .attr("stroke-width",1.5)
                .attr("fill","none");

            var brush = d3.svg.brush()
                .x(timeLineXScale);


            //Using dimple
            var playerChart = loadPlayerHistograms();

            var segmentsColor = ["#e41a1c","#377eb8","#4daf4a"];


            var corinthiansPlayers = ["Edilson","Jadson","Renato Augusto"];
            var mineiroPlayers = ["Leandro Donizete","Rafael Carioca", "Luan"];
            var gremioPlayers = ["Rafael Galhardo","Walace","Giuliano"];
            vm.topPlayers = corinthiansPlayers;
            var playerScale = d3.scale.ordinal()
                .domain(vm.topPlayers)
                .range(['#4daf4a','#377eb8','#e41a1c']);


            var symbolMap ={
                "A": "circle",
                "B": "cross",
                "C": "square",
                "D": "triangle-up"
            };




           // scope.$watch("motifsVm.motif");


            scope.$watch("motifsVm.isSelectionEnabled",function(newSelection){

                if(!angular.isUndefined(newSelection)){

                    if(newSelection) {
                        var minuteSelection = 1;
                        brush.extent([0,minuteSelection]);
                    }
                    else{
                        brush.clear();
                    }

                    miniGroup.select(".brush").call(brush);

                }

            });

            scope.$watch("motifsVm.isTransparencyEnabled",function(newState){
                if(newState) {
                    passesGroup.selectAll(".lsegment")
                        .style("opacity",0.2);
                } else {
                    passesGroup.selectAll(".lsegment")
                        .style("opacity",1);
                }
            });

            scope.$watch("motifsVm.lineSelectedAttribute",function(newAttribute){

                var mainMotifs = passesGroup.selectAll(".motifGroup");

                passesGroup.selectAll(".lsegment")
                    .style("stroke",null);

                mainMotifs
                    .style("stroke",colorLinesGroup)
                    .each(changeArrowColor);

                function changeArrowColor(motifObj) {

                    d3.select(this).selectAll(".lsegment")
                        .style("stroke",function(d,i){ return colorLines(d,i,motifObj)});
                    d3.select(this).selectAll(".lsegmentLast")
                        .style("marker-end",function(d){
                            return colorMarkerEnd(d, motifObj.cluster);
                        })
                }

            });

            scope.$watch("motifsVm.selectedPlayerName", function(newName) {
                vm.filterPlayer(vm.selectedPlayerName);

            });

            scope.$watch("motifsVm.playerSelectedAttribute", function(newAttribute) {


                    if(newAttribute.id=="motifPos") {
                        vm.selectedPlayerName = "none";
                        d3.selectAll(".dimple-bar").style("stroke-width","1px");


                    }

                    updatePlayerColors();

            });

            //Assuming motifNames is already loaded
            scope.$watch("motifsVm.clusterIds",function(newClusterIds){

                createArrowHead(vm.motifNames,vm.lineColorAttributes[0].id,motifColors);
                createArrowHead(newClusterIds,vm.lineColorAttributes[1].id,clusterColors);
                createArrowHead(["segment"],vm.lineColorAttributes[5].id,function(d){return "#4daf4a";});


                function createArrowHead(categoryVector,id,colorScale){
                    categoryVector.forEach(function(categoryElement) {
                        pitchSvg.append("defs")
                            .append("marker")
                            .attr("id","arrow_"+id+"_"+categoryElement)
                            .attr("refX",2)
                            .attr("refY", 6)
                            .attr("markerWidth", 13)
                            .attr("markerHeight", 13)
                            .attr("orient", "auto")
                            .append("svg:path")
                            .attr("d", "M1,3 L2,9 L5,5 L1,3")
                            .attr("fill",colorScale(categoryElement));

                    });

                }

            });


            scope.$watch("motifsVm.filteredData",function(newMotifs) {

                if(newMotifs) {

                    motifColors.domain(vm.motifNames);

                    pitchSvg.selectAll(".motifGroup").remove();
                    timeLineSvg.selectAll(".miniLine").remove();
                    timeLineSvg.selectAll(".brush").remove();

                    //var motifsXY = formatMotifData(newMotifs);
                    var motifsXY = newMotifs;

                    vm.motifsLength = motifsXY.length;



                //    var goals = goalsIcon.selectAll("circle")
                    var goals = goalsIcon.selectAll("image")
                        .data(vm.filteredGoals);

                    goals.exit().remove();

                    var iconSize = 10;
                    goals.enter()
                        .append("image")
                        .attr("width",iconSize)
                        .attr("height",iconSize)
                        .attr("xlink:href","ball_icon.png")
                        .attr("y",5)
                       /* .append("circle")
                        .attr("r",3)
                        .attr("cy",5);*/


                    goals.attr("x",function(d){return timeLineXScale(timeUtils.convertMinutes(d)+ (d.sec/60))  - iconSize/2;});
                    //goals.attr("cx",function(d){return timeLineXScale(timeUtils.convertMinutes(d))});


                    //Timeline


                    miniGroup.selectAll(".miniLine")
                        .data(motifsXY)
                        .enter().append("path")
                        .attr("class","miniLine")
                        .style("stroke","black")
                        .attr("d",function(d){ return miniLine(d.motifs)});


                    //brush

                   /* var brush = d3.svg.brush()
                        .x(timeLineXScale)*/
                    brush.on("brush",filterByTime);

                    if(vm.minTimeExtent!==undefined && vm.maxTimeExtent!==undefined)
                        brush.extent([vm.minTimeExtent,vm.maxTimeExtent]);

                    miniGroup.append("g")
                        .attr("class","brush")
                        .call(brush)
                        .selectAll("rect")
                        .attr("height",timeLineHeight);

                    filterByTime();




                    function filterByTime() {



                        vm.minTimeExtent = brush.extent()[0];
                        vm.maxTimeExtent = brush.extent()[1];


                        var filterMotifs = motifsXY;

                        if(!brush.empty()) {
                            filterMotifs  = filterMotifsWithBrush(motifsXY,vm.minTimeExtent,vm.maxTimeExtent);
                        }



                        //update binding --- angular thing
                        $timeout(function(){
                            vm.motifsLength = filterMotifs.length;
                        });


                        var motifsPlayers = filterMotifs.map(function(aMotif) {
                            return aMotif.motifs;
                        });

                        //Flat array
                        var playerData = [].concat.apply([],motifsPlayers);


                        playerChart.data = playerData;
                        playerChart.draw();

                        playerChart.svg.selectAll(".dimple-bar").style("fill",function(d){
                            return vm.topPlayers.indexOf(d.x)!=-1? playerScale(d.x):"#EFEFEF";
                        });
                        playerChart.svg.selectAll(".dimple-bar").style("stroke","black");


                        var mainMotifs = passesGroup.selectAll(".motifGroup")
                            .data(filterMotifs);

                        /*mainMotifs
                            .attr("class", function(d){return "motifGroup c_"+ d.cluster})
                            .style("marker-end",colorMarkerEnd)
                            .style("stroke",colorLines)
                            .attr("d",function(d){ return line(d.motifs);})
                            .on("mouseover",mouseOverAction);



                        mainMotifs.enter()
                            .append("path")
                            .attr("class", function(d) { return "motifGroup c_"+ d.cluster})
                            .style("marker-end",colorMarkerEnd)
                            .style("stroke",colorLines)
                            .attr("d", function(d){ return line(d.motifs);})
                            .on("mouseover",mouseOverAction)
                            .on("mouseout",mouseOutAction);*/


                        mainMotifs
                            .attr("class",function(d) { return "motifGroup c_"+ d.cluster})
                            .style("stroke",colorLinesGroup)
                            .on("mouseover",mouseOverAction)
                            .each(drawLines);

                        mainMotifs.enter()
                            .append("g")
                            .attr("class",function(d) { return "motifGroup c_"+ d.cluster})
                            .style("stroke",colorLinesGroup)
                            .on("mouseover",mouseOverAction)
                            .on("mouseout",mouseOutAction)
                            .each(drawLines);


                        mainMotifs.exit().remove();




                       // highlightClusters(vm.selectedCluster.id);

                    }


                }
            },true);

            function drawLines(motifObj) {
                var nplayers = motifObj.motifs.length;
                var lsegment = d3.select(this).selectAll(".lsegment")
                                .data(motifObj.motifs.slice(0,nplayers-1));

                lsegment
                    .attr("x1",function(d) { return xScale(d.x);})
                    .attr("y1",function(d) { return yScale(d.y);})
                    .attr("x2",function(d,i) { return xScale(motifObj.motifs[i+1].x);})
                    .attr("y2",function(d,i) { return yScale(motifObj.motifs[i+1].y);})
                    .style("marker-end",function(d,i){ return isLastSegment(i)? colorMarkerEnd(d,motifObj.cluster):null;}) // Only last segment should have an arrow head
                    .style("stroke-width","2px")//4px
                    .style("stroke",function(d,i){ return colorLines(d,i,motifObj);})
                    .style("opacity",function(d){ return vm.isTransparencyEnabled? 0.2: 1;});



                lsegment.enter()
                    .append("line")
                    .attr("class",function(d,i){ return isLastSegment(i)? "lsegment lsegmentLast": "lsegment"})
                    .attr("x1",function(d) { return xScale(d.x);})
                    .attr("y1",function(d) { return yScale(d.y);})
                    .attr("x2",function(d,i) { return xScale(motifObj.motifs[i+1].x);})
                    .attr("y2",function(d,i) { return yScale(motifObj.motifs[i+1].y);})
                    .style("marker-end",function(d,i){ return isLastSegment(i)? colorMarkerEnd(d,motifObj.cluster):null;}) // Only last segment should have an arrow head
                    .style("stroke-width","2px")
                    .style("stroke",function(d,i){ return colorLines(d,i,motifObj);})
                    .style("opacity",function(d){ return vm.isTransparencyEnabled? 0.2: 1;});

                lsegment.exit().remove();

                drawPoints(this,motifObj);

                function isLastSegment(idx) {
                        return idx==nplayers-2;
                }

            }


            function drawPoints(element, motifObj) {
                var lpoints = d3.select(element).selectAll(".lpoint")
                    .data(motifObj.motifs);


                var symbol = d3.svg.symbol()
                    .type(function(d,i) {
                        return symbolMap[d.structure[d.pass_id]];
                    })
                    .size(50);


                lpoints
                    .attr("transform",function(d,i){ return "translate("+xScale(d.x) +","+ yScale(d.y)+")";})
                    .attr("stroke",function(d,i) {return strokeColorPlayers(d);})
                    .attr("fill",function(d,i) {return colorPlayers(d);})
                    .attr("d",symbol);

                lpoints.enter()
                    .append("path")
                    .attr("class","lpoint")
                    .attr("d",symbol)
                    .attr("stroke",function(d,i) {return strokeColorPlayers(d);})
                    .attr("stroke-width","0.8")
                    .attr("transform",function(d,i){ return "translate("+xScale(d.x) +","+ yScale(d.y)+")";})
                    .attr("fill",function(d,i) { return colorPlayers(d);});

                lpoints.exit().remove();


            }

            function updatePlayerColors() {

                var playerPositions = passesGroup.selectAll(".lpoint");

                playerPositions
                    .attr("fill",function(d,i) {return colorPlayers(d);})
                    .attr("stroke",function(d,i) {return strokeColorPlayers(d);});
            }

            function formatMotifData(newMotifs) {
                var motifsXY = [];

                newMotifs.forEach(function(value,index) {
                    for(var i=0;i<value.m.length;i++)
                    {
                        motifsXY.push({motifs:value.m[i].motifs,cluster:value.m[i].clusters});

                    }

                });

                return motifsXY;
            }

            function filterMotifsWithBrush(motifsXY,minExtend,maxExtend) {
                return motifsXY.filter(function(d) {
                    var motif = d.motifs;
                    var firstSeqMin = timeUtils.convertMinutes(motif[0])+ motif[0].sec/60;
                    var lastSeqMin = timeUtils.convertMinutes(motif[motif.length-1]) + motif[motif.length-1].sec/60;

                    return minExtend <= firstSeqMin &&
                        lastSeqMin <=  maxExtend;
                });
            }


            function colorMarkerEnd(d,cluster) {
                var markerId ="url(#arrow_"+vm.lineSelectedAttribute.id+"_";
                var attribute = d.structure;

                if(vm.lineSelectedAttribute.id=="cluster")
                    attribute = cluster;
                else if ( vm.lineSelectedAttribute.id=="segment")
                    attribute = "segment";

                return markerId+ attribute+")";

            }

            function colorByBoundingBox(d) {

                var xPos= d.motifs.map(function(d){return d.x;});
                var yPos = d.motifs.map(function(d){return d.y;});

                var xMin = Math.min.apply(Math,xPos);
                var yMin = Math.min.apply(Math,yPos);

                var xMax = Math.max.apply(Math,xPos);
                var yMax = Math.max.apply(Math,yPos);

                var width = xMax-xMin;
                var height = yMax-yMin;

                return (width>height)? "red" : "black";

            }




            function colorPlayers(aMotif) {
                var coloring =  {
                    "motifPos": function(d) {

                        return d.pass_id==0?"white":segmentsColor[d.pass_id-1];
                    },
                    "player": function(d) {

                        return d.player_name==vm.selectedPlayerName? ( d.pass_id==0?"white":segmentsColor[d.pass_id-1] ): null;
                    }
                };

                return coloring[vm.playerSelectedAttribute.id](aMotif);
            }


            function strokeColorPlayers(aMotif) {
                var coloring =  {
                    "motifPos": function(d) {
                        return "black";
                    },
                    "player": function(d) {
                        return d.player_name==vm.selectedPlayerName?"black": null;
                    }
                };

                return coloring[vm.playerSelectedAttribute.id](aMotif);
            }


            function colorLines(aMotif,idx,motifObj) {


                var upPassColor = "#7570b3";
                var downPassColor = "#d95f02";

                var rightPassColor = "#b2df8a";
                var leftPassColor = "#1f78b4";




                var coloring = {
                    "motif": function(d){
                        return null;
                    },
                    "cluster": function(d) {
                        return null;
                    },
                    "bounding_box": function(d) {
                        return null;

                    },
                    "orientation_vertical": function(aMotif) {
                        return aMotif.y < motifObj.motifs[idx+1].y? upPassColor: downPassColor;
                    },
                    "orientation_horizontal": function(aMotif) {
                        return aMotif.x < motifObj.motifs[idx+1].x? rightPassColor: leftPassColor;
                    },
                    "segment": function(aMotif) {
                        return segmentsColor[aMotif.pass_id];
                    }

                };





                return coloring[vm.lineSelectedAttribute.id](aMotif);
            }

            function colorLinesGroup(motifObj) {


                var coloring = {
                    "motif": function(d){
                        return motifColors(d.motifs[0].structure);
                    },
                    "cluster": function(d) {
                        return clusterColors(d.cluster);
                    },
                    "bounding_box": function(d) {
                        return colorByBoundingBox(d);

                    },
                    "orientation_vertical": function(d) {
                        return null;
                    },
                    "orientation_horizontal": function(d) {
                        return null;
                    },
                    "segment": function(d) {
                        return null;
                    }

                };
                return coloring[vm.lineSelectedAttribute.id](motifObj);
            }

            function mouseOverAction(data){
                var motifsArray = data.motifs;

                $timeout(function() {
                    vm.motifPlayers = motifsArray.map(function (d) {
                        return d.player_id
                    });
                });

            }

            function mouseOutAction(data){

                $timeout(function() {
                    vm.motifPlayers =[];
                });
            }


            function highlightClusters(selectedCluster) {
                var classCluster = ".c_"+selectedCluster;
                pitchSvg.selectAll(".motifGroup")
                    .style("opacity",0)
                    .attr("stroke-width",1.5);
                if(selectedCluster != 0) {
                    pitchSvg.selectAll(classCluster)
                        .style("opacity",1)
                        .attr("stroke-width",3);
                } else {
                    pitchSvg.selectAll(".motifGroup")
                        .style("opacity",1)
                        .attr("stroke-width",1.5);
                }

            }


            function loadPlayerHistograms() {

                var data = [];



                var histMargin = 50;
                var histWidth = 500;
                var histHeight = 500;

                var histogramSVG = dimple.newSvg("#playerHistograms",histWidth,histHeight);

              /*  histogramSVG.append("rect")
                    .attr("x",histWidth*0.1)
                    .attr("y",histHeight*0.1)
                    .attr("width", histWidth * 0.8)
                    .attr("height", histHeight * 0.5)
                    .style("fill", "#e5e5e5");*/

                var myChart = new dimple.chart(histogramSVG, data);
                myChart.setMargins(histMargin,histMargin,histMargin,histMargin);
                var x = myChart.addCategoryAxis("x", "player_name");
                x.title= "Players";
                x.showGridlines = false;

                x.addOrderRule("count",true);
                var y = myChart.addMeasureAxis("y", "count");
                y.title= "Frequency";
               // y.overrideMax = 45;
                y.showGridlines = false;
                var s = myChart.addSeries(null, dimple.plot.bar);

                myChart.setBounds(50,50,"80%","50%");

                s.addEventHandler("click",function(e) {
                    $timeout(function() {
                        if(vm.playerSelectedAttribute.id=="player") {
                            vm.selectedPlayerName = e.xValue;
                        }
                        myChart.svg.selectAll(".dimple-bar").style("stroke-width","1px");
                        myChart.svg.selectAll(".dimple-bar").filter(function(d) {
                            return d.x== e.xValue;
                        }).style("stroke-width","5px");
                        updatePlayerColors();
                    });
                });
                s.lineWeight = 4;
                s.lineMarkers = true;
                s.aggregate = dimple.aggregateMethod.count;

                myChart.draw();





                return myChart;
            }


        }



    }]);

arrowMotifsController.$inject = ["$scope","motifsLoaderService","eventsLoaderService","$filter"];

function arrowMotifsController($scope,motifsLoader,eventsLoader,$filter) {
    var vm = this;


    vm.teams = [{id:0,name:"All"}];
    vm.motifs = [{id:0,name:"All"},{id:1,name:"All -ABCD"}];
    vm.clusters = [{id:0, name:"----"}];
    vm.areas = [
        {id:"none",name:"All"},
        {id:"defense",name:"Defense"},
        {id:"middle",name:"Middle"},
        {id:"attack",name:"Attack"}
    ];
    vm.segments = [
        {id: "first", name:"1st", checked: true},
        {id: "second", name:"2nd", checked: true},
        {id: "third", name:"3rd", checked: true}
    ];

    vm.selectedTeam = vm.teams[0];
    vm.selectedMotif = vm.motifs[0];
    vm.selectedCluster = vm.clusters[0];
    vm.selectedArea = vm.areas[0];
    vm.motifNames = [];
    vm.clusterIds = [];
    vm.filterTeam = filterTeam;
    vm.filterMotif = filterMotif;
    vm.filterCluster = filterCluster;
    vm.filterArea = filterArea;
    vm.filterSegment = filterSegment;
    vm.filterPlayer = filterPlayer;
    vm.uniqueTeamsChanged = uniqueTeamsChanged;
    vm.filterHelper = filterTeamMatchHelper;
    vm.lineColorAttributes = [
        {name:"By Motif",id:"motif"},
        {name:"By Cluster",id:"cluster"},
        {name: "By Bounding Box", id: "bounding_box"},
        {name:"By Vertical Orientation",id:"orientation_vertical"},
        {name:"By Horizontal Orientation",id:"orientation_horizontal"},
        {name: "By Segment",id:"segment"}
    ];
    vm.playerColorAttributes = [
        {name:"By Motif Position", id:"motifPos"},
        {name:"By Player", id:"player"}
    ];
    vm.lineSelectedAttribute = vm.lineColorAttributes[5];
    vm.playerSelectedAttribute = vm.playerColorAttributes[0];
    vm.goalData = [];
    vm.filteredGoals = [];


    vm.goalEventId = 16;
    vm.ownGoalProperty = "X28";

    vm.selectedPlayerName = "none";



    populateAllTeams();


    var matchesIds = vm.matchesSubset.map(function (e) {
        return parseInt(e.id);
    });

    $scope.$watchCollection("motifsVm.motifsData",function(rawData) {

        if( rawData && rawData.length>0) {
            var data = rawData;
            var motifLength = data[0].m[0].motifs.length;
            vm.motifNames = motifsLoader.getMotifsNames(motifLength);

            //inserting count property -- for player histogram -- dimple js
            data.forEach(function(group,i,arr) {
                arr[i].m.forEach(function(m,i2,arr2){
                    arr2[i2].motifs.forEach( function (motif,i3,arr3) {
                        arr3[i3].count=1;
                        arr3[i3].pass_id=i3;
                    });
                });
            });

            var allClusters = data.map(function(group){
                return group.m.map(function(d){return d.clusters;});
            });

            //Computes the number of clusters. Assumes it goes from 1 to ... C.
            var maxCluster = allClusters.reduce(function(prev,curr){
                var innerMax = curr.reduce(function(p,c){ return p>c?p:c;})
                return (prev>innerMax)?prev:innerMax;
            },0);
            vm.clusterIds = Array.apply(0,Array(maxCluster)).map(function(d,i) {
                return i +1;
            })

            //var clusterNames = vm.clusterIds.map(function(d){ return {id:d,name:d};});
            var clusterNames = [ {id:6,name:1},
                                {id:3,name:2},
                                {id:1,name:3},
                                {id:2,name:4},
                                {id:7,name:5},
                                {id:4,name:6},
                                {id:5,name:7},
                                {id:8,name:8}];
            vm.clusters = vm.clusters.concat(clusterNames);
            //vm.selectedCluster = vm.clusters[3];

            var startingIndex = vm.motifs.length;
            vm.motifNames.forEach(function(ele,i) {
                vm.motifs.push({id:startingIndex+i,name:ele});
            });

            vm.motifNamesForSquares = angular.copy(vm.motifNames);
            vm.motifNamesForSquares.pop();

            var groupsRemoved = [];
            data.forEach(function(dataObj){
                dataObj.m.forEach(function(mObj) {
                    groupsRemoved.push({
                        motifs: mObj.motifs,
                        cluster: mObj.clusters,
                        match_id:dataObj.match_id,
                        team_id: dataObj.team_id});
                });
            });

            var withMatchIds = addMatchIdToPassObjects(groupsRemoved);

            var matchesFiltered = withMatchIds.filter(function(d) {
                return matchesIds.indexOf(d.match_id)>-1;
            });

            vm.data = computeMotifSpatialAttribute(matchesFiltered);



            // Consider moving this part of the code for better re-usability

            var allMotifsCount = genMotifsFreqBaseObject(vm.motifNames);
            var allClustersCount = genClusterFreqBaseObject(clusterNames);

            var allClustersMax = getClusterCountBaseObj(clusterNames);

            var allAreasCount = {
                "defense": [],
                "middle": [],
                "attack": []

            };

            var perTeam = _.groupBy(vm.data,"team_id");


            var perCluster = _.mapValues(perTeam,function(d) {
                var grouped =_.groupBy(d,"cluster");
                return angular.extend({},allClustersCount,grouped);
            });

            var perClusterArea = _.mapValues(perCluster,function(groupedByCluster) {
                return _.mapValues(groupedByCluster,function(d) {
                        var spatialObj = _.groupBy(d,"spatial");
                        return angular.extend({},allAreasCount,spatialObj);
                });
            });

            var perArea = _.mapValues(perTeam,function(d) {
                    return _.groupBy(d,"spatial");
            });


            //grouping

            var helperObj = {
                maxCluster: maxCluster,
                clusterNames: clusterNames
            };

            var freqCountArr = getMotifsFrequency(vm.data,allMotifsCount,allClustersCount,helperObj);

            var freqPerTeam = _.mapValues(perArea,function(groupedByArea) {
                return _.mapValues(groupedByArea,function(d) {
                    return getMotifsFrequency(d,allMotifsCount,allClustersCount,helperObj);
                });
            });




            var maxFreqHelper = function(d) {
                return d3.max(d);
            };

            var areaToArrayHelper = function(areaObj) {
                return [areaObj.defense,areaObj.middle,areaObj.attack];
            };

            var groupPerStructure = function(d) {
                var perStructure = _.groupBy(d,"motifs[0].structure");
                var keys = Object.keys(perStructure);

                //Some properties may not exist --- so we ensure to have 0 count  for those cases.
                if(keys.length < vm.motifNames.length) {
                    perStructure = angular.extend({},allMotifsCount,perStructure);
                }
                return perStructure;
            };

            var groupPerStructureInArray = function(d) {
                    var perStructure = groupPerStructure(d);
                var structuresArray = vm.motifNamesForSquares.map(function(motifName) {
                    return perStructure[motifName];
                });

                return structuresArray;

            };


            //var freqPerTeamCluster = mapToPerClusterArea(perClusterArea,countFreqHelper);
            var perClusterAreaStructure = mapToPerClusterArea(perClusterArea,groupPerStructureInArray);
            var freqPerClusterAreaStructure = mapToPerClusterAreaStructure(perClusterAreaStructure,function(d) { return d.length;});
            var uniqPlayerSeqs = mapToPerClusterAreaStructure(perClusterAreaStructure,function(objList) {
                    return objList.map(function(aMotif) {
                            var playerIds = aMotif.motifs.map(function(passEvent) {
                                return passEvent.player_id;
                            });

                        return playerIds.join();
                    });
                });

            var countUniq = mapToPerClusterAreaStructure(uniqPlayerSeqs, function(playerSeqs) {
                    return _.countBy(playerSeqs);
            });


            var countUniqArray = mapToPerClusterAreaStructure(countUniq,function(playerFreqObj){
                var playerListFreq =  _.map(playerFreqObj,function(value,playerKey) {

                    var playerIds = playerKey.split(",");
                    return {p1: playerIds[0],
                            p2: playerIds[1],
                            p3: playerIds[2],
                            p4: playerIds[3],
                            count: value};
                });

                return _.orderBy(playerListFreq,"count","desc");


            });



            //Computing max value per cluster
            var maxFreqs = mapToPerClusterArea(freqPerClusterAreaStructure,maxFreqHelper);
            var maxFreqsInArray = mapToPerCluster(maxFreqs,areaToArrayHelper);
           // var maxFreqPerCluster = mapToPerCluster(maxFreqsInArray,maxFreqHelper);


            var teamKeys = Object.keys(maxFreqsInArray);

            var maxValues = teamKeys.reduce(function(maxObj,curr) {
                var teamObj = maxFreqsInArray[curr];
                var clusterKeys = Object.keys(teamObj);
                clusterKeys.forEach(function(clusterId) {
                    maxObj[clusterId].defense = Math.max(maxObj[clusterId].defense,teamObj[clusterId][0]);
                    maxObj[clusterId].middle = Math.max(maxObj[clusterId].middle,teamObj[clusterId][1]);
                    maxObj[clusterId].attack = Math.max(maxObj[clusterId].attack,teamObj[clusterId][2]);
                });
                return maxObj;
            },allClustersMax);


            //Converting object to array --- for sorting functionality
            var freqPerTeamArray = _.values(_.mapValues(freqPerClusterAreaStructure,function(value,key) {

                    for(var clusterId in value) {
                        value[clusterId]["perStructure"] = {
                            defense: _.zip(value[clusterId].defense),
                            middle: _.zip(value[clusterId].middle),
                            attack:_.zip(value[clusterId].attack)
                        }
                    }
                   var teamObj = {
                        team_id: key,
                        clusters: value
                   };

                   return teamObj;
            }));



            vm.freqCount = {};
          //  vm.freqCount.maxValue = maxFrequency;
            vm.freqCount.frequencies = freqPerTeam;
            vm.freqCount.frequenciesPerCluster = freqPerTeamArray;
            vm.freqCount.maxValues = maxValues;
            vm.freqCount.playersCount = countUniqArray;




        }

    });



    function addMatchIdToPassObjects(data) {

        data.forEach(function(motifObj) {
            motifObj.motifs.forEach(function(aPassObj) {
                aPassObj.match_id = motifObj.match_id;
                //Additional player name added ------- todo: refactor
                aPassObj.player_name = $filter("playerNames")(aPassObj.player_id);
            });
        });

        return data;
    }


    function mapToPerCluster(perCluster,outputFunction) {
            var result = _.mapValues(perCluster,function(groupedByCluster) {
                return _.mapValues(groupedByCluster,function(groupedByArea) {
                        return outputFunction(groupedByArea);
                });
            });

        return result;
    }


    function mapToPerClusterArea (perClusterArea,outputFunction) {

        var result = _.mapValues(perClusterArea,function(groupedByCluster) {
            return _.mapValues(groupedByCluster,function(groupedByArea) {
                return _.mapValues(groupedByArea,function(d) {
                    return outputFunction(d);
                })
            })
        });

        return result;
    }

    function mapToPerClusterAreaStructure (perClusterAreaStructure,outputFunction) {
        var result = mapToPerClusterArea(perClusterAreaStructure,function(groupedByStructure) {
                return groupedByStructure.map(function(d) {
                        return outputFunction(d);
                });
        });

        return result;
    }

    function getMotifsFrequency(data,allMotifsCount,allClustersCount,helper) {

        var clusterNames = helper.clusterNames;
        var maxCluster = helper.maxCluster;

        var perCluster = _.groupBy(data,"cluster");
        var nClusterKeys = Object.keys(perCluster).length;
        if(nClusterKeys < clusterNames.length) {
            perCluster = angular.extend({},allClustersCount,perCluster);
        }


        // Warning: modifying object inside for ------- refactor
        for(aCluster in perCluster) {
            perCluster[aCluster] = _.groupBy(perCluster[aCluster],"motifs[0].structure");
            var keys = Object.keys(perCluster[aCluster]);

            //Some properties may not exist --- so we ensure to have 0 count  for those cases.
            if(keys.length < vm.motifNames.length) {
                perCluster[aCluster] = angular.extend({},allMotifsCount,perCluster[aCluster]);
            }
        }
        //count
        var freqCount = {};
        var freqCountArr = [];


        var clusterNumbers = [1,2,3,4,5,7,8];
        clusterNumbers.forEach(function(number) {
            freqCount[number] = _.mapValues(perCluster[number],"length");

            var frequencyList = vm.motifNamesForSquares.map(function(motifName) {
                return freqCount[number][motifName];
            });

            freqCountArr.push(frequencyList);
        });

        //Warning: freqCount obj will have all motifs and clusters.
        //freqCountArr does not have cluster 6 and motif ABCD
        return freqCountArr;


    }

    function getClusterCountBaseObj(clusterNames) {
        var count = clusterNames.reduce(function(prevObj,currObj) {
            prevObj[currObj.id] = { defense:0, middle:0, attack:0};
            return prevObj;
        },{});
        return count;
    }

    function genMotifsFreqBaseObject(motifNames) {
        var allMotifsCount = motifNames.reduce(function(prev,curr) {
            prev[curr] = [];
            return prev;
        },{});

        return allMotifsCount;
    }

    function genClusterFreqBaseObject(clusterNames) {
        var allClustersCount = clusterNames.reduce(function(prevObj,currObj) {
            prevObj[currObj.id] = [];
            return prevObj;
        },{});

        return allClustersCount;
    }

    function computeMotifSpatialAttribute(motifsList) {
        return motifsList.map(function(aMotifObj) {
            var centroid = computeCentroid(aMotifObj,aMotifObj.motifs.length);
            var label = labelCentroid(centroid);
            return angular.extend(aMotifObj,{spatial:label});

        });


        function computeCentroid(aMotifObj,nPlayers) {

            var sumXY = aMotifObj.motifs.reduce(function(prev,curr) {
                return {x: prev.x+curr.x, y:prev.y+curr.y};
            });

            sumXY.x /= nPlayers;
            sumXY.y /= nPlayers;

            return sumXY;
        }

        function labelCentroid(centroid) {
            var divDefenseMiddle = 33.3;
            var divMiddleAttack = 66.6;
            if (centroid.x < divDefenseMiddle) return "defense";
            if (centroid.x >= divDefenseMiddle
                    && centroid.x < divMiddleAttack) return "middle";

            return "attack";
        }
    }

    $scope.$watchCollection("motifsVm.matchEvents",function(eventsData) {
        if(eventsData && eventsData.length>0) {
            console.log(eventsData);
            var matchEvents = angular.copy(eventsData);
            var goalEvents = eventsData.map(function(matchObj) {
                var goalsObj= {};
                    Object.keys(matchObj).forEach(function(key) {
                    goalsObj[key] = matchObj[key].filter(filterGoals);
                 });
                return goalsObj;
            });

            var allGoalEvents = [];
            //Concat
            goalEvents.forEach(function(matchObj) {
                Object.keys(matchObj).forEach(function(teamId) {
                    allGoalEvents = allGoalEvents.concat(matchObj[teamId]);
                });
            });

            vm.goalData = allGoalEvents;


        }
    });


    function filterGoals(eventObj) {
        return eventObj.type_id == vm.goalEventId;
    }

    $scope.$watch("motifsVm.data",function(newMotifs) {
        if(newMotifs) {
           /* vm.filteredData= angular.copy(vm.data);
            vm.dataByTeam = angular.copy(vm.data);
            vm.dataByMotif = angular.copy(vm.data);*/

            //vm.filteredData = vm.data;
            vm.filteredData = vm.data.filter(function(dataObj) {
                return dataObj.cluster==3;
            });
            vm.dataByTeam = vm.data;
            vm.dataByMotif = vm.data;
            vm.dataByCluster = vm.data;
            vm.dataByArea = vm.data;
            vm.dataBySegment = vm.data;
        }
    });

    ///////////////////////////////

    function filterTeam() {

        var selectedTeamId = vm.selectedTeam.id;
        var matchId = vm.selectedTeam.match_id;

        var filtered;
        //No team selected -- default: select all
        if (selectedTeamId==0) {
            filtered = vm.data;
            vm.filteredGoals = vm.goalData;
        }
        else {

            filtered = vm.data.filter(vm.filterHelper);
            vm.filteredGoals = vm.goalData.filter(vm.filterHelper);


        }


        var matchObj = _.find(vm.matchesSubset,{id: matchId});
        d3.select(".hText").remove();

        d3.select("#playerHistograms svg")
            .append("text")
            .attr("class","hText")
            .attr("x",320)
            .attr("y",100)
            .attr("font-weight","bolder")
            .attr("font-size","60px")
            .text(matchObj.home_score+" - "+matchObj.away_score);


        vm.filteredData = filtered;
        vm.dataByTeam  = filtered;

        vm.filterMotif();
    }

    function filterTeamMatchHelper(d){
        return d.team_id==vm.selectedTeam.id && d.match_id==vm.selectedTeam.match_id;
    }

    function filterTeamHelper(d) {
        return d.team_id==vm.selectedTeam.id;
    }

    function filterMotif() {
        var selectedMotif = vm.selectedMotif.name;

        if(selectedMotif != "All") {

            if(selectedMotif == "All -ABCD") {
                vm.filteredData =  vm.dataByTeam.filter(function(dataObj) {
                    return dataObj.motifs[0].structure != "ABCD";
                });
            } else {
                vm.filteredData =  vm.dataByTeam.filter(function(dataObj) {
                    return dataObj.motifs[0].structure == selectedMotif;
                });
            }




        } else {
            vm.filteredData = vm.dataByTeam;

        }

        //vm.dataByMotif = angular.copy(vm.filteredData);
        vm.dataByMotif = vm.filteredData;
        vm.filterCluster();

    }

    function filterCluster() {
        var selectedClusterId = vm.selectedCluster.id;

        if (selectedClusterId != 0) {
            vm.filteredData = vm.dataByMotif.filter(function(dataObj) {
                return dataObj.cluster==selectedClusterId;
            });

        } else {

            vm.filteredData = vm.dataByMotif;
        }

        vm.dataByCluster = vm.filteredData;
        vm.filterArea();


    }

    function filterArea() {
        var selectedAreaId = vm.selectedArea.id;

        if(selectedAreaId != "none") {
            vm.filteredData = vm.dataByCluster.filter(function(dataObj) {
                return dataObj.spatial==selectedAreaId;
            });
        } else {
            vm.filteredData = vm.dataByCluster;
        }

        vm.dataByArea = vm.filteredData;
        vm.filterSegment();

    }

    function filterSegment() {

        var checkedIndices = vm.segments.reduce(function(arr,segment,idx) {
            if(segment.checked)
                arr.push(idx);
            return arr;
        },[]);


        vm.filteredData = vm.dataByArea.map(function(dataObj) {
            var copy = angular.copy(dataObj);
             copy.motifs = copy.motifs.filter(function(aPass,i) {
                if(checkedIndices.length==1) {
                    return i>=checkedIndices[0] && i<=checkedIndices[0]+1;
                } else {
                    return i>= checkedIndices[0] && i<= checkedIndices[checkedIndices.length-1]+1;
                }
            });

            return copy;
        });


        vm.dataBySegment = vm.filteredData;
        vm.filterPlayer();
        //console.log(vm.filteredData);

    }


    function filterPlayer() {

        if(vm.selectedPlayerName!="none") {
            vm.filteredData = vm.dataBySegment.filter(function(dataObj) {
                var firstMatchingPass = _.find(dataObj.motifs,{player_name:vm.selectedPlayerName});
                if (typeof firstMatchingPass != "undefined") return true;
                return false;
            });
        } else {
            vm.filteredData = vm.dataBySegment;
        }

    }



    function uniqueTeamsChanged() {
        if(vm.isUniqueEnabled) {
            vm.filterHelper = filterTeamHelper;
        } else {
            vm.filterHelper = filterTeamMatchHelper;
        }

        filterTeam();
    }



    function populateAllTeams() {


        vm.matchesSubset.forEach(function(match,i) {
            vm.teams.push({id: match.home_team_id, name: match.home_team_name,match_id: match.id});
            vm.teams.push({id: match.away_team_id, name: match.away_team_name,match_id: match.id});
        });


    }





}