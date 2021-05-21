const csv = require('csv-parser');
const fs = require('fs');

run()

async function run() {
    var keywordCounter = {}
    var counter = 0
    var keywords = await loadKeywords()
    var testScripts = await loadTestScripts()

    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        keywordCounter[keyword] = 0
    }

    for (let j = 0; j < testScripts.length; j++) {
        const script = testScripts[j];
        counter++

        for (let k = 0; k < keywords.length; k++) {
            const keyword = keywords[k];
            if (script.includes(keyword)) {
                // console.log('Script contains ' + keyword);
                keywordCounter[keyword]++
            }
        }

    }

    console.log(keywordCounter);
}

function loadKeywords() {
    return new Promise((resolve, reject) => {
        var keywords = []
    
        fs.createReadStream('keywords.csv')
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
    
        fs.createReadStream('testScripts.csv')
            .pipe(csv(['moduleName', 'testScript']))
            .on('data', (row) => {
                // console.log(row.testScript);
                var script = row.testScript.substring(1, row.testScript.length - 1)
                scripts.push(script)
            })
            .on('end', () => {
                console.log('Test scripts successfully loaded');
                resolve(scripts)
            });
    });
}