const { app } = require("electron")
const path = require("path");
const os = require("os");
const fs = require("fs");

class Store {
    constructor(options) {
        const userDataPath = app.getPath("appData")
        this.path = path.join(userDataPath, options.configName + '.json')
        this.data = parseDataFile(this.path, makeDir(options.defaults))
    }

    get(key){
        return this.data[key]  
    }

    set(key, value){
        this.data[key] = value;
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }
   
}

function makeDir(path) {
    if (!fs.existsSync(path.destination)) {
        fs.mkdirSync(path.destination);
    }

    return path
} 

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath))
    } catch {
        return defaults
    }
}

module.exports = Store