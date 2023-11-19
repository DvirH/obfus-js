#!/usr/bin/env node

const fs = require("fs");
const path = require('path')
const JavaScriptObfuscator = require('javascript-obfuscator');
let config = {}
const configFile = process.argv[2]
try {
    config = JSON.parse(fs.readFileSync(configFile ?? './obfus.config.json', { encoding: 'utf-8' }))
}
catch (err) {
    console.log(`can't read obfusc.config.json file, please verify that you supplied a valid json`)
    process.exit(1)
}

prepareOutputDir()

const files = fs.readdirSync(config.sourceDir, {
    withFileTypes: true,
    recursive: true,
})


for (const file of files) {
    if (config.exclude.some(i => file.path.indexOf(i) > -1)) continue
    if (!file.isFile()) continue
    if (config.fileTypes.indexOf(path.extname(file.name)) === -1) continue
    const relativePath = path.relative(config.sourceDir, file.path)
    fs.readFile(`${file.path}/${file.name}`, "UTF-8", function (err, data) {
        if (err) {
            throw err;
        }

        var obfuscationResult = JavaScriptObfuscator.obfuscate(data, {
            target: 'node',
            stringArray: false,
            ...(config.compiler ?? {})
        });

        const dir = path.join(config.output, relativePath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }

        fs.writeFile(`${dir}/${file.name}`, obfuscationResult.getObfuscatedCode(), function (err) {
            if (err) {
                return console.log(err);
            }

            console.log(`The file ${file.path}\${file.name} was saved!`);
        });
    });
}

function prepareOutputDir() {
    if (fs.existsSync(config.output)) {
        fs.rmSync(config.output, { recursive: true, force: true })
        fs.mkdirSync(config.output)
    } else {
        fs.mkdirSync(config.output)
    }
}