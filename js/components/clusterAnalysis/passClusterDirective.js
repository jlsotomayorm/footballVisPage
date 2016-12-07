/**
 * Created by jl on 16/06/16.
 */
(function () {
    "use strict";

    angular
        .module("footballDirectives")
        .directive("fvPassCluster", fvPassCluster);

    fvPassCluster.$inject = [];

    /* @ngInject */
    function fvPassCluster() {
        var directive = {
            bindToController: true,
            controller: PassClusterController,
            controllerAs: "clusterVm",
            link: link,
            templateUrl: "js/components/clusterAnalysis/passClusterTemplate.html",
            restrict: "E",
            scope: {
                data:"="
            }
        };
        return directive;

        function link(scope, element, attrs,vm) {


            //var svgSize = 500;

            var rawElement = element[0];
            var clusterDiv = rawElement.querySelector("#clusterDiv");
            var svg = d3.select(clusterDiv)
                .append("div")
                .append("svg")
                .style("width", "100%");

            var svgSize = parseInt(svg.style("width"),10);
            svg.style("height",svgSize);



            var xScale = d3.scale.linear()
                .domain([-80,80])
                .range([0,svgSize]);

            var yScale = d3.scale.linear()
                .domain([-80,80])
                .range([0,svgSize]);


            var line = d3.svg.line()
                .interpolate("linear")
                .x(function(d) { return xScale(d.x); })
                .y(function(d) { return yScale(d.y); });

            var clusterGroup = svg.append("g")
                .attr("stroke-width",1.5)
                .attr("fill","none");

            var color = d3.interpolateLab("#008000", "#c83a22");


            scope.$watchCollection("clusterVm.data",function(newData) {
                if(newData) {
                    //console.log(newData);

                    vm.clusterLength = newData.length;

                    var passLines = clusterGroup.selectAll(".passLine")
                                    .data(newData);


                    passLines.enter()
                       /* .append("path")
                        .attr("class","passLine")
                        .style("opacity",0.03)
                        .style("stroke","black")
                        .attr("d",function(d){return line(d);})*/

                    //.attr("d",function(d){return line(d);})
                        .append("g")
                        .attr("class","passLine")
                        .each(createPaths);

                    //passLines.attr("d",function(d){return line(d);})

                }
            });


            function createPaths(aMotif) {

                var trajectory = d3.select(this).selectAll(".aMotif")
                    .data(quad(sample(line(aMotif),80)));

                var pathWidth = 2;

                trajectory.attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], pathWidth); });

                trajectory.enter()
                    .append("path")
                    .attr("class","aMotif")
                    .style("stroke", function(d) { return color(d.t); })
                    .style("opacity",0.03)
                    //.attr("d",function(d){return line(d);})
                    .style("fill", function(d) { return color(d.t); })
                    .attr("d", function(d) { return lineJoin(d[0], d[1], d[2], d[3], pathWidth); });

                trajectory.exit().remove();


            }

            function sample(d, precision) {
                var path = document.createElementNS(d3.ns.prefix.svg, "path");
                path.setAttribute("d", d);

                var n = path.getTotalLength(), t = [0], i = 0, dt = precision;
                while ((i += dt) < n) t.push(i);
                t.push(n);

                return t.map(function(t) {
                    var p = path.getPointAtLength(t), a = [p.x, p.y];
                    a.t = t / n;
                    return a;
                });
            }

            // Compute quads of adjacent points [p0, p1, p2, p3].
            function quad(points) {
                return d3.range(points.length - 1).map(function(i) {
                    var a = [points[i - 1], points[i], points[i + 1], points[i + 2]];
                    a.t = (points[i].t + points[i + 1].t) / 2;
                    return a;
                });
            }

            // Compute stroke outline for segment p12.
            function lineJoin(p0, p1, p2, p3, width) {
                var u12 = perp(p1, p2),
                    r = width / 2,
                    a = [p1[0] + u12[0] * r, p1[1] + u12[1] * r],
                    b = [p2[0] + u12[0] * r, p2[1] + u12[1] * r],
                    c = [p2[0] - u12[0] * r, p2[1] - u12[1] * r],
                    d = [p1[0] - u12[0] * r, p1[1] - u12[1] * r];

                if (p0) { // clip ad and dc using average of u01 and u12
                    var u01 = perp(p0, p1), e = [p1[0] + u01[0] + u12[0], p1[1] + u01[1] + u12[1]];
                    a = lineIntersect(p1, e, a, b);
                    d = lineIntersect(p1, e, d, c);
                }

                if (p3) { // clip ab and dc using average of u12 and u23
                    var u23 = perp(p2, p3), e = [p2[0] + u23[0] + u12[0], p2[1] + u23[1] + u12[1]];
                    b = lineIntersect(p2, e, a, b);
                    c = lineIntersect(p2, e, d, c);
                }

                return "M" + a + "L" + b + " " + c + " " + d + "Z";
            }

            // Compute intersection of two infinite lines ab and cd.
            function lineIntersect(a, b, c, d) {
                var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3,
                    y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3,
                    ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
                return [x1 + ua * x21, y1 + ua * y21];
            }

            // Compute unit vector perpendicular to p01.
            function perp(p0, p1) {
                var u01x = p0[1] - p1[1], u01y = p1[0] - p0[0],
                    u01d = Math.sqrt(u01x * u01x + u01y * u01y);
                return [u01x / u01d, u01y / u01d];
            }




        }
    }

    PassClusterController.$inject = [];

    /* @ngInject */
    function PassClusterController() {

        var vm = this;

        vm.clusterLength = 0;

    }

})();

