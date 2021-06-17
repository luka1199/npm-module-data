const semver = require('semver')
var list = process.argv[2].split(' ')
var str = list[list.length - 1]
var version = semver.valid(semver.coerce(str))
if (version != null) {
    console.log(version)
}