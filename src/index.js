import {readFileSync, writeFileSync} from "fs";
import _ from "lodash";
const req = await fetch("https://discord.com/api/v9/applications/detectable")
let current;
try {
    current = JSON.parse(readFileSync("../current.json", "utf-8"))
}
catch (e) {
    if (e.code !== "ENOENT") throw e
    current = []
}
const json = await req.json();
const newApps = json.filter(app => !current.some(c => c.id === app.id))
for (const app of newApps) {
    console.log(`Found new app: ${app.name} (${app.id})`)
    writeFileSync(`../apps/${app.id}.json`, JSON.stringify(app, null, 4))
    current.push(app)
}
let changes = 0
// check for deleted apps
const deletedApps = current.filter(app => !json.some(c => c.id === app.id))
for (const app of deletedApps) {
    console.log(`Deleted app: ${app.name} (${app.id})`)
}
// check for changes in existing apps
for (let app of current) {
    const newapp = json.find(c => c.id === app.id)
    if (!_.isEqual(app, newapp)) {
        console.log(`Updated app: ${app.name} (${app.id})`)
        writeFileSync(`../apps/${app.id}.json`, JSON.stringify(json, null, 4))
        app = json
        changes++
    }
}
writeFileSync("../current.json", JSON.stringify(json, null, 4))
console.log(`Done! (${newApps.length} new apps, ${changes} changed apps, ${deletedApps.length} deleted apps)`)