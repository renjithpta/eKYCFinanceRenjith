
const utils = require('./utils.js');
const orgNumber = process.argv[2];
const adminName = process.argv[3];
const userName = process.argv[4];

async function main() {
    try {

        await utils.connectGatewayFromConfig(orgNumber.toLowerCase());
        await utils.registerUser(userName,"123456",orgNumber.toUpperCase(),adminName);
        await utils.enrollUser(userName,"123456",orgNumber.toUpperCase(),adminName);
       
    } catch (error) {

        console.error(`Failed to enroll admin user "${adminName}": ${error}`);
        process.exit(1);
    }
}

main();
