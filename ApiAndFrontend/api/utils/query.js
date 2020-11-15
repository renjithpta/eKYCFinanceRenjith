
const networkConnection = require('./networkConnection');

const orgNumber = process.argv[2];
const userName = process.argv[3];

async function main() {
    try {
        let result = networkConnection.evaluateTransaction('getClientData', orgNumber, userName, ['CLIENT1',"name,address"])
       
        console.log(result.toString());
        
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

main();
