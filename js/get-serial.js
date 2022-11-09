// const { parse } = require("path");
// const SerialPort = require("serialport").SerialPort;
// const { ReadlineParser } = require("@serialport/parser-readline");
// const port = new SerialPort({ baudRate: 115200, path: "COM9" });

// const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

// // praserFlow.on("data", (serialFlow) => {
// //   console.log(serialFlow);
// //   document.getElementById("sFlow").innerHTML = serialFlow;
// // });
// let flow = 0,
//   pressure = 0;

// parser.on("data", (line) => {
//   try {
//     const json = JSON.parse(line);
//     pressure = json.pressure;
//     flow = json.flow;
//   } catch (e) {
//     console.log(e);
//   }
//   document.getElementById("sPressure").innerHTML = pressure;
//   document.getElementById("sFlow").innerHTML = flow;
// });
