const parse = require('parse-npm-script')

getTestScript(process.argv[2]).then((result, error) => {
  console.log(result);
});

function getTestScript(path) {
  return new Promise((resolve, reject) => {
    parse(path, 'npm run test').then((result) => {
        resolve(result.combined.replace(/\n/g, ""))
      },
      () => {
        resolve("")
      })
    
  });
}

module.exports = getTestScript;