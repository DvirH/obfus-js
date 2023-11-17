const fs = require("fs");
const path = require('path')
const JavaScriptObfuscator = require('javascript-obfuscator');
let config = {}
const configFile = process.argv[2]
try {
    config = JSON.parse(fs.readFileSync(configFile, { encoding: 'utf-8' }))
}
catch (err) {
    throw new Error(`can't read config file, please verify that you supplied a valid json`)
}

const files = fs.readdirSync(config.sourceDir, {
    withFileTypes: true,
    recursive: true,
})


prepareOutputDir()

for (const file of files) {
    if (config.fileTypes.indexOf(path.extname(file.name)) === -1) continue
    if (config.exclude.some(i => file.path.indexOf(i) > -1)) continue
    fs.readFile(`${file.path}${file.name}`, "UTF-8", function (err, data) {
        if (err) {
            throw err;
        }

        var obfuscationResult = JavaScriptObfuscator.obfuscate(data, {
            target: 'node',
            stringArray: false
        });


        fs.writeFile(`${config.output}/${file.path}${file.name}`, obfuscationResult.getObfuscatedCode(), function (err) {
            if (err) {
                return console.log(err);
            }

            console.log(`The file ${file.path}${file.name} was saved!`);
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