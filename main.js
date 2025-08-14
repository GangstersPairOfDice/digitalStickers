// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, screen } = require("electron");
const path = require("node:path");

let win;
let intervalId;

const createWindow = () => {
  // Create the browser window.
  win = new BrowserWindow({
    icon: "images/icons/digitalstickers.png",
    titleBarStyle: "customButtonsOnHover", // removes border & adds button
    //titleBarOverlay: true,
    transparent: true, // makes the window transparent
    alwaysOnTop: true,
    //type: "panel",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  //app.dock.show();
  win.setResizable(false);
  //win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  //win.setHasShadow(false);

  // and load the index.html of the app.
  win.loadFile("index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  intervalId = setInterval(() => {
    const point = screen.getCursorScreenPoint();
    const [x, y] = win.getPosition();
    const [w, h] = win.getSize();

    if (point.x > x && point.x < x + w && point.y > y && point.y < y + h) {
      updateIgnoreMouseEvents(point.x - x, point.y - y);
    }
  }, 300);

  win.on("closed", () => {
    clearInterval(intervalId); // <--- Clear the interval
    win = null;
  });

  const updateIgnoreMouseEvents = async (x, y) => {
    //console.log("updateIgnoreMouseEvents");

    // capture 1x1 image of mouse position.
    const image = await win.webContents.capturePage({
      x,
      y,
      width: 1,
      height: 1,
    });

    var buffer = image.getBitmap();

    // Calculate point.x and point.y
    const mousePos = screen.getCursorScreenPoint();

    // Check if cursor is within the close button region
    const buttonRegion = {
      x: win.getPosition()[0],
      y: win.getPosition()[1],
      width: 60, // adjust this value to match your button's width
      height: 21, // adjust this value to match your button's height
    };

    if (
      mousePos.x >= buttonRegion.x &&
      mousePos.x <= buttonRegion.x + buttonRegion.width &&
      mousePos.y >= buttonRegion.y &&
      mousePos.y <= buttonRegion.y + buttonRegion.height
    ) {
      win.setIgnoreMouseEvents(false); // allow clicks on close button region
      //console.log("setIgnoreMouseEvents", false);
    } else {
      // set ignore mouse events by alpha.
      win.setIgnoreMouseEvents(buffer[3] < 10);
      //console.log("setIgnoreMouseEvents", !buffer[3]);
    }
  };
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
