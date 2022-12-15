//Parsing Data
const { parse } = require("path"); //detect port
const SerialPort = require("serialport").SerialPort; //lib serialport(npm)
const { ReadlineParser } = require("@serialport/parser-readline"); //read serialport
const port = new SerialPort({ baudRate: 9600, path: "COM10" }); //define port;

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" })); //parsing (memisahkan data)

let switchBtn = false;
let flow = -1, //define flow and pressure (int)
  pressure = -1,
  pressure2 = -1;
let btnVal = ""; // define button as string

const limitYF = 10; //Minimum Y value
const limitYP = 400;
const xTick = 1000; // X Axis tick
let dataflow = [];
let datapressure = [];
const realWidthInt = 95;
const realWidth = realWidthInt + "%";
const realHeightInt = 330;
const realHeight = realHeightInt + "px";
let svgFlow, svgPressure, xflow, xpressure, x, x1, yflow, ypressure;
let currentIndex = 0;

parser.on("data", (line) => {
  try {
    const json = JSON.parse(line); //get data from json
    pressure2 = json.pressure2;
    pressure = json.pressure; //define pressure to json
    flow = json.flow; //define flow to json
  } catch (e) {
    //if error
    console.log(e);
  }
});

function draw() {
  // draw svg
  svgFlow = d3
    .select(`#flowGraph`)
    .append("svg")
    .attr("id", `flowGraph-svg`)
    .attr("width", realWidth) //lebar
    .attr("height", realHeight) //tinggi
    .append("g"); //svg element

  svgPressure = d3
    .select(`#pressureGraph`)
    .append("svg")
    .attr("id", `pressureGraph-svg`)
    .attr("width", realWidth) //lebar
    .attr("height", realHeight) //tinggi
    .append("g"); //svg element

  // draw x axis
  x = d3
    .scaleLinear()
    .domain([0, xTick]) //The domain is the complete set of values
    .range([1, 730]); //The range is the set of resulting values of a function / jarak antar X tick

  x1 = d3
    .scaleLinear()
    .domain([0, xTick]) //The domain is the complete set of values
    .range([1, 730]); //The range is the set of resulting values of a function / jarak antar X tick

  xflow = d3.axisBottom(x).tickFormat((d, i) => Math.ceil(d) / 50);
  xpressure = d3.axisBottom(x1).tickFormat((e, j) => Math.ceil(e) / 50);

  svgFlow
    .append("g")
    .attr("transform", "translate(50, 280)")
    .call(xflow)
    .selectAll("text")
    .attr("transform", "translate(0,0)")
    .style("text-anchor", "center");

  svgPressure
    .append("g")
    .attr("transform", "translate(50, 280)")
    .call(xpressure)
    .selectAll("text")
    .attr("transform", "translate(0,0)")
    .style("text-anchor", "center");

  // draw y axis
  flowVal = Math.max(...dataflow);
  flowVal = Math.ceil(flowVal); //Math.ceil(0.9) == 1 , Math.ceil(12.5) == 12

  presVal = Math.max(...datapressure);
  presVal = Math.ceil(presVal); //Math.ceil(0.9) == 1 , Math.ceil(12.5) == 12

  yflow = d3
    .scaleLinear()
    .domain([flowVal < limitYF ? limitYF : flowVal, 0]) //dinamic flow
    .range([0, 280]);

  ypressure = d3
    .scaleLinear()
    .domain([presVal < limitYP ? limitYP : presVal, 0]) //dinamic pressure
    .range([0, 280]);

  svgFlow
    .append("g")
    .attr("transform", "translate(50, 0)")
    .attr("class", "flowGraph-yAxis")
    .call(d3.axisLeft(yflow));

  svgPressure
    .append("g")
    .attr("transform", "translate(50, 0)")
    .attr("class", "pressureGraph-yAxis")
    .call(d3.axisLeft(ypressure));

  // draw line
  svgFlow
    .append("path")
    .datum(dataflow)
    .attr("class", "flowGraph-lineTest")
    .attr("fill", "none")
    .attr("stroke", "#85e426")
    .attr("stroke-width", 1.5)
    .attr("transform", "translate(50,0)")
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => x(i))
        .y((d) => yflow(d || 0))
    );

  svgPressure
    .append("path")
    .datum(datapressure)
    .attr("class", "pressureGraph-lineTest")
    .attr("fill", "none")
    .attr("stroke", "#24d4ec")
    .attr("stroke-width", 1.5)
    .attr("transform", "translate(50,0)")
    .attr(
      "d",
      d3
        .line()
        .x((e, j) => x1(j))
        .y((e) => ypressure(e || 0))
    );

  // draw bar
  svgFlow
    .append("rect")
    .attr("class", "flowGraph-rect")
    .attr("transform", "translate(50,0)")
    .attr("x", (d, i) => x(i))
    .attr("y", 0)
    .attr("fill", "#FFFFFF")
    .attr("width", 10)
    .attr("height", realHeightInt - 50);

  svgPressure
    .append("rect")
    .attr("class", "pressureGraph-rect")
    .attr("transform", "translate(50,0)")
    .attr("x", (e, j) => x(j))
    .attr("y", 0)
    .attr("fill", "#FFFFFF")
    .attr("width", 10)
    .attr("height", realHeightInt - 50);
}

// fungsi button reset
function resetFunction() {
  tombol = document.getElementById("pressureBtn").innerHTML;
  if (tombol == "START") {
    document.getElementById("inPressure").value = 0;
    document.getElementById("inPeep").value = 0;
    document.getElementById("setTimer").value = 0;
  }
}

function update(flowData, pressureData) {
  flowVal = Math.max(...flowData.map((dt) => dt));
  flowVal = Math.ceil(flowVal);

  presVal = Math.max(...pressureData.map((dtt) => dtt));
  presVal = Math.ceil(presVal);

  yflow = d3
    .scaleLinear()
    .domain([flowVal < limitYF ? limitYF : flowVal, 0]) //dinamic flow
    .range([0, 280]);

  ypressure = d3
    .scaleLinear()
    .domain([presVal < limitYP ? limitYP : presVal, 0]) //dinamic pressure
    .range([0, 280]);

  svgFlow
    .select(".flowGraph-yAxis")
    .transition()
    .duration(0.03)
    .call(d3.axisLeft(yflow));

  svgPressure
    .select(".pressureGraph-yAxis")
    .transition()
    .duration(0.03)
    .call(d3.axisLeft(ypressure));

  // update line data
  var pathFlow = d3.select(".flowGraph-lineTest").datum(flowData);
  var pathPressure = d3.select(".pressureGraph-lineTest").datum(pressureData);

  // enter selection on line
  pathFlow.enter().append("path");
  pathPressure.enter().append("path");

  // update selection on line
  pathFlow
    .transition()
    .duration(1)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => x(i))
        .y((d) => yflow(d || 0))
    );

  pathPressure
    .transition()
    .duration(1)
    .attr(
      "d",
      d3
        .line()
        .x((e, j) => x1(j))
        .y((e) => ypressure(e || 0))
    );
  // exit selection on line
  pathFlow.exit().remove();
  pathPressure.exit().remove();

  // update bar data
  var barFlow = d3.select(".flowGraph-rect").datum(flowData);
  var barPressure = d3.select(".pressureGraph-rect").datum(pressureData);

  // enter selection on line
  barFlow.enter().append("rect");
  barPressure.enter().append("rect");

  // update selection on line
  barFlow.transition().duration(1).attr("x", x(currentIndex));
  barPressure.transition().duration(1).attr("x", x1(currentIndex));

  // exit selection on line
  barFlow.exit().remove();
  barPressure.exit().remove();
}

var isChecked = false;

function slideBtn() {
  isChecked = !isChecked;
  currentIndex = 0;
  dataflow = [];
  datapressure = [];
  if (!isChecked) {
    document.getElementById("title-pressure").innerHTML = "Pressure Sensor 1";
  } else {
    document.getElementById("title-pressure").innerHTML = "Pressure Sensor 2";
  }
}

function loop() {
  let interval = setInterval(() => {
    currentIndex++;
    dataflow.splice(currentIndex % xTick, 1, flow);
    document.getElementById("sFlow").innerHTML = flow;
    if (isChecked) {
      datapressure.splice(currentIndex % xTick, 1, pressure2);
      document.getElementById("sPressure").innerHTML = pressure2;
    } else {
      datapressure.splice(currentIndex % xTick, 1, pressure);
      document.getElementById("sPressure").innerHTML = pressure;
    }

    update(dataflow, datapressure);
    if (currentIndex >= xTick) {
      currentIndex = 0;
    }
    if (btnVal == "*STOP") {
      clearInterval(interval);
    }
  }, 20);
}
draw();
function chartFunction() {
  switchBtn = !switchBtn;
  let inputPressure = document.getElementById("inPressure").value;
  let inputPeep = document.getElementById("inPeep").value;

  if (switchBtn) {
    if (flow == -1 || pressure == -1) {
      //port not connected
      alert("PORT NOT READY");
    } else if (inputPressure == 0 || inputPeep == 0) {
      //port connected
      alert("Target and PEEP have not been set");
    } else {
      // port connected and target and PEEP have been set
      document.getElementById("pressureBtn").innerHTML = "STOP"; // change button value to stop
      btnVal = "*START";
      port.write(btnVal); //send data START to Arduino
      port.write("$"); //delimiter from Arduino
      port.write(inputPressure); //data pressure
      port.write("$"); //delimiter from Arduino
      port.write(inputPeep); //data peep
      port.write("#");
      loop();
    }
  } else {
    document.getElementById("pressureBtn").innerHTML = "START"; // change button value to start
    btnVal = "*STOP";
    port.write(btnVal);
    port.write("#");
  }
}
