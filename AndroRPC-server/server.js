const express = require('express'); 
const app = express(); 
const fetch = require('node-fetch');
const fs = require('fs');
const { Client } = require("discord-rpc");
const bodyParser = require('body-parser'); 
const { time } = require('console');
const {getMetadata} = require('page-metadata-parser');
const domino = require('domino');
const { exit } = require('process');

let cache = {};
let port_server = 0000
timerpc = Date.now()

client = new Client({
    transport: "ipc"
})

read_json_port()

let can_run = false
let large_image = ""
let end_name = ""
let debug = true

function read_json_port() {
    try {
        if (fs.existsSync("./port.json")) {
            let port = fs.readFileSync("./port.json");
            port_server = JSON.parse(port).port
            app.listen(port_server)
            setTray()
        } else {
            port_server = 6999
            app.listen(port_server)
            setTray()
        }
    } catch(err) {}
}

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.post('/postrpc', (req, res) => { 
    var link = req.body.rpc_link;
    var name = req.body.rpc_name;
    res.status(200).json({ 
        message: "Data received successfully" 
	}); 

    if (debug) {
        console.log(name)
    }

    read_rpc_data(link, name)
}); 

async function read_rpc_data(rlink, rname) {
    end_name = rname
    //const url = 'https://premid.app/store/presences/'+end_name;

    if (cache[rlink]) {
        StartRPC(rname, cache[rlink])
    } else {
        const url = 'https://play.google.com/store/apps/details?id='+rlink
        const response = await fetch(url);
        const html = await response.text();
        const doc = domino.createWindow(html).document;
        const metadata = getMetadata(doc, url);
        cache[rlink] = metadata.image
        StartRPC(rname, metadata.image)
    }
}

function StartRPC(name, b_pic) {
    large_image = b_pic

    if (can_run == true) {
        client.setActivity({
            details: name,
            state: "Device: Samsung A51",
            largeImageKey: large_image,
            largeImageText: "Device: Samsung A51",
            smallImageKey: "https://iconape.com/wp-content/png_logo_vector/android-robot-head.png",
            smallImageText: "AndroRPC",
            startTimestamp: timerpc
        })
    }
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

client.on('ready', () => {
    can_run = true

    setInterval(() => {
        cache = {}
    }, 86400000)
});

client.login({ clientId: "1003025583552336013" })