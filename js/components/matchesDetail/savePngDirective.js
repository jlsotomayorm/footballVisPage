/**
 * Created by jl on 28/10/15.
 */
angular.module("footballDirectives")
.directive("fvSavePng",function() {


        var directive = {
            restrict: "E",
            scope:{},
            templateUrl: "js/components/matchesDetail/savePngTemplate.html",
            controller: ["$scope",savePngController],
            controllerAs: "pngVm",
            bindToController: true,
            link: linkFunction,
            transclude:true
        };




        return directive;

        //////////////////////

        function linkFunction(scope,element,attrs,vm) {

            var d3element = d3.select(element[0]);

            d3element.select("#save").on("click", function(){


                var d3Svg = vm.element.selectAll("svg");


                d3Svg.each(savePng);

                function savePng () {

                    var aSvg = d3.select(this);
                    var svgWidth = parseInt(aSvg.style("width"),10);
                    var svgHeight = parseInt(aSvg.style("height"),10);

                    var html = aSvg
                        .attr("version", 1.1)
                        .attr("xmlns", "http://www.w3.org/2000/svg")
                        .node().parentNode.innerHTML;

                    //console.log(html);
                    var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
                    /*var img = '<img src="'+imgsrc+'" width="'+svgWidth+'" height="'+svgHeight+'" ">';
                    var imgDiv = d3.select("#svgdataurl").html(img);
                    var d3img = imgDiv.select("img");*/
                    var d3img = d3element.append("img")
                        .attr("src",imgsrc)
                        .attr("width",svgWidth)
                        .attr("height",svgHeight)
                        .style("visibility","hidden");

                    var d3Canvas = d3element.append("canvas")
                        .attr("width",svgWidth)
                        .attr("height",svgHeight)
                        .style("display","none");

                    var canvas = d3Canvas.node();
                    var context = canvas.getContext("2d");


                    var image = d3img.node();
                    image.onload = function() {
                        context.drawImage(image, 0, 0,svgWidth,svgHeight);

                        var canvasdata = canvas.toDataURL("image/png");
                        /*var pngimg = '<img src="'+canvasdata+'" width="945" height="1010" >';
                         d3.select("#pngdataurl").html(pngimg);*/

                        var a = document.createElement("a");
                        a.download = "test.png";
                        a.href = canvasdata;
                        document.body.appendChild(a);

                        a.click();
                    };

                }

            });



        }




    });

function savePngController($scope) {

    var vm = this;
    vm.setElement = setElement;
    vm.element = {};

    function setElement(element) {

        vm.element = d3.select(element[0]);


    }



}