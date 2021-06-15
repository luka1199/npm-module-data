const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

run()

async function run() {
    if (process.argv[2] == null) {
        console.log("No path to test scripts specified.");
        process.exit()
    }

    var counter = 0
    var keywords = await loadKeywords()
    keywords.push('other')
    keywords.push('undefined')
    var testScripts = await loadTestScripts()

    var keywordData = getKeywordData(testScripts, keywords)
    var sortedKeywordData = sortKeywordData(keywordData)
    sortedKeywordData.forEach(data => {
        console.log(`${data[0]}: ${data[1]}`)
    });
    console.log("Total:", testScripts.length);
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

function getKeywordData(testScripts, keywords) {
    var keywordCounter = {}
    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        keywordCounter[keyword] = 0
    }
    for (let j = 0; j < testScripts.length; j++) {
        const script = testScripts[j];
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
                keywordCounter['undefined']++
            } else {
                keywordCounter['other']++
            }
        }
    }
    return keywordCounter
}

function sortKeywordData(keywordData) {
    return Object.keys(keywordData).sort((a, b) => {
        return -1 * (keywordData[a] - keywordData[b])
    }).map(key => [key, keywordData[key]])
}