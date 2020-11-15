
const networkConnection = require('./networkConnection');
const utils = require('./utils.js');
const orgNumber = process.argv[2];
const userName = process.argv[3];
const transaction = process.argv[4];
const params = process.argv[5];

async function main() {
    try {
        let result =  (params)? await networkConnection.submitTransaction(transaction, orgNumber, userName, params) : await networkConnection.submitTransaction(transaction, orgNumber, userName)
       
        console.log(result.toString());
        console.log('Transaction has been submitted');
        utils.disconnectGateway();
        process.exit(1);

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();
