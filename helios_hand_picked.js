import {Helios} from "https://cdn.skypack.dev/helios-web?min";
// import {rgb as d3rgb} from "/Users/matthewdeverna/Documents/Projects/helios-test/node_modules/d3-color";
// import * as d3Chromatic from "/Users/matthewdeverna/Documents/Projects/helios-test/node_modules/d3-scale-chromatic";
// import {scaleOrdinal as d3ScaleOrdinal} from "/Users/matthewdeverna/Documents/Projects/helios-test/node_modules/d3-scale";

import {rgb as d3rgb} from "https://cdn.skypack.dev/d3-color";
import * as d3Chromatic from "https://cdn.skypack.dev/d3-scale-chromatic";
import {scaleOrdinal as d3ScaleOrdinal} from "https://cdn.skypack.dev/d3-scale";
import { select as d3Select } from 'https://cdn.skypack.dev/d3-selection';

// Set up the nodes and edges location
// const edges_url = 'https://raw.githubusercontent.com/mr-devs/helios-test/main/data/edges.json'
// const nodes_url = 'https://raw.githubusercontent.com/mr-devs/helios-test/main/data/nodes.json'

const edges_url = '../data/edges_hand_picked.json'
const nodes_url = '../data/nodes_hand_picked.json'

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
console.log(edges)

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

// Function for later
function sortByCount(anArray){
	let map = anArray.reduce((p, c)=>{
		p.set(c,(p.get(c) || 0) + 1);
		return p;
	}, new Map());

	let newArray = Array.from(map.keys()).sort((a, b)=>map.get(b)- map.get(a));
	return newArray;
}

// function CountOutDegreeFromEdges(array) {
//   var count = {};
//   array.forEach(val => count[val["source"]] = (count[val["source"]] || 0) + 1);
//   return count;
// }

// let sizeDictionary = CountOutDegreeFromEdges(edges)
// console.log("Size Dictionary")
// console.log(sizeDictionary)

// const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
// let sizeSum = sumValues(sizeDictionary)

// console.log("Size Sum")
// console.log(sizeSum)
// for (const [key, value] of Object.entries(nodes)) {
//     nodes[key]["size"] = Math.pow(Math.log(sizeDictionary[key])+1.5, 1.2);
// }

console.log("Nodes")
console.log(nodes)


// Set up some stuff for the network...
let colorProperty = "index";
let sequencialColormap = "interpolateInferno";
let categoricalColormap = "schemeCategory10";
let useCategoricalColormap = false;
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
console.log(allColors);
let colorScale = d3ScaleOrdinal(allColors.schemePRGn);


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
    //   let num_rts = sizeDictionary[node.ID];
    //   console.log(num_rts)
    //   if (typeof num_rts == 'undefined'){
    //       num_rts = 1
    //   }
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
        // let num_rts = sizeDictionary[node.ID];
        // console.log(num_rts);
        // if (typeof num_rts == 'undefined'){
        //     num_rts = 1
        // }
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

  // console.log(`End: ${node.ID}`);
})
.onNodeClick((node, event) => {
  console.log(`Clicked: ${node.ID}`);
})
.onNodeDoubleClick((node, event) => {
  console.log(`Double Clicked: ${node.ID}`);
  if("mag id" in node){
    window.open(`https://explore.openalex.org/works/W${node["mag id"]}`, "helios_mag");
  }else{
    // helios.centerOnNodes(node.ID); Why does this function break the visualization?
    let user_id = node.ID;
    window.open(
      'https://twitter.com/i/user/' + user_id,
      '_blank'
    );
    
  }
})
// .nodeColor(node=>{ 
//   let color = d3rgb(colorScale(node.community));
//   return [color.r/255,color.g/255,color.b/255];
// })
.backgroundColor(backgroundColor)
.nodeOutlineWidth(node=>node.size*defaultOutline)
.nodeOutlineColor(backgroundColor)
.additiveBlending(additiveBlending)
.edgesOpacity(0.2);
// .nodeColor(node=>{ // Example on how to define colors
			// 	let color = d3rgb(colorScale(node.ID));
			// 	// console.log(""+[color.r,color.g,color.b])
			// 	return [color.r/255,color.g/255,color.b/255];
			// })
			// .nodeSize(node=>{ // Example on how to define size
			// 	return Math.random()*5+1.0;
			// });
// .nodeSize(0.3);


let buttonInformation = {
  "Export": {
    name: "Export",
    mapColor: "#B1C3B6",
    color: "#008758",
    action: (selection,d,event) => {
      if(event.shiftKey){
        let pos = helios.network.positions;
        let postext = "" ;
        for(let i=0;i<pos.length;i+=3){
          postext+= `${pos[i]} ${pos[i+1]} ${pos[i+2]}\n`;
        }
        downloadText(networkName+"_positions.txt",postext);
      }else{
        console.log("Action!");
        let dpr = window.devicePixelRatio || 1;
        helios.exportFigure(networkName + ".png", {
          scale: 2.0,
          // width: 2048,
          // height: 2048,
          supersampleFactor: 2.0,
          backgroundColor: backgroundColor,
        });
      }
    },
    extra: selection => {
    }
  },
  "Size": {
    name: "Size",
    mapColor: "#AFB9C9",
    color: "#1E6099",
    action: null,
    extra: selection => {
      selection.append("input")
        .attr("type", "range")
        .attr("min", "-1")
        .attr("max", "1")
        .attr("step", "0.1")
        .attr("value", "0")
        .attr("id", "nodeSizeSlider")
        .classed("slider", true)
        .style("min-width", "60px")
        .on("input", (event, d) => {
          helios.nodeSize(Math.pow(10, parseFloat(d3Select("#nodeSizeSlider").property("value"))));
          helios.nodeOutlineWidth(node=>node.size*defaultOutline);
          helios.update();
          helios.render();
          event.stopPropagation();
        });
    }
  },
  "Color": {
    name: "Color",
    mapColor: "#AFB9C9",
    color: "#1E6099",
    action: null,
    extra: selection => {
      selection.append("select")
        .attr("id", "colorSelector")
        .classed("selector", true)
        .style("min-width", "60px")
        .on("change", (event, d) => {
          updateColorSelection();
        })
        .selectAll("option")
        .data(Object.entries(helios.network.index2Node[0]))
        .enter()
        .filter(d => !d[0].startsWith("_"))
        .filter(d => d[0] != "ID")
        .append("option")
        .attr("value", d => d[0])
        .property("selected", d => d[0] == colorProperty)
        .text(d => d[0]);

      selection.append("select")
        .attr("id", "colormapSelector")
        .classed("selector", true)
        .style("min-width", "60px");
      // .classed("slider",true)
      // 
      // .on("input", (event,d)=>{
      // 	helios.edgesOpacity(Math.pow(10,parseFloat(d3Select("#edgeOpacitySlider").property("value"))));
      // 	helios.update();
      // 	helios.render();
      // 	event.stopPropagation();
      // });
    }
  },
  "Edges": {
    name: "Edges",
    mapColor: "#B1A58C",
    color: "#903C22",
    action: null,
    extra: selection => {
      console.log("CALLED");
      selection.append("input")
        .attr("type", "range")
        .attr("min", "0")
        .attr("max", "1")
        .attr("step", (1 / 255) + "")
        .attr("value", "1")
        .attr("id", "edgeOpacitySlider")
        .classed("slider", true)
        .style("min-width", "60px")
        .on("input", (event, d) => {
          // helios.edgesOpacity(Math.pow(10,parseFloat(d3Select("#edgeOpacitySlider").property("value"))));
          helios.edgesOpacity(parseFloat(d3Select("#edgeOpacitySlider").property("value")));
          helios.update();
          helios.render();
          event.stopPropagation();
        });
    }
  },
}


function wrapText() {
  let width=300;
  let padding = 10
    let self = d3Select(this),
        textLength = self.node().getComputedTextLength(),
        text = self.text();
    while (textLength > (width - 2 * padding) && text.length > 0) {
        text = text.slice(0, -1);
        self.text(text + '...');
        textLength = self.node().getComputedTextLength();
    }
}
let legendView = d3Select("body").append("svg")
  .classed("overlay",true)
  .attr("id", "legendView")
  .style("left","10px")
  .style("top","10px")
  .style("pointer-events:","none")
let updateLegendCategorical = (property2color)=>{
  legendView.selectAll("*").remove();
  let legendItems = legendView.selectAll(".legend").data(property2color.keys());
  
  legendView
  .style("width", 350 + 'px')
  .style("height", (property2color.size+1)*20 + 'px');
  let legendEnter = legendItems.enter().append("g")
    .classed("legend", true)
    .attr("transform", (d, i) => ("translate(0," + (i * 20) + ")"));

  legendEnter.append("rect");
  legendEnter.append("g").append("text");
  legendItems = legendItems.merge(legendEnter)

  legendItems.select("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 15)
    .attr("fill", d => property2color.get(d));

  legendItems.select("g")
    .attr("transform", (d) => (`translate(${35},${15 / 2})`))
    .select("text")
    .style("alignment-baseline", "central")
    .style("font-size", "12px")
    .append('tspan')
    .style("alignment-baseline", "central")
    .text(d => d)
    .attr("fill",darkBackground?"white":"black")
    .each(wrapText)
}

function updateCategoricalColors(){
  let propertyArray = [];
  for (let [key, node] of Object.entries(helios.network.nodes)) {
    propertyArray.push(node[colorProperty]);
  }
  let sortedItems = sortByCount(propertyArray);
  // console.log(sortedItems);
  let scheme = allColors[categoricalColormap];
  // console.log("Scheme",scheme);
  let arraysCount = scheme.filter(Array.isArray).length;
  
  if(arraysCount>0){
    let firstIndex = scheme.findIndex(d=> (typeof d!=="undefined"));
    if(typeof scheme[sortedItems.length-1] !== "undefined"){
      scheme = scheme[sortedItems.length];
    }else{
      if(sortedItems.length-1<firstIndex){
        scheme = scheme[firstIndex];
      }else{
        scheme = scheme[scheme.length-1];
      }
    }
  }
  // let maxColors = const [lastItem] = arr.slice(-1)
  // console.log(scheme)
  let colorMap = d3ScaleOrdinal(scheme);
  let property2color = new Map();
  let categoricalMap = new Map();
  sortedItems.forEach((d, i) => {
    if(i<scheme.length){
      property2color.set(d,colorMap(d));
      categoricalMap.set(d,scheme[i]);
    }else{
      property2color.set(d,"#bbbbbb");;
    }
  });
  if(categoricalMap.size<sortedItems.length){
    categoricalMap.set("Other","#bbbbbb")
  }
  helios.nodeColor(node => {
    let color = d3rgb(property2color.get(node[colorProperty]));
    // console.log(""+[color.r,color.g,color.b])
    return [color.r/255,color.g/255,color.b/255];
  });
  helios.update();
  helios.render();
  updateLegendCategorical(categoricalMap)
}


function updateSequencialColors(){
  updateLegendCategorical(new Map());
  let propertyArray = [];
  let maxValue = -Infinity;
  let minValue = Infinity;
  for (let [key, node] of Object.entries(helios.network.nodes)) {
    propertyArray.push(node[colorProperty]);
    maxValue = Math.max(maxValue, node[colorProperty]);
    minValue = Math.min(minValue, node[colorProperty]);
  }
  let scheme = allColors[sequencialColormap];
  let cScale = d3ScaleSequential(scheme)
  .domain([minValue,maxValue]);
  helios.nodeColor(node => {
    let color = d3rgb(cScale(node[colorProperty]));
    // console.log(""+[color.r,color.g,color.b])
    return [color.r/255,color.g/255,color.b/255];
  });
  helios.update();
  helios.render();
}

let updateColormapSelection = () => {
  if (useCategoricalColormap) {
    categoricalColormap = d3Select("#colormapSelector").property("value");
    updateCategoricalColors();
  } else {
    sequencialColormap = d3Select("#colormapSelector").property("value");
    updateSequencialColors();
  }
}

let updateColorSelection = () => {
  colorProperty = d3Select("#colorSelector").property("value");
  let categorical = false;
  for (let [key, node] of Object.entries(helios.network.nodes)) {
    if (typeof node[colorProperty] !== 'number') {
      categorical = true;
      // console.log(colorProperty,node);
      break;
    }
  }
  useCategoricalColormap = categorical;
  console.log(categorical ? "categorical" : "continuous");
  let colormapSelector = d3Select("#colormapSelector")
    .classed("selector", true)
    .style("min-width", "60px")
    .on("change", (event, d) => {
      updateColormapSelection();
    })
    .selectAll("option")
    .data(Object.entries(allColors).filter(d => d[0].startsWith(categorical ? "scheme" : "interpolate")))
    .join("option")
    .attr("value", d => d[0])
    .property("selected", d => d[0] == (categorical ? categoricalColormap : sequencialColormap))
    .text(d => d[0].replace("interpolate", "").replace("scheme", ""));
  updateColormapSelection();
}

let buttonOrder = ["Export", "Size", "Color", "Edges",];

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
// helios.onReady(() => {
//   updateColorSelection();
// });

// helios.onReady(() => {
//   helios.zoomFactor(0.05);
//   helios.zoomFactor(30, 8000);
// });
