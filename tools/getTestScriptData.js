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
    var data = getData(testScripts, keywords)
    var keywordData = data[0]
    var modulesWithTestScript = data[1]
    var sortedKeywordData = sortKeywordData(keywordData)
    var groupedKeywordData = getGroupedKeywordData(sortedKeywordData, keywordsJSON)
    groupedKeywordData['total'] = testScripts.length
    console.log(groupedKeywordData);
    console.log("Total:", testScripts.length);
    if (process.argv[3] != null) {
        console.log(`Saving data to ${process.argv[3]}`);
        fs.writeFileSync(process.argv[3], JSON.stringify(groupedKeywordData, null, '\t'))
    }
    if (process.argv[4] != null) {
        console.log(`Saving modules with test script to ${process.argv[4]}`);
        fs.writeFileSync(process.argv[4], modulesWithTestScript.join('\n'))
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
        var moduleScripts = []

        // Load test scripts e.g. testScripts_definitelyTyped.csv
        // Expected format: moduleName, testScript
        fs.createReadStream(process.argv[2])
            .pipe(csv(['moduleName', 'testScript']))
            .on('data', (row) => {
                // console.log(row.testScript);
                // var script = row.testScript.substring(1, row.testScript.length - 1)
                moduleScripts.push([row.moduleName, row.testScript])
            })
            .on('end', () => {
                console.log('Test scripts successfully loaded');
                resolve(moduleScripts)
            });
    });
}

function getData(testScripts, keywords) {
    var keywordCounter = {}
    var modulesWithTestScript = []
    testScripts.forEach(pair => {
        const moduleName = pair[0]
        modulesWithTestScript.push(moduleName)
    });
    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];
        keywordCounter[keyword] = 0
    }
    for (let j = 0; j < testScripts.length; j++) {
        const moduleName = testScripts[j][0];
        const script = testScripts[j][1];
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
                modulesWithTestScript = modulesWithTestScript.filter((item) => {
                    return item != moduleName
                })
            } else {
                // console.log(script);
                keywordCounter['other']++
            }
        }
    }
    return [keywordCounter, modulesWithTestScript]
}

function sortKeywordData(keywordData) {
    return Object.entries(keywordData)
    .sort(([,a],[,b]) => b-a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
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