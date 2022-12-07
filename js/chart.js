//Parsing Data
const { parse } = require("path"); //detect port
const SerialPort = require("serialport").SerialPort; //lib serialport(npm)
const { ReadlineParser } = require("@serialport/parser-readline"); //read serialport
const port = new SerialPort({ baudRate: 9600, path: "COM9" }); //define port;

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" })); //parsing (memisahkan data)

let switchBtn = false;
let flow = -1, //define flow and pressure (int)
  pressure = -1,
  pressure2 = -1;
let btnVal = ""; // define button as string

const lowerLimitY = 500; //Minimum Y value
// const xSecond = 8   //X Axis
// const xTick = xSecond * Math.floor(Math.random() * 100);
const xTick = 1000; // X Axis tick
let dataflow = [];
let datapressure = [];
// const realWidthInt = 800;
// const realWidth = realWidthInt + "px";
// const realHeightInt = 330;
// const realHeight = realHeightInt + "px";

const realWidthInt = 95;
const realWidth = realWidthInt + "%";
const realHeightInt = 330;
const realHeight = realHeightInt + "px";
let svgFlow, svgPressure, xAxis, maxValue, y, x;
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

  xAxis = d3.axisBottom(x).tickFormat((d, i) => Math.ceil(d) / 50);

  svgFlow
    .append("g")
    .attr("transform", "translate(50, 280)")
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "translate(0,0)")
    .style("text-anchor", "center");

  svgPressure
    .append("g")
    .attr("transform", "translate(50, 280)")
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "translate(0,0)")
    .style("text-anchor", "center");

  // draw y axis
  maxValue = Math.max(...dataflow);
  maxValue = Math.ceil(maxValue); //Math.ceil(0.9) == 1 , Math.ceil(12.5) == 12

  y = d3
    .scaleLinear()
    .domain([maxValue < lowerLimitY ? lowerLimitY : maxValue, 0])
    .range([0, 280]);

  svgFlow
    .append("g")
    .attr("transform", "translate(50, 0)")
    .attr("class", "flowGraph-yAxis")
    .call(d3.axisLeft(y));

  svgPressure
    .append("g")
    .attr("transform", "translate(50, 0)")
    .attr("class", "pressureGraph-yAxis")
    .call(d3.axisLeft(y));

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
        .y((d) => y(d || 0))
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
        .x((d, i) => x(i))
        .y((d) => y(d || 0))
    );

  // draw bar
  svgFlow
    .append("rect")
    .attr("class", "flowGraph-rect")
    .attr("transform", "translate(50,0)")
    .attr("x", (d, i) => x(i))
    .attr("y", -1)
    .attr("fill", "#FFFFFF")
    .attr("width", 10)
    .attr("height", realHeightInt - 50);

  svgPressure
    .append("rect")
    .attr("class", "pressureGraph-rect")
    .attr("transform", "translate(50,0)")
    .attr("x", (d, i) => x(i))
    .attr("y", -1)
    .attr("fill", "#FFFFFF")
    .attr("width", 10)
    .attr("height", realHeightInt - 50);
}

// fungsi button reset
function resetFunction() {
  document.getElementById("inPressure").value = 0;
  document.getElementById("inPeep").value = 0;
  document.getElementById("setTimer").value = 0;
}

function update(flowData, pressureData) {
  maxFlowVal = Math.max(...flowData.map((dt) => dt));
  maxFlowVal = Math.ceil(maxFlowVal);

  maxPressureVal = Math.max(...pressureData.map((dt) => dt));
  maxPressureVal = Math.ceil(maxPressureVal);

  yFlow = d3
    .scaleLinear()
    .domain([maxFlowVal < lowerLimitY ? lowerLimitY : maxFlowVal, 0])
    .range([0, 280]);

  yPressure = d3
    .scaleLinear()
    .domain([maxPressureVal < lowerLimitY ? lowerLimitY : maxPressureVal, 0])
    .range([0, 280]);

  svgFlow
    .select(".flowGraph-yAxis")
    .transition()
    .duration(0.03)
    .call(d3.axisLeft(y));

  svgPressure
    .select(".pressureGraph-yAxis")
    .transition()
    .duration(0.03)
    .call(d3.axisLeft(y));

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
        .y((d) => y(d || 0))
    );
  pathPressure
    .transition()
    .duration(1)
    .attr(
      "d",
      d3
        .line()
        .x((d, i) => x(i))
        .y((d) => y(d || 0))
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
  barPressure.transition().duration(1).attr("x", x(currentIndex));

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
      alert("PORT NOT READY");
    } else if (inputPressure == 0 || inputPeep == 0) {
      alert("Target and PEEP have not been set");
    } else {
      document.getElementById("pressureBtn").innerHTML = "STOP"; // change button value to stop
      btnVal = "*START";
      port.write(btnVal);
      port.write("$");
      port.write(inputPressure);
      port.write("$");
      port.write(inputPeep);
      port.write("#");
      loop();
    }
  } else {
    // document.getElementById("sPressure").innerHTML = 0;
    // document.getElementById("sFlow").innerHTML = 0;
    // document.getElementById("inPressure").innerHTML = 0;
    // document.getElementById("inPeep").innerHTML = 0;
    document.getElementById("pressureBtn").innerHTML = "START"; // change button value to start
    btnVal = "*STOP";
    port.write(btnVal);
    port.write("#");
  }
}

// const dayjs = require("./class/day"); //lib day js
// const { platform } = require("os");

// const timeNow = () => dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"); //format time now
// const timeTail = () =>
//   dayjs().subtract(10, "s").format("YYYY-MM-DD HH:mm:ss.SSS"); //number of times displayed
// //src : https://codepen.io/nagitch/pen/rNMrXNw
// const chartAxis = {
//   x: {
//     type: "timeseries",
//     min: timeTail(),
//     max: timeNow(),
//     tick: {
//       fit: false,
//       rotate: -50,
//       format: "%S",
//     },
//   },
// };

// const chartDataPressure = {
//   // type: "spline",
//   x: "x",
//   xFormat: "%Y-%m-%d %H:%M:%S.%L",
//   columns: [["x"], ["Pressure"]],
//   colors: {
//     Pressure: "#24D4EC",
//   },
// };

// let chartPressure = c3.generate({
//   bindto: "#chartPressure",
//   data: chartDataPressure,
//   axis: chartAxis,
// });

// const chartDataFlow = {
//   // type: "spline",
//   x: "x",
//   xFormat: "%Y-%m-%d %H:%M:%S.%L", // format millisecond
//   columns: [["x"], ["Flow"]],
//   colors: {
//     Flow: "#85E426",
//   },
// };

// let chartFlow = c3.generate({
//   bindto: "#chartFlow",
//   data: chartDataFlow,
//   axis: chartAxis,
// });

// parser.on("data", (line) => {
//   try {
//     const json = JSON.parse(line); //get data from json
//     // ping = json.ping; //set ping from arduino
//     pressure = json.pressure; //define pressure to json
//     flow = json.flow; //define flow to json
//   } catch (e) {
//     //if error
//     console.log(e);
//   }
// });

// function chartFunction() {
//   switchBtn = !switchBtn;
//   let inputPressure = document.getElementById("inPressure").value;
//   let inputPeep = document.getElementById("inPeep").value;

//   if (switchBtn) {
//     if (flow == -1 || pressure == -1) {
//       alert("PORT NOT READY");
//     }
//     if (inputPressure == 0 || inputPeep == 0) {
//       alert("Target and PEEP have not been set");
//     } else {
//       document.getElementById("pressureBtn").innerHTML = "STOP"; // change button value to stop
//       btnVal = "*START";
//       port.write(btnVal);
//       port.write("$");
//       port.write(inputPressure);
//       port.write("$");
//       port.write(inputPeep);
//       port.write("#");

//       // drawWave();

//       intervalId = setInterval(() => {
//         // PRESSURE
//         // redraw time series axis in every second
//         chartPressure.axis.min({ x: timeTail() });
//         chartPressure.axis.max({ x: timeNow() });

//         chartDataPressure.columns[0].push(timeNow());
//         chartDataPressure.columns[1].push(pressure);

//         chartPressure.load({ columns: chartDataPressure.columns });
//         // FLOW
//         chartFlow.axis.min({ x: timeTail() });
//         chartFlow.axis.max({ x: timeNow() });

//         chartDataFlow.columns[0].push(timeNow());
//         chartDataFlow.columns[1].push(flow);

//         chartFlow.load({ columns: chartDataFlow.columns });
//         document.getElementById("sPressure").innerHTML = pressure.toFixed(2); //send pressure value to sPressure
//         document.getElementById("sFlow").innerHTML = flow.toFixed(2); //send flow value to sFlow
//       }, 30);
//     }
//   } else {
//     clearInterval(intervalId); //reset interval
//     document.getElementById("pressureBtn").innerHTML = "START"; // change button value to start
//     btnVal = "*STOP";
//     port.write(btnVal);
//     port.write("#");
//     // drawWave();
//     document.getElementById("sPressure").innerHTML = 0;
//     document.getElementById("sFlow").innerHTML = 0;
//   }
// }
