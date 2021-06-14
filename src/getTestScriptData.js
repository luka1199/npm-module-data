const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

run()

async function run() {
    if (process.argv[2] == null) {
        console.log("No path to test scripts specified.");
        process.exit()
    }

    var keywordCounter = {}
    var counter = 0
    var keywords = await loadKeywords()
    keywords.push('Other')
    keywords.push('Not defined')
    var testScripts = await loadTestScripts()

    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        keywordCounter[keyword] = 0
    }

    for (let j = 0; j < testScripts.length; j++) {
        const script = testScripts[j];
        counter++
        var noKeyword = true
        for (let k = 0; k < keywords.length; k++) {
            const keyword = keywords[k];
            if (script.includes(keyword)) {
                var noKeyword = false
                // console.log('Script contains ' + keyword);
                keywordCounter[keyword]++
            }
        }

        if (noKeyword) {
            if (script == "" || script == "echo \"Error: no test specified\" && exit 1") {
                keywordCounter['Not defined']++
            } else {
                keywordCounter['Other']++
            }
        }

    }

    console.log(keywordCounter);
    console.log("Total:", counter);
}

function loadKeywords() {
    return new Promise((resolve, reject) => {
        var keywords = []
    
        fs.createReadStream(path.join(__dirname, 'keywords.csv'))
            .pipe(csv(['keyword']))
            .on('data', (row) => {
                var keyword = row.keyword
                keywords.push(keyword)
            })
            .on('end', () => {
                console.log('Keywords successfully loaded');
                resolve(keywords)
            });
    });
}

function loadTestScripts() {
    return new Promise((resolve, reject) => {
        var scripts = []

        // Load test scripts e.g. testScripts_definitelyTyped.csv
        // Expected format: moduleName, testScript
        fs.createReadStream(process.argv[2])
            .pipe(csv(['moduleName', 'testScript']))
            .on('data', (row) => {
                // console.log(row.testScript);
                // var script = row.testScript.substring(1, row.testScript.length - 1)
                var script = row.testScript
                scripts.push(script)
            })
            .on('end', () => {
                console.log('Test scripts successfully loaded');
                resolve(scripts)
            });
    });
}