// const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { app, BrowserWindow, dialog } = require("electron");
const createWindow = () => {
  const win = new BrowserWindow({
    // resizable: false,
    icon: "build/iconqc.ico",
    width: 1920,
    height: 1080,
    show: false,
    webPreferences: {
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");

  var splash = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: "build/iconqc.ico",
    // fullscreen: true,
    center: true,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
  });

  splash.loadFile("splashscreen.html");
  splash.center();
  setTimeout(function () {
    splash.close();
    win.center();
    win.show();
  }, 4000);

  win.on("close", function (e) {
    // import dialog terlebih dahulu pada module electron
    const choice = dialog.showMessageBoxSync(this, {
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirm",
      message: "Are you sure you want to quit?",
    });
    if (choice === 1) {
      e.preventDefault();
    }
  });
  // win.maximize();
  win.loadFile("index.html");
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
