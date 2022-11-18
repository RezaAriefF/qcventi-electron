//Parsing Data
const { parse } = require("path"); //detect port
const SerialPort = require("serialport").SerialPort; //lib serialport(npm)
const { ReadlineParser } = require("@serialport/parser-readline"); //read serialport
const port = new SerialPort({ baudRate: 9600, path: "COM9" }); //define port;

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" })); //parsing (memisahkan data)

let switchBtn = false;
let intervalId = 0;
let flow = -1, //define flow and pressure (int)
  pressure = -1;
let btnVal = ""; // define button as string

const dayjs = require("./class/day"); //lib day js

const timeNow = () => dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"); //format time now
const timeTail = () =>
  dayjs().subtract(10, "s").format("YYYY-MM-DD HH:mm:ss.SSS"); //number of times displayed
//src : https://codepen.io/nagitch/pen/rNMrXNw
const chartAxis = {
  x: {
    type: "timeseries",
    min: timeTail(),
    max: timeNow(),
    tick: {
      fit: false,
      rotate: -50,
      format: "%S",
    },
  },
};

const chartDataPressure = {
  type: "spline",
  x: "x",
  xFormat: "%Y-%m-%d %H:%M:%S.%L",
  columns: [["x"], ["Pressure"]],
  colors: {
    Pressure: "#24D4EC",
  },
};

let chartPressure = c3.generate({
  bindto: "#chartPressure",
  data: chartDataPressure,
  axis: chartAxis,
});

const chartDataFlow = {
  type: "spline",
  x: "x",
  xFormat: "%Y-%m-%d %H:%M:%S.%L", // format millisecond
  columns: [["x"], ["Flow"]],
  colors: {
    Flow: "#85E426",
  },
};

let chartFlow = c3.generate({
  bindto: "#chartFlow",
  data: chartDataFlow,
  axis: chartAxis,
});

var EcgData = ["905,275,923,950,275,979,997,275,1033,1090,1157,1232,1320,1398"];

var canvas = document.getElementById("chartFlow");
var ctx = canvas.getContext("2d");
var w = canvas.width,
  h = canvas.height,
  speed = 1,
  scanBarWidth = 20,
  i = 0,
  data = EcgData[0].split(","),
  color = "#85e426";
var px = 0;
var opx = 0;
var py = h / 2;
var opy = py;
ctx.strokeStyle = color;
ctx.lineWidth = 3;
ctx.setTransform(1, 0, 0, -1, 0, h);

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function drawWave() {
  px += speed;
  ctx.clearRect(px, 0, scanBarWidth, h);
  ctx.beginPath();
  ctx.moveTo(opx, opy);
  ctx.lineJoin = "round";
  // py = data[++i >= data.length ? (i = 0) : i++] / 450 + 10;
  // py = getRandomArbitrary(0, 100);
  py = flow.toFixed(2);
  console.log(1212121, (flow.toFixed(2) - 100) * 5, flow.toFixed(2));
  ctx.lineTo(px, py);
  ctx.stroke();
  opx = px;
  opy = py;
  if (opx > w) {
    px = opx = -speed;
  }

  requestAnimationFrame(drawWave);
}

parser.on("data", (line) => {
  try {
    const json = JSON.parse(line); //get data from json
    // ping = json.ping; //set ping from arduino
    pressure = json.pressure; //define pressure to json
    flow = json.flow; //define flow to json
  } catch (e) {
    //if error
    console.log(e);
  }
});

function chartFunction() {
  switchBtn = !switchBtn;
  let inputPressure = document.getElementById("inPressure").value;
  let inputPeep = document.getElementById("inPeep").value;

  if (switchBtn) {
    if (flow == -1 || pressure == -1) {
      alert("PORT NOT READY");
    }
    if (inputPressure == 0 || inputPeep == 0) {
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

      drawWave();

      intervalId = setInterval(() => {
        // drawWave();
        // // PRESSURE
        // // redraw time series axis in every second
        // chartPressure.axis.min({ x: timeTail() });
        // chartPressure.axis.max({ x: timeNow() });

        // chartDataPressure.columns[0].push(timeNow());
        // chartDataPressure.columns[1].push(pressure);

        // chartPressure.load({ columns: chartDataPressure.columns });
        // // FLOW
        // chartFlow.axis.min({ x: timeTail() });
        // chartFlow.axis.max({ x: timeNow() });

        // chartDataFlow.columns[0].push(timeNow());
        // chartDataFlow.columns[1].push(flow);

        // chartFlow.load({ columns: chartDataFlow.columns });
        // drawWave();
        // (pressure.toFixed(2) - 500) / 2;
        document.getElementById("sPressure").innerHTML = pressure.toFixed(2); //send pressure value to sPressure
        document.getElementById("sFlow").innerHTML = flow.toFixed(2); //send flow value to sFlow
      }, 30);
    }
  } else {
    clearInterval(intervalId); //reset interval
    document.getElementById("pressureBtn").innerHTML = "START"; // change button value to start
    btnVal = "*STOP";
    port.write(btnVal);
    port.write("#");
    document.getElementById("sPressure").innerHTML = 0;
    document.getElementById("sFlow").innerHTML = 0;
  }
}
