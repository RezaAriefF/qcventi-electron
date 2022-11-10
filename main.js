// const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { app, BrowserWindow, dialog, ipcMain, ipcRenderer } = require("electron");
const createWindow = () => {
  const win = new BrowserWindow({
    resizable: true,
    // width: 1440,
    // height: 1006,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // win.webContents.session.on(
  //   "select-serial-port",
  //   (event, portList, webContents, callback) => {
  //     win.webContents.session.on("serial-port-added", (event, port) => {
  //       alert("WANJIR MASUK");
  //     });
  //     win.webContents.session.on("serial-port-removed", (event, port) => {
  //       alert("WANJIR METU");
  //     });
  //   }
  // );
  win.maximize();
  win.loadFile("index.html");
  win.on('close', function(e) {
    // import dialog terlebih dahulu pada module electron
    const choice = dialog.showMessageBoxSync(this,
    {
        type: 'question', 
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Are you sure you want to quit?'
    });
    if (choice === 1) {
        e.preventDefault();
    }
});

};
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);
// app.on("ready", mainWindow.maximaze());

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    
    app.quit();
  }
});

// app.on('resized', () => {
//   console.log("window berubah ukurannya")
// });

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
