const { app, BrowserWindow } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
log.transports.file.resolvePath = () =>
  path.join("C:Onee drive datailearn android apk", "/logs/main.log");
log.log("Application version:" + app.getVersion());
log.info("Hello, log");
log.warn("Some problems appears");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });
  win.setMenuBarVisibility(true);

  win.loadFile(path.join(__dirname, "./dist/index.html"));

  // Force reload the app after it has initially loaded
  win.webContents.once("did-finish-load", () => {
    setTimeout(() => {
      win.webContents.reload();
    }, 1000); // Adjust the timeout duration as needed
  });
}

app.on("ready", () => {
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("checking-for-update", () => {
  log.info("checking-for-update");
  console.log("checking-for-update");
});
autoUpdater.on("update-available", () => {
  log.info("update-available");
  console.log("update-available");
});
autoUpdater.on("download-progress", () => {
  log.info("download-progress");
  console.log("download-progress");
});

autoUpdater.on("download-progress", (progressTrack) => {
  log.info("\n\ndownload-progress");
  log.info(progressTrack);
  console.log("\n\ndownload-progress");
});
autoUpdater.on("update-downloaded", () => {
  log.info("update-downloaded");
  console.log("update-downloaded");
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
