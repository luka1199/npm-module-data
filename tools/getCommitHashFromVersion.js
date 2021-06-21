const shell = require('shelljs')
const semver = require('semver')
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
    var moduleVersion = semver.valid(semver.coerce(process.argv[4]))
    // console.log(moduleVersion);
    const moduleReleases = await getModuleReleases(moduleName)
    const moduleReleasesList = Object.keys(moduleReleases)
        .filter((version) => {
            return semver.valid(version)
        })
    // Get release tag closest to given version
    moduleVersion = getClosestVersion(moduleVersion, moduleReleasesList)
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
            if (stdout) {
                var moduleReleases = JSON.parse(stdout)
                delete moduleReleases.created
                delete moduleReleases.modified
                resolve(moduleReleases)
            }
        })
    });
}

function getCommitHashFromDate(repoURL, releaseDate) {
    return new Promise((resolve, reject) => {
        shell.exec(`git remote show https://${repoURL} | grep 'HEAD branch' | cut -d' ' -f5`, shellOptions, (code, stdout, stderr) => {
            var branch = stdout
            if (branch == "") { branch = 'master' }
            shell.exec(
                `rm -rf tmp && git clone --bare https://${repoURL} tmp && cd tmp && git rev-list --format='%cd' ${branch} && cd .. && rm -rf tmp`,
                shellOptions,
                (code, stdout, stderr) => {
                    if (stdout) {
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
                    if (stderr) {
                        // console.log("test");
                        // console.log(stderr);
                    }
                })
        })
    });
}

function getClosestVersion(version, versions) {
    result = semver.minSatisfying(versions, '>=' + version)
    if (result == null) {
        result = semver.maxSatisfying(versions, '<=' + version)
    }
    return result
}