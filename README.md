# npm-module-data

## Retrieving module data

### Retrieving modules from DefinitelyTyped

```bash
./scripts/extractDefinitelyTypedModules.sh /tmp/DefinitelyTyped ./output/modules_definitelyTyped.csv
```

Output in `modules_definitelyTyped.csv`

### Getting repositories of modules

```bash
./scripts/getRepositories.sh ./output/moudules_definitelyTyped.csv ./output/modulesWithRepo_definitelyTyped.csv
```

Output in `output/moudulesWithRepo_definitelyTyped.csv`

### Retrieving package files of modules

```bash
./scripts/retrievePackageFiles.sh ./output/modulesWithRepo_definitelyTyped.csv ./packageFiles_definitelyTyped
```

Output in `packageFiles_definitelyTyped/`

### Extracting test scripts of package files

```bash
./scripts/extractTestScripts.sh ./packageFiles_definitelyTyped ./output/testScripts_definitelyTyped.csv
```

Output in `output/testScripts_definitelyTyped.csv`

### Get test script data

```bash
node ./tools/getTestScriptData.js ./output/testScripts_definitelyTyped.csv
```

Output in console.

