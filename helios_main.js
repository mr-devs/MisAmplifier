import {Helios} from "https://cdn.skypack.dev/helios-web?min";
// import {rgb as d3rgb} from "/Users/matthewdeverna/Documents/Projects/helios-test/node_modules/d3-color";
// import * as d3Chromatic from "/Users/matthewdeverna/Documents/Projects/helios-test/node_modules/d3-scale-chromatic";
// import {scaleOrdinal as d3ScaleOrdinal} from "/Users/matthewdeverna/Documents/Projects/helios-test/node_modules/d3-scale";

import {rgb as d3rgb} from "https://cdn.skypack.dev/d3-color";
import * as d3Chromatic from "https://cdn.skypack.dev/d3-scale-chromatic";
import {scaleOrdinal as d3ScaleOrdinal} from "https://cdn.skypack.dev/d3-scale";
import { select as d3Select } from 'https://cdn.skypack.dev/d3-selection';

// *** Set up the nodes and edges location ***

// FROM GITHUB
// const edges_url = 'https://raw.githubusercontent.com/mr-devs/helios-test/main/data/edges.json'
// const nodes_url = 'https://raw.githubusercontent.com/mr-devs/helios-test/main/data/nodes.json'

// FROM LOCAL MACHINE
const edges_url = '../data/edges_all.json'
const nodes_url = '../data/nodes_all.json'

// Fetch data
let edges_response = await fetch(edges_url);
let nodes_response = await fetch(nodes_url);

// Decode the JSON into a variable
let edges = []
if (edges_response.ok) {
  edges = await edges_response.json();
} else {
  alert("HTTP-Error: " + edges_response.status);
}

let nodes = {}
if (nodes_response.ok) {
  nodes = await nodes_response.json();
} else {
  alert("HTTP-Error: " + nodes_response.status);
}

// Sanity check
console.log("Nodes")
console.log(nodes)
console.log("Edges")
console.log(edges)

// *** SET COLOR MODE *** 
let COLOR_MODE = 'reconstructed'; // highlight superspreaders/amplifiers based on RECONSTRUCTED data
// let COLOR_MODE = 'naive';         // highlight superspreaders/amplifiers based on NAIVE (raw Twitter) data


// Set up some stuff for the network...
// let colorProperty = "index";
// let sequencialColormap = "interpolateInferno";
// let categoricalColormap = "schemeCategory10";
// let useCategoricalColormap = false;
let defaultOutline = 0.25;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

if(urlParams.has("network")){
	networkName = urlParams.get("network");
}
let use2D = false;
if(urlParams.has("use2d")){
	use2D = true;
}

let advancedEdges = false;
if(urlParams.has("advanced")){
	advancedEdges = true;
}

let startZoomLevel = null;
if(urlParams.has("zoom")){
	startZoomLevel = +urlParams.get("zoom");
}

let darkBackground = false;
let backgroundColor = [1.0,1.0,1.0,1.0]

if(urlParams.has("dark")){
	darkBackground = true;
	backgroundColor = [0.0,0.0,0.0,1.0]
}

let additiveBlending = false;
if(urlParams.has("additive") && darkBackground){
	additiveBlending = true;
}

let nodeCount = Object.keys(nodes).length;
console.log("Node count")
console.log(nodeCount)
let bigNetwork = nodeCount > 25000;
let tooltipElement = document.getElementById("tooltip");

let autoStartLayout = null;
if(autoStartLayout === null){
  autoStartLayout = !bigNetwork;
}

let allColors = {};
Object.assign(allColors, d3Chromatic);
console.log("Colors")
console.log(allColors);
let colorScale = d3ScaleOrdinal(allColors.schemeCategory10);

// Ensure each type of node is assigned the color we expect
//    See the nodes_all.json file's `color_X` key/value pairs
colorScale('other')
colorScale('rt_of_amplifier')
colorScale('amplifier')

// Activate Helios
let helios = new Helios({
  elementID: "netviz", // ID of the element to render the network in
  nodes: nodes, // Dictionary of nodes 
  edges: edges, // Array of edges
  use2D: false, // Choose between 2D or 3D layouts
  fastEdges: !advancedEdges,
  autoStartLayout: true
})
.onLayoutStart(()=>{
  console.log("Layout start");
  d3Select("#loading").style("display", "block");
  d3Select("#message").style("display", "none");
})
.onLayoutStop(()=>{
  console.log("Layout end");
  d3Select("#loading").style("display", "none");
  d3Select("#message").style("display", "block");
  // alert("Layout paused.\n\n Select 'OK' and then press the space bar to resume.");
})
.onNodeClick((node, event) => {
  console.log(`Clicked: ${node.ID}`);
})
.onNodeHoverStart((node, event) => {
  if (event) {
    tooltipElement.style.left = event.pageX + "px";
    tooltipElement.style.top = event.pageY + "px";
  }
  if (node) {
    tooltipElement.style.display = "block";
    if(darkBackground){
      tooltipElement.style.color = d3rgb(node.color[0] * 255, node.color[1] * 255, node.color[2] * 255).brighter(2).formatRgb();
      tooltipElement.style["text-shadow"] =
        "-1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black";
    }else{
      tooltipElement.style.color = d3rgb(node.color[0] * 255, node.color[1] * 255, node.color[2] * 255).darker(2).formatRgb();
      tooltipElement.style["text-shadow"] =
        "-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white";
    }
    if (node.username) {
      tooltipElement.textContent = node.username + ' (' + node.retweets + ' retweets)';
    }else if (node.label) {
      tooltipElement.textContent = node.label;
    }else if (node.title) {
      tooltipElement.textContent = node.title;
    }else{
      tooltipElement.textContent = node.ID;
    }
    node.originalSize = node.size;
    node.size = 2.0 * node.originalSize;
    node.outlineWidth = 0.25 * node.originalSize;
    // helios.nodeSize(,node.ID);
    helios.update();
    helios.render();
  } else {
    tooltipElement.style.display = "none";
  }
  // console.log(`Start: ${node.ID}`);
})
.onNodeHoverMove((node, event) => {
  if (event) {
    tooltipElement.style.left = event.pageX + "px";
    tooltipElement.style.top = event.pageY + "px";
  }
  if (node) {
    // tooltipElement.style.display = "block";
    if (node.username) {
      tooltipElement.textContent = node.username + ' (' + node.retweets + ' retweets)';
    }else if (node.label) {
      tooltipElement.textContent = node.label;
    }else if (node.title) {
      tooltipElement.textContent = node.title;
    }else{
      tooltipElement.textContent = node.ID;
    }
  } else {
    tooltipElement.style.display = "none";
  }
  // console.log(`Move: ${node.ID}`);
})
.onNodeHoverEnd((node, event) => {
  if (event) {
    tooltipElement.style.left = event.pageX + "px";
    tooltipElement.style.top = event.pageY + "px";
  }
  if (node) {
    node.size = 1.0 * node.originalSize;
    node.outlineWidth = defaultOutline * node.originalSize;
    
    helios.update();
    helios.render();
  }
  tooltipElement.style.display = "none";
})
.onNodeClick((node, event) => {
  console.log(`Clicked: ${node.ID}`);
})
.onNodeDoubleClick((node, event) => {
  console.log(`Double Clicked: ${node.ID}`);
  let user_id = node.ID;
  window.open(
    'https://twitter.com/i/user/' + user_id,
    '_blank'
  );
})
.nodeColor(node=>{ 
  // console.log(colorScale)
  let color;
  if(COLOR_MODE == 'reconstructed'){
    color = d3rgb(colorScale(node.color_reconstructed));
  }else if(COLOR_MODE == 'naive'){
    color = d3rgb(colorScale(node.color_naive));
  }
  // console.log(typeof color)
  // console.log(color)
  // console.log(""+[color.r,color.g,color.b])
  return [color.r/255,color.g/255,color.b/255];
})
.backgroundColor(backgroundColor)
.nodeOutlineWidth(node=>node.size*defaultOutline)
.nodeOutlineColor(backgroundColor)
.additiveBlending(additiveBlending)
.nodeOpacity(1)
.edgesOpacity(0.25);


let buttonInformation = {
  "Switch": {
    name: "Switch",
    mapColor: "#B1C3B6",
    color: "#008758",
    action: null,
    extra: selection => {
      console.log('Switching colors...')
      // updateColors();
      console.log("Action!");
    }
  }
}

// This function is what I would like to happen
// (logically, at least) when the "Switch" button is clicked.
// Right now, this function is not used because it breaks the visualization.
// To test it, uncomment the function in the 'buttonInformation' (directly above)

function updateColors() {
  helios.nodeColor(node=> {
    let color;
    if(COLOR_MODE == 'reconstructed'){
      console.log('recon -> naive');
      COLOR_MODE = 'naive';
      color = d3rgb(colorScale(node.color_naive));
    }else if(COLOR_MODE == 'naive'){
      console.log('naive -> recon');
      COLOR_MODE = 'reconstructed';
      color = d3rgb(colorScale(node.color_reconstructed));
    }
    return [color.r, color.g, color.b];
  })
  helios.update();
  helios.render();
}

let buttonOrder = ["Switch"];

d3Select("#selectionmenu")
  .selectAll("span.menuEntry")
  .data(buttonOrder)
  .enter()
  .append("span")
  .classed("menuEntry", true)
  .style("--color", d => buttonInformation[d].color)
  .text(d => buttonInformation[d].name)
  .each(function (d) {
    d3Select(this).call(buttonInformation[d].extra);
  });
d3Select("#selectionmenu")
  .selectAll("span.menuEntry")
  .filter(d => buttonInformation[d].action != null)
  .on("click", (event, d) => {
    if (buttonInformation[d].action) {
      buttonInformation[d].action(d3Select(this), d, event);
    }
  })
  .classed("hasAction", true);

document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
    if(helios.layoutWorker.isRunning()){
      helios.pauseLayout();
    }else{
      helios.resumeLayout();
    }
  }
});

if(startZoomLevel){
  helios.zoomFactor(startZoomLevel);
}else{
  if(bigNetwork){
    helios.zoomFactor(0.35);
  }else{
    helios.zoomFactor(0.05);
    helios.zoomFactor(0.75,1000);
  }
}

