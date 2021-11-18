import * as fs from "fs";
import * as path from "path";

const config_path = path.join(process.cwd(), "config.json");

let config: any = {
    domain: (Math.random() + 1).toString(36).substring(7).toUpperCase(),
    path: "./share"
};

try {
    config = JSON.parse(fs.readFileSync(config_path, {encoding: "utf8"}));
} catch(error: any) {
    if (error.code !== 'ENOENT') throw error;
    fs.writeFileSync(config_path, JSON.stringify(config,null,2));
}

module.exports = config;