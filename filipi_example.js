let affectedColorMode = false;
//switch between colormodes:

//set colors for each colormode:
helios.network.nodes

// let mode = "mode 1"

let colorScaleMode1 =  d3.ordinal(d3.schemeCategory10);
let colorScaleMode2 =  d3.ordinal(d3.schemeCategory10);

let affected2Color = {};

affected2Color[0] = d3rgb("...");
affected2Color[1] = d3rgb("...");
affected2Color[2] = d3rgb("...");
affected2Color[3] = d3rgb("...");


updateColors = () => {
    let mode  = document.getElementById("modeSelector").value
    helios.nodeColor(node=> {
        let color;
        if (mode == "mode 1") {
            if(node.affected){
                color = d3rgb("red");
            }else{
                color = d3rgb("yellow");
            }
        }else{
            color = affected2Color(node.affectedMode2);
        }

        return [color.r, color.g, color.b];
    })
    helios.update();
    helios.render();
}