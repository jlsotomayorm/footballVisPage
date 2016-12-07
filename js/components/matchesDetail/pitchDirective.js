/**
 * Created by jl on 27/10/15.
 */
angular.module('footballDirectives')
.directive("fvPitch",function() {

        var directive = {
            restrict:"EA",
            controller: ["$element","$attrs",pitchController],
            controllerAs: "pitchVm",
            require: ["fvPitch","?^fvSavePng"],
            bindToController: true,
         //   templateUrl:"js/components/matchesDetail/pitchTemplate.html",
            link: linkFunction

        };
        return directive;

        ////////////

        function linkFunction(scope,element,attrs,ctrl) {

            var vm = ctrl[0];
            var savePngController = ctrl[1];

            var rawElement = element[0];
            var pitchSvg = d3.select(rawElement)
                .append("div")
                .attr("class","col-md-9")
                .append("svg")
                .attr("class","pitchSvg")
                .style("width", '100%')
                .style("height",vm.pitchHeight);


            vm.pitchWidth = parseInt(pitchSvg.style("width"),10);


            var linesColor = "black";

            pitchSvg.append("rect")
                .attr("height",vm.pitchHeight)
                .attr("width",vm.pitchWidth )
                .attr("fill","#EEFFEF");
               // .attr("fill","#829356");


            var xScale = d3.scale.linear()
                .domain([0,100])
                .range([vm.pitchPadding,vm.pitchWidth-vm.pitchPadding]);

            var yScale = d3.scale.linear()
                .domain([0,100])
                .range([vm.pitchHeight-vm.pitchPadding,vm.pitchPadding]);



            var hData = [

                //Horizontal
                {x1: 0,y1:100, x2: 100,y2:100},
                {x1: 0,y1:78.9,x2: 17,y2:78.9},
                {x1: 83,y1:78.9,x2: 100,y2:78.9},
                {x1: 0,y1:63.2,x2:5.8,y2:63.2},
                {x1: 94.2,y1:63.2,x2:100,y2:63.2},
                {x1: 0,y1:36.8,x2:5.8,y2:36.8},
                {x1: 94.2,y1:36.8,x2:100,y2:36.8},
                {x1: 0,y1:21.1,x2:17,y2:21.1},
                {x1: 83,y1:21.1,x2:100,y2:21.1},
                {x1: 0,y1:0,x2:100,y2:0},

                //Vertical
                {x1: 0,y1:100, x2: 0,y2:0},
                {x1: 5.8,y1:63.2, x2: 5.8,y2:36.8},
                {x1: 17,y1:78.9, x2: 17,y2:21.1},
                {x1: 83,y1:78.9, x2: 83,y2:21.1},
                {x1: 94.2,y1:63.2, x2: 94.2,y2:36.8},
                {x1: 100,y1:100, x2: 100,y2:0},
                {x1: 50,y1:100, x2: 50,y2:0}

            ];


            var cData = [{x:50,y:50,r: 8}];

            pitchSvg.selectAll("lines")
                .data(hData)
                .enter()
                .append("line")
                .attr("class","lines")
                .attr("x1",function(d) { return xScale(d.x1);})
                .attr("y1",function(d) { return yScale(d.y1);})
                .attr("x2",function(d) { return xScale(d.x2);})
                .attr("y2",function(d) { return yScale(d.y2);})
                .attr("stroke-width",1);



            pitchSvg.selectAll("circle")
                .data(cData)
                .enter()
                .append("circle")
                .attr("cx",function(d){return xScale(d.x);})
                .attr("cy",function(d){return yScale(d.y);})
                .attr("r",function(d){return xScale(d.r);})
                .attr("class","lines")
                .attr("fill","none");

            if(savePngController)
                savePngController.setElement(element);


        }

    });

function pitchController($element,$attrs) {
    var vm = this;
    vm.getRawElement = getRawElement;
    vm.getDimensions = getDimensions;
    vm.pitchHeight = parseInt($attrs.height) || 100;
    vm.pitchPadding = 10;
    vm.pitchWidth =0;


    function getRawElement() {
        return $element[0];
    }

    function getDimensions() {
        var dim = {
            height: vm.pitchHeight,
            width: vm.pitchWidth,
            padding: vm.pitchPadding
        };

        return dim;
    }



}