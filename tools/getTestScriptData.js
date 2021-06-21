const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

run()

async function run() {
    if (process.argv[2] == null) {
        console.log("No path to test scripts specified.");
        process.exit()
    }

    var keywordsJSON = await loadKeywordsJSON()
    var keywords = getKeywords(keywordsJSON)
    keywords.push('other')
    keywords.push('undefined')
    var testScripts = await loadTestScripts()
    var keywordData = getKeywordData(testScripts, keywords)
    var sortedKeywordData = sortKeywordData(keywordData)
    var groupedKeywordData = getGroupedKeywordData(sortedKeywordData, keywordsJSON)
    groupedKeywordData['total'] = testScripts.length
    console.log(groupedKeywordData);
    console.log("Total:", testScripts.length);
    if (process.argv[3] != null) {
        console.log(`Saving data to ${process.argv[3]}`);
        fs.writeFileSync(process.argv[3], JSON.stringify(groupedKeywordData, null, '\t'))
    }
}

function loadKeywordsJSON() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'keywords.json'), (error, data) => {
            resolve(JSON.parse(data));
        })
            
    });
}

function getKeywords(keywordsJSON) {
    var keywords = []
    Object.values(keywordsJSON).forEach(category => {
        Object.keys(category).forEach(keyword => {
            keywords.push(keyword)
        });
    });
    return keywords
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
                // console.log(script);
                keywordCounter['other']++
            }
        }
    }
    return keywordCounter
}

function sortKeywordData(keywordData) {
    return Object.fromEntries(Object.keys(keywordData).sort((a, b) => {
        return -1 * (keywordData[a] - keywordData[b])
    }).map(key => [key, keywordData[key]]))
}

function getGroupedKeywordData(sortedKeywordData, keywordsJSON) {
    var keywordCategory = {}
    var groupedData = {}
    Object.keys(keywordsJSON).forEach(category => {
        Object.keys(keywordsJSON[category]).forEach(keyword => {
            keywordCategory[keyword] = category
        });
        groupedData[category] = {}
    });

    Object.entries(sortedKeywordData).forEach(keywordData => {
        const keyword = keywordData[0]
        const amount = keywordData[1]
        if (keyword == 'undefined' || keyword == 'other') {
            groupedData[keyword] = amount
        } else {
            var name = keywordsJSON[keywordCategory[keyword]][keyword]
            groupedData[keywordCategory[keyword]][name] = amount
        }
    });
    return groupedData
}