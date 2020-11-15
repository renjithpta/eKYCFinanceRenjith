
const utils = require('./utils.js');

const orgNumber = process.argv[2];

async function main() {

    try {

        await utils.connectGatewayFromConfig(orgNumber.toLowerCase());
       // await utils.registerUser(userName,"123456",orgNumber.toUpperCase(),adminName);
       
    } catch (error) {

        console.error(`Failed to enroll admin user "${adminName}": ${error}`);
        process.exit(1);
    }
}

main();
