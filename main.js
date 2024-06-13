const { app, BrowserWindow } = require("electron");

app.whenReady().then(() => {
  const window = new BrowserWindow({
    fullscreen: true,
  });

  window.loadFile("./src/index.html");
});
