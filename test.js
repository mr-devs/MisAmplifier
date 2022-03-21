

let edges = [{
    source: "0",
    target: "1",
  },
  {
    source: "1",
    target: "2",
  },
  {
    source: "2",
    target: "0",
  },
  {
    source: "4",
    target: "0",
  },
  {
    source: "2",
    target: "4",
  }
];

let nodes = {
    "0": {
      label: "Node 0",
    },
    "1": {
      label: "Node 1",
    },
    "2": {
      label: "Node 2",
    },
    "4": {
      label: "Node 4",
    },
  }

jsonEdges = JSON.stringify(edges);
jsonNodes = JSON.stringify(nodes);

var fs = require('fs');
fs.writeFile("./data/edges.json", jsonEdges, function(err) {
    if (err) {
        console.log(err);
    }
});

fs.writeFile("./data/nodes.json", jsonNodes, function(err) {
    if (err) {
        console.log(err);
    }
});