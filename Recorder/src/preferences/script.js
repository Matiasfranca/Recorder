const { ipcRenderer } = require("electron")

const destPath = document.querySelector("#dest-path");

ipcRenderer.on("dest-path-update", (e, destination) => {
    destPath.value = destination;
})

function choose() {
    ipcRenderer.invoke("show-dialog").then(destination => { 
        destPath.value = destination
    })
}