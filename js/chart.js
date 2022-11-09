//Parsing Data
const { parse } = require("path"); //detect port
const SerialPort = require("serialport").SerialPort; //lib serialport(npm)
const { ReadlineParser } = require("@serialport/parser-readline"); //read serialport
const port = new SerialPort({ baudRate: 115200, path: "COM9" }); //define port

const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" })); //parsing (memisahkan data)

let flow = 0,
  pressure = 0; //define flow and pressure (int)

function getInputValue() {
  // Selecting the input element and get its value
  var inputVal = document.getElementById("inPressure").value;
  // Displaying the value
  // var obj1 = { pressure: inputVal };
  // const json = JSON.stringify(obj1);
  alert(inputVal);
}
//send data to serial port
port.write(inputVal);

parser.on("data", (line) => {
  try {
    const json = JSON.parse(line); //get data from json
    pressure = json.pressure; //define pressure to json
    flow = json.flow; //define flow to json
  } catch (e) {
    //if error
    console.log(e);
  }
  document.getElementById("sPressure").innerHTML = pressure; //send pressure value to sPressure
  document.getElementById("sFlow").innerHTML = flow; //send flow value to sFlow
});

const dayjs = require("./class/day"); //lib day js
const timeNow = () => dayjs().format("YYYY-MM-DD HH:mm:ss"); //format time now
const timeTail = () => dayjs().subtract(10, "s").format("YYYY-MM-DD HH:mm:ss"); //number of times displayed
//src : https://codepen.io/nagitch/pen/rNMrXNw
const chartAxis = {
  x: {
    type: "timeseries",
    min: timeTail(),
    max: timeNow(),
    tick: {
      fit: false,
      rotate: -50,
      format: "%H:%M:%S",
    },
  },
};

const chartDataPressure = {
  type: "spline",
  x: "x",
  xFormat: "%Y-%m-%d %H:%M:%S",
  columns: [["x"], ["Pressure"]],
  colors: {
    Pressure: "#24D4EC",
  },
};

let chartPressure = c3.generate({
  bindto: "#chartPressure",
  data: chartDataPressure,
  axis: chartAxis,
  grid: {
    y: {
      lines: [
        { value: 100 },
        { value: 200 },
        { value: 300 },
        { value: 400 },
        { value: 500 },
      ],
    },
  },
});

const chartDataFlow = {
  type: "spline",
  x: "x",
  xFormat: "%Y-%m-%d %H:%M:%S",
  columns: [["x"], ["Flow"]],
  colors: {
    Flow: "#85E426",
  },
};

let chartFlow = c3.generate({
  bindto: "#chartFlow",
  data: chartDataFlow,
  axis: chartAxis,
  grid: {
    y2: {
      lines: [{ value: 2 }, { value: 4 }],
    },
  },
});

setInterval(() => {
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
}, 1000);
