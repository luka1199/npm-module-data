const shell = require('shelljs')
const closestSemver = require('semver-closest')
const nearest = require('nearest-date')

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
    const moduleName = process.argv[3]
    // console.log(moduleName);
    var moduleVersion = process.argv[4]
    // console.log(moduleVersion);
    const moduleReleases = await getModuleReleases(moduleName)
    const moduleReleasesList = Object.keys(moduleReleases)

    // Get release tag closest to given version
    moduleVersion = closestSemver(moduleVersion, moduleReleasesList)
    try {
        const releaseDate = new Date(moduleReleases[moduleVersion])
        const commitHash = await getCommitHashFromDate(repoURL, releaseDate)

        // Final output (don't remove)
        console.log(commitHash);
    } catch (err) {
        console.log();
    }


}

function getModuleReleases(moduleName) {
    return new Promise((resolve, reject) => {
        shell.exec(`npm view ${moduleName} time --json`, shellOptions, (code, stdout, stderr) => {
            if (!stderr) {
                var moduleReleases = JSON.parse(stdout)
                delete moduleReleases.created
                delete moduleReleases.modified
                resolve(moduleReleases)
            }
        })
    });
}

// function getCommitHashFromDate(repoURL, releaseDate) {
//     var repoString = repoURL.replace('.git', '').replace('github.com/', '')
//     const URL = `https://api.github.com/repos/${repoString}/commits`
//     var options = {
//         hostname: 'api.github.com',
//         path: '/repos/' + repoString + '/commits',
//         method: 'GET',
//         headers: {'user-agent': 'node.js'}
//     }
//     return new Promise((resolve, reject) => {
//         https.get(options, (res) => {
//             let data = ''
//             console.log(res.status);
//             res.on('data', (chunk) => {
//                 data += chunk
//             });

//             res.on('end', () => {
//                 var commits = JSON.parse(data)
//                 // console.log(`\nURL: ${repoURL}`);
//                 // console.log(`\ncommits: \n${commits}`);

//                 var commitHashByDate = {}
//                 var dates = []
//                 for (let i = 0; i < commits.length; i ++) {
//                     const commitHash = commits[i].sha
//                     const commitDate = new Date(commits[i].commit.committer.date)
//                     commitHashByDate[commitDate] = commitHash
//                     dates.push(commitDate)
//                 }
//                 // Filter commit dates after reference date
//                 dates = dates.filter((date) => {
//                     return date - releaseDate < 0;
//                 })
//                 // Get commit date closest to reference date
//                 dates.sort(function (a, b) {
//                     var distanceA = Math.abs(releaseDate - a);
//                     var distanceB = Math.abs(releaseDate - b);
//                     return distanceA - distanceB;
//                 });

//                 // Final commit hash
//                 resolve(commitHashByDate[dates[0].toString()])
//             });

//         }).on('error', (error) => {
//             // console.log(`\nURL: ${repoURL}`);
//             console.log(error);
//         });
//     });

// }

function getCommitHashFromDate(repoURL, releaseDate) {
    return new Promise((resolve, reject) => {
        shell.exec(
            `rm -rf tmp && git clone --bare https://${repoURL} tmp && cd tmp && git rev-list --min-parents=0 --all --format='%cd' && cd .. && rm -rf tmp`,
            shellOptions,
            (code, stdout, stderr) => {
                if (!stderr) {
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
                    // console.log(commitHashByDate);
                    // console.log(dates);
                    var closestDate = dates[nearest(dates, releaseDate)]
                    // console.log("releaseDate:", releaseDate);
                    // console.log("closestDate", closestDate);
    
                    // Final commit hash
                    resolve(commitHashByDate[closestDate.toString()])
                }
            })
    });
}