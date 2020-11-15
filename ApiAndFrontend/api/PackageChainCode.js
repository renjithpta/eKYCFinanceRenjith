
const fabricClient = require('fabric-client')
const fs = require('fs-extra')
const pathFs = require('path')
async function createPackage(name, version, contractPath, pkgFile, language, metadataPath){
console.log("---inside---",pkgFile)
const pkg = await fabricClient.Package.fromDirectory({
        name: name,
        version: version,
        path: contractPath,
        type: language ,
        metadataPath: metadataPath ? metadataPath : null
    });
    const pkgBuffer = await pkg.toBuffer();
    console.log("Before",pkgBuffer)
    await fs.writeFile(pkgFile, pkgBuffer);

    return pkg.fileNames;
}
let parent =  pathFs.join(__dirname,"..","..");

console.log(parent)
//createPackage("eKYC","1.0", parent,"eKYC@0.0.1.cds","node",null);
const path = require('path');
let filePathLocal= path.resolve(
    __dirname,
    "..",
    
);
console.log(filePathLocal)