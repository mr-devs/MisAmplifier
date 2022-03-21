import {Helios} from "https://cdn.skypack.dev/helios-web?min";

// var nodes = require('../data/nodes.json');
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

// Edges are arrays of node ids
// var edges = require('../data/edges.json');
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

let helios = new Helios({
  elementID: "netviz", // ID of the element to render the network in
  nodes: nodes, // Dictionary of nodes 
  edges: edges, // Array of edges
  use2D: false, // Choose between 2D or 3D layouts
});

helios.onReady(() => {
  helios.zoomFactor(0.05);
  helios.zoomFactor(30, 8000);
});
