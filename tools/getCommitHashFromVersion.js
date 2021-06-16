const shell = require('shelljs')
const fs = require('fs')
const path = require('path')
const getClosest = require("get-closest")
const levenshtein = require('fast-levenshtein');

const shellOptions = {
    silent: true,
}

run()

async function run() {
    if (process.argv[2] == null) {
        console.log('No path to repository specified.');
        process.exit()
    }
    if (process.argv[3] == null) {
        console.log('No version specified.');
        process.exit()
    }

    const repoPath = process.argv[2]
    // console.log(repoPath);
    // console.log(moduleVersion);
    const packageJSON = await loadPackageJSON(repoPath)
    // console.log(packageJSON);
    const moduleReleases = await getModuleReleases(packageJSON.name)
    // console.log(moduleReleases);
    const moduleReleasesList = Object.keys(moduleReleases)

    // Get release tag closest to given version
    const moduleVersion = moduleReleasesList[getClosest.custom(process.argv[3], moduleReleasesList, compareLevenshteinDistance)]
    const releaseDate = new Date(moduleReleases[moduleVersion])
    console.log(await getCommitHashFromDate(repoPath, releaseDate));
}

function loadPackageJSON(repoPath) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(repoPath, 'package.json'), (error, data) => {
            resolve(JSON.parse(data));
        })
    });
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

function getCommitHashFromDate(repoPath, releaseDate) {
    return new Promise((resolve, reject) => {
        shell.exec(`cd ${repoPath} && git rev-list --all --format='%cd'`, shellOptions, (code, stdout, stderr) => {
            if (stderr) {
                console.log(stderr);
                console.log('Something went wrong.')
                process.exit()
            }
            stdout = stdout.slice(0, -1)
            var lines = stdout.split('\n')

            var commitHashByDate = {}
            var dates = []
            for (let i = 0; i < lines.length; i += 2) {
                const commitHash = lines[i].slice(7);
                const commitDate = new Date(lines[i + 1])
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
        })
    });

}

function compareLevenshteinDistance(a, b) {
    var distance = levenshtein.get(a, b)
    return distance
}