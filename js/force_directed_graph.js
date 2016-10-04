
// Based on http://bl.ocks.org/mbostock/4062045

var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-300)
    .linkDistance(50)
    .size([width, height]);


d3.select("#main").selectAll("svg").remove();

var svg = d3.select("#main")
  .append("svg")
  .attr("width", 960)
  .attr("height", 500)
  .call(d3.behavior.zoom().on("zoom", function () {
    svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
  }))
  .append("g");

d3.json("data.json", function(error, graph) {
    if (error) throw error;

    var graph = graph ;

    var linkNodes = [];

    graph.links.forEach(function(link) {
      linkNodes.push({
        source: graph.nodes[link.source],
        target: graph.nodes[link.target]
      });
    });

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    var node_drag = d3.behavior.drag()
          .on("dragstart", dragstart)
          .on("drag", dragmove)
          .on("dragend", dragend);

      function dragstart(d, i) {
          force.stop() // stops the force auto positioning before you start dragging
      }

      function dragmove(d, i) {
          d.px += d3.event.dx;
          d.py += d3.event.dy;
          d.x += d3.event.dx;
          d.y += d3.event.dy; 
          tick(); // this is the key to make it work together with updating both px,py,x,y on d !
      }

      function dragend(d, i) {
          d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
          tick();
          force.resume();
      }

    var node = svg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return d.value * 60; })
        .style("fill", function(d) { return color(d.group); })
        .style("stroke", "black")
        //.call(force.drag)
        .call(node_drag);

    node.append("title")
        .text(function(d) { return d.name; });

    var label = svg.selectAll(".mytext")
                      .data(graph.nodes)
                      .enter()
                      .append("text")
                      .text(function (d) { 
                        if(d.value!=0.1)
                          return d.name; })
                      .style("text-anchor", "middle")
                      .style("fill", "#555")
                      .style("font-family", "Arial")
                      .style("font-size", 12);

    var linkNode = svg.selectAll(".link-node")
          .data(linkNodes)
        .enter().append("circle")
          .attr("class", "link-node")
          .attr("r", 2)
          .style("fill", "#ccc");

      force.on("tick", tick);

      function tick() {
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

          label.attr("x", function(d){ return d.x; })
                 .attr("y", function (d) {return d.y - 10; });

          linkNode.attr("cx", function(d) { return d.x = (d.source.x + d.target.x) * 0.5; })
            .attr("cy", function(d) { return d.y = (d.source.y + d.target.y) * 0.5; });
        };
  });

