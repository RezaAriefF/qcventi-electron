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
  // type: "spline",
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
  // type: "spline",
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

parser.on("data", (line) => {
  try {
    const json = JSON.parse(line); //get data from json
    ping = json.ping; //set ping from arduino
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
      intervalId = setInterval(() => {
        // PRESSURE
        // redraw time series axis in every second
        chartPressure.axis.min({ x: timeTail() });
        chartPressure.axis.max({ x: timeNow() });

        chartDataPressure.columns[0].push(timeNow());
        chartDataPressure.columns[1].push(pressure);

        chartPressure.load({ columns: chartDataPressure.columns });
        // FLOW
        chartFlow.axis.min({ x: timeTail() });
        chartFlow.axis.max({ x: timeNow() });

        chartDataFlow.columns[0].push(timeNow());
        chartDataFlow.columns[1].push(flow);

        chartFlow.load({ columns: chartDataFlow.columns });
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
