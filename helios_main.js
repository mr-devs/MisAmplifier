import {Helios} from "https://cdn.skypack.dev/helios-web?min";
import {rgb as d3rgb} from "https://cdn.skypack.dev/d3-color";
import { select as d3Select } from 'https://cdn.skypack.dev/d3-selection';

// Only include the below if you'd like to utilize a predefined d3 color pallette
// import * as d3Chromatic from "https://cdn.skypack.dev/d3-scale-chromatic";
// import {scaleOrdinal as d3ScaleOrdinal} from "https://cdn.skypack.dev/d3-scale";
// let allColors = {};
// Object.assign(allColors, d3Chromatic);
// console.log("Colors")
// console.log(allColors);
// let colorScale = d3ScaleOrdinal(allColors.schemeCategory10);

// Ensure each type of node is assigned the color we expect
//    See the nodes_all.json file's `color_X` key/value pairs
let colorScale = {};
colorScale['other'] = d3rgb("dodgerblue");
colorScale['retweeter'] = d3rgb("gold");
colorScale['problem_node'] = d3rgb("red");


// *** Set up the nodes and edges location ***

// FROM GITHUB
// const edges_url = 'https://raw.githubusercontent.com/mr-devs/helios-test/main/data/edges_all.json'
// const nodes_url = 'https://raw.githubusercontent.com/mr-devs/helios-test/main/data/nodes_all.json'

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

// *** SET COLOR MODE *** 
// let COLOR_MODE = 'reconstructed'; // highlight superspreaders/amplifiers based on RECONSTRUCTED data
let COLOR_MODE = 'naive';         // highlight superspreaders/amplifiers based on NAIVE (raw Twitter) data


// Set up some stuff for the network...
let defaultOutline = .2;
let use2D = false;
let advancedEdges = false;
let startZoomLevel = null;
let darkBackground = false;
let backgroundColor = [1.0,1.0,1.0,1.0]
let additiveBlending = false;
let tooltipElement = document.getElementById("tooltip");

// Here I set the `autoStartLayout` parameter based on how many nodes are in the network
let nodeCount = Object.keys(nodes).length;
console.log("Node count: " + nodeCount)
let bigNetwork = nodeCount > 25000;
let autoStartLayout = null;
if(autoStartLayout === null){
  autoStartLayout = !bigNetwork;
}


// Activate Helios
let helios = new Helios({
  elementID: "netviz", // ID of the element to render the network in
  nodes: nodes, // Dictionary of nodes 
  edges: edges, // Array of edges
  use2D: use2D, // Choose between 2D or 3D layouts
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
  // helios.centerOnNodes([node.ID],500);
})
.nodeColor(node=>{ 
  let color;
  if(COLOR_MODE == 'reconstructed'){
    color = colorScale[node.color_reconstructed];
  }else if(COLOR_MODE == 'naive'){
    color = colorScale[node.color_naive];
  }
  return [color.r/255,color.g/255,color.b/255];
})
.backgroundColor(backgroundColor)
.nodeOutlineWidth(node=>node.size*defaultOutline)
.nodeOutlineColor(backgroundColor) // .nodeOutlineColor([0,0,0,.25])
.additiveBlending(additiveBlending)
.nodeOpacity(.9)
.edgesOpacity(.5);


function updateColors() {
  
  if(COLOR_MODE == 'reconstructed'){
    console.log('recon -> naive');
    COLOR_MODE = 'naive';
  }else if(COLOR_MODE == 'naive'){
    console.log('naive -> recon');
    COLOR_MODE = 'reconstructed';
  }
   
  helios.nodeColor(node=> {
    let color;
    if(COLOR_MODE == 'naive'){
      color = colorScale[node.color_naive];
    }else if(COLOR_MODE == 'reconstructed'){
      color = colorScale[node.color_reconstructed];
    }
    return [color.r/255, color.g/255, color.b/255];
  })
  helios.update();
  helios.render();
}

// Pause layout when spacebar is pressed
document.addEventListener('keyup', event => {
  if (event.code === 'Space') {
    if(helios.layoutWorker.isRunning()){
      helios.pauseLayout();
    }else{
      helios.resumeLayout();
    }
  }
});

// Ensures the network zooms the correct amount when first started
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

// Handle switching colors for both the naive and reconstructed list buttons
function clickHandler () {
  console.log('clicked')
  updateColors()
}

const btnNaive = document.querySelector('#switchbutton_naive');
btnNaive.addEventListener('click', clickHandler);

const btnReconstructed = document.querySelector('#switchbutton_reconstructed');
btnReconstructed.addEventListener('click', clickHandler);