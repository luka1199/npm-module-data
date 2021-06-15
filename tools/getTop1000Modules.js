const https = require('https')
const fs = require('fs')

const URL = "https://gist.githubusercontent.com/anvaka/8e8fa57c7ee1350e3491/raw/b6f3ebeb34c53775eea00b489a0cea2edd9ee49c/01.most-dependent-upon.md"

https.get(URL, (res) => {
    let data = ''

    res.on('data', (chunk) => {
        data += chunk
    });

    res.on('end', () => {
        let regex = /[0-9]+\.\ \[(.+)\]\(.+\)/g
        let modules = []
        for (const match of data.matchAll(regex)) {
            modules.push(match[1])
        }
        
        if (process.argv[2] == null) {
            modules.forEach(modules => {
                console.log(modules);
            });
        } else {
            fs.writeFileSync(process.argv[2], modules.join('\n'))
        }
    });

}).on('error', (e) => {
    console.error(e);
});