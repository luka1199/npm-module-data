const csv = require('csv-parser');
const fs = require('fs');

run()

async function run() {
    var keywordCounter = {}
    var counter = 0
    var keywords = await loadKeywords()
    keywords.push('Other')
    keywords.push('None')
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
                keywordCounter['None']++
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
    
        fs.createReadStream('output/keywords.csv')
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
    
        fs.createReadStream('output/testScripts.csv')
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