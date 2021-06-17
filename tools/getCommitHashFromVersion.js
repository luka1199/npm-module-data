const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const getClosest = require("get-closest")
const levenshtein = require('fast-levenshtein');
const https = require('https')

const shellOptions = {
    silent: true,
}

run()

async function run() {
    if (process.argv[2] == null) {
        console.log('No repository url specified.');
        process.exit()
    }
    if (process.argv[3] == null) {
        console.log('No module name.');
        process.exit()
    }
    if (process.argv[4] == null) {
        console.log('No module version specified.');
        process.exit()
    }

    // Expected format: github.com/IonicaBizau/abs.git
    const repoURL = process.argv[2]
    const packageName = process.argv[3]
    var moduleVersion = process.argv[4]
    // console.log(moduleVersion);
    const moduleReleases = await getModuleReleases(packageName)
    // console.log(moduleReleases);
    const moduleReleasesList = Object.keys(moduleReleases)

    // Get release tag closest to given version
    // moduleVersion = moduleReleasesList[getClosest.custom(moduleVersion, moduleReleasesList, compareLevenshteinDistance)]
    const releaseDate = new Date(moduleReleases[moduleVersion])
    console.log(await getCommitHashFromDate(repoURL, releaseDate));
}

function getModuleReleases(moduleName) {
    return new Promise((resolve, reject) => {
        shell.exec(`npm view ${moduleName} time --json`, shellOptions, (code, stdout, stderr) => {
            if (stderr) {
                console.log(stderr);
                console.log('Something went wrong.')
                process.exit()
            }
            resolve(JSON.parse(stdout))
        })
    });
}

function getCommitHashFromDate(repoURL, releaseDate) {
    var repoString = repoURL.replace('.git', '').replace('github.com/', '')
    const URL = `https://api.github.com/repos/${repoString}/commits`
    var options = {
        hostname: 'api.github.com',
        path: '/repos/' + repoString + '/commits',
        method: 'GET',
        headers: {'user-agent': 'node.js'}
    }
    return new Promise((resolve, reject) => {
        https.get(options, (res) => {
            let data = ''
        
            res.on('data', (chunk) => {
                data += chunk
            });
        
            res.on('end', () => {
                var commits = JSON.parse(data)
                var commitHashByDate = {}
                var dates = []
                for (let i = 0; i < commits.length; i ++) {
                    const commitHash = commits[i].sha
                    const commitDate = new Date(commits[i].commit.committer.date)
                    commitHashByDate[commitDate] = commitHash
                    dates.push(commitDate)
                }
                // Filter commit dates after reference date
                dates = dates.filter((date) => {
                    return date - releaseDate < 0;
                })
                // Get commit date closest to reference date
                dates.sort(function (a, b) {
                    var distanceA = Math.abs(releaseDate - a);
                    var distanceB = Math.abs(releaseDate - b);
                    return distanceA - distanceB;
                });

                // Final commit hash
                resolve(commitHashByDate[dates[0].toString()])
            });
        
        }).on('error', (e) => {
            console.error(e);
        });
    });

}

function compareLevenshteinDistance(a, b) {
    var distance = levenshtein.get(a, b)
    return distance
}