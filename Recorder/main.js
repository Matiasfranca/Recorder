const { app, BrowserWindow, Menu, ipcMain, shell, dialog } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");
const Store = require("./Store")

const preferences = new Store({
    configName: 'user-preferences',
    defaults: {
        destination: path.join(os.homedir(), "Music", "audios")
    }
})

let destination = preferences.get("destination")
const isDev = process.env.NODE_DEV !== undefined && process.env.NODE_DEV === "development" ? true : false

function createPreferenceWindow() {
    const preferenceWindow = new BrowserWindow({
        width: isDev ? 900 : 500,
        resizable: isDev ? true : false,
        height: isDev ? 600 : 300,
        backgroundColor: "#234",
        show: false,
        icon: path.join(__dirname, "assets", "icons", "icon.png"),
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
        }
    })

    preferenceWindow.loadFile(path.join(__dirname, "src", "preferences", "index.html"));
    if (isDev) preferenceWindow.webContents.openDevTools();

    preferenceWindow.once("ready-to-show", () => {
        preferenceWindow.show()
        preferenceWindow.webContents.send("dest-path-update", destination);
    })
}

function createWindow() {
    const win = new BrowserWindow({
        width: isDev ? 900 : 700,
        resizable: isDev ? true : false,
        height: isDev ? 600 : 500,
        backgroundColor: "#234",
        show: false,
        icon: path.join(__dirname, "assets", "icons", "icon.png"),
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
        }
    })

    win.loadFile(path.join(__dirname, "src/mainWindow/index.html"));
    if (isDev) win.webContents.openDevTools();

    win.once("ready-to-show", () => win.show())

    //MENU TEMPLATE

    const menuTemplate = [
        {
            label: app.name,
            submenu: [
                { label: "Preferences", click: () => { createPreferenceWindow() } },
                { label: "Open destination folder", click: () => { shell.openPath(destination) } },
            ]
        },

        {
            label: "File",
            submenu: [
                { role: "quit" }
            ]
        }
    ];
    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
    createWindow()
})

app.on("window-all-closed", () => {
    console.log("todas janelas fechadas");
    app.quit();
})

ipcMain.on("save_buffer", (e, buffer) => {
    const filepath = path.join(destination, `${Date.now()}`)
    fs.writeFileSync(`${filepath}.webm`, buffer)
})

ipcMain.handle("show-dialog", async (e) => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    preferences.set("destination",result.filePaths[0])
    destination = preferences.get("destination")
    return destination;
})