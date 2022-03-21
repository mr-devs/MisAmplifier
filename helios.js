import {Helios} from "https://cdn.skypack.dev/helios-web?min";
// import { rgb as d3rgb } from "/Users/matthewdeverna/node_modules/d3-color";

// Set up the nodes and edges location
// const edges_url = 'https://raw.githubusercontent.com/mr-devs/helios-test/main/data/edges.json'
// const nodes_url = 'https://raw.githubusercontent.com/mr-devs/helios-test/main/data/nodes.json'

const edges_url = '../data/edges_all.json'
const nodes_url = '../data/nodes_all.json'

// Fetch data
let edges_response = await fetch(edges_url);
let nodes_response = await fetch(nodes_url);
// Decode the JSON into a variable
let edges = await edges_response.json();
let nodes = await nodes_response.json();

// Sanity check
console.log("Nodes")
console.log(nodes)
console.log("Edges")
console.log(edges)

// Set up some stuff for the network...
// let colorProperty = "index";
// let sequencialColormap = "interpolateInferno";
// let categoricalColormap = "schemeCategory10";
// let useCategoricalColormap = false;
// let defaultOutline = 0.25;

let nodeCount = Object.keys(nodes).length;
console.log("Node count")
console.log(nodeCount)
let bigNetwork = nodeCount > 25000;
let tooltipElement = document.getElementById("tooltip");

let autoStartLayout = null;
if(autoStartLayout === null){
  autoStartLayout = !bigNetwork;
}

// Activate Helios
let helios = new Helios({
  elementID: "netviz", // ID of the element to render the network in
  nodes: nodes, // Dictionary of nodes 
  edges: edges, // Array of edges
  use2D: false, // Choose between 2D or 3D layouts
  autoStartLayout: true
})
// console.log(`End: ${node.ID}`);
.onNodeClick((node, event) => {
  console.log(`Clicked: ${node.ID}`);
});

helios.onReady(() => {
  helios.zoomFactor(0.05);
  helios.zoomFactor(30, 8000);
});
