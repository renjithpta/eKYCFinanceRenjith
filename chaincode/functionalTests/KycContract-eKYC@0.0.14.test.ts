/*
* Use this file for functional testing of your smart contract.
* Fill out the arguments and return values for a function and
* use the CodeLens links above the transaction blocks to
* invoke/submit transactions.
* All transactions defined in your smart contract are used here
* to generate tests, including those functions that would
* normally only be used on instantiate and upgrade operations.
* This basic test file can also be used as the basis for building
* further functional tests to run as part of a continuous
* integration pipeline, or for debugging locally deployed smart
* contracts by invoking/submitting individual transactions.
*/
/*
* Generating this test file will also trigger an npm install
* in the smart contract project directory. This installs any
* package dependencies, including fabric-network, which are
* required for this test file to be run locally.
*/

import * as assert from 'assert';
import * as fabricNetwork from 'fabric-network';
import { SmartContractUtil } from './ts-smart-contract-util';

import * as os from 'os';
import * as path from 'path';

describe('KycContract-eKYC@0.0.14' , () => {

    const homedir: string = os.homedir();
    const walletPath: string = path.join(homedir, 'FinanceNetworks', 'wallets', 'FI1');
    const gateway: fabricNetwork.Gateway = new fabricNetwork.Gateway();
    const fabricWallet: fabricNetwork.FileSystemWallet = new fabricNetwork.FileSystemWallet(walletPath);
    const identityName: string = 'F11Admin';
    let connectionProfile: any;

    before(async () => {
        connectionProfile = await SmartContractUtil.getConnectionProfile();
    });

    beforeEach(async () => {
        const discoveryAsLocalhost: boolean = SmartContractUtil.hasLocalhostURLs(connectionProfile);
        const discoveryEnabled: boolean = true;

        const options: fabricNetwork.GatewayOptions = {
            discovery: {
                asLocalhost: discoveryAsLocalhost,
                enabled: discoveryEnabled,
            },
            identity: identityName,
            wallet: fabricWallet,
        };

        await gateway.connect(connectionProfile, options);
    });

    afterEach(async () => {
        gateway.disconnect();
    });

    
    describe('init', () => {
        it('should submit init transaction', async () => {
            // TODO: Update with parameters of transaction
            const args: string[] = [];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'init', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            assert.equal(response.toString(), "true");
        }).timeout(10000);
    });

    describe('getCallerId', () => {
        it('should submit getCallerId transaction', async () => {
            // TODO: Update with parameters of transaction
            const args: string[] = [];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'getCallerId', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
             assert.equal(response.toString(), "FI1");
        }).timeout(10000);
    });

    describe('isWhoRegistered', () => {
        it('should submit isWhoRegistered transaction', async () => {
            // TODO: populate transaction parameters
            const clientId: string = 'CLIENT1873451';
            const args: string[] = [ clientId];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'isWhoRegistered', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('createClient', () => {
        it('should submit createClient transaction', async () => {
            // TODO: populate transaction parameters
            var clientData = {
                "name": "usertest02",
                "dateOfBirth": "1991-11-19",
                "address": "Mississauga, ON - Canada",
                "idNumber": "8390471111",
                "whoRegistered": {
                    "orgNum": 1,
                    "ledgerUser": "FI1"
                }
            };
            const args: string[] = [ JSON.stringify(clientData)];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'createClient', args, gateway);
            
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
         assert.equal(true, true);
         assert.equal(response.toString(), "CLIENT18390471111");
        }).timeout(10000);
    });

    describe('getClientData', () => {
        it('should submit getClientData transaction', async () => {
            // TODO: populate transaction parameters
            const clientId: string = 'CLIENT18390471111';
            const fields: string = 'name,address';
            const args: string[] = [ clientId, fields];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'getClientData', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            console.log(response.toString())
            assert.equal(true, true);
            assert.equal(JSON.parse(response.toString()).name, "usertest02");
            assert.equal(JSON.parse(response.toString()).address, "Mississauga, ON - Canada");
        }).timeout(10000);
    });

    describe('getFinancialInstitutionData', () => {
        it('should submit getFinancialInstitutionData transaction', async () => {
            // TODO: Update with parameters of transaction
            const args: string[] = [];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'getFinancialInstitutionData', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            console.log(response.toString())
            assert.equal(true, true);
    assert.equal(JSON.parse(response.toString()).name, "FI1");
    assert.equal(JSON.parse(response.toString()).idNumber, "980237234");
        }).timeout(10000);
    });

    describe('approve', () => {
        it('should submit approve transaction', async () => {
            // TODO: populate transaction parameters
            const clientId: string = 'CLIENT18390471111';
            const fiId: string = 'name,address,idNumber';
            const args: string[] = [ clientId, fiId];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'approve', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            console.log(response.toString())
            assert.equal(true, true);
            // assert.equal(JSON.parse(response.toString()), undefined);
        }).timeout(10000);
    });

    describe('getRelationByFi', () => {
        it('should submit getRelationByFi transaction', async () => {
            // TODO: Update with parameters of transaction
            const args: string[] = [];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'getRelationByFi', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            console.log(response.toString())
            assert.equal(true, true);
            assert.ok(JSON.parse(response.toString()));
           assert.ok(JSON.parse(response.toString()).length > 0)
        }).timeout(10000);
    });

    describe('queryAllData', () => {
        it('should submit queryAllData transaction', async () => {
            // TODO: Update with parameters of transaction
            const args: string[] = [];

            const response: Buffer = await SmartContractUtil.submitTransaction('KycContract', 'queryAllData', args, gateway);
            // submitTransaction returns buffer of transcation return value
            // TODO: Update with return value of transaction
            assert.equal(true, true);
            assert.ok(JSON.parse(response.toString()).length > 0)
        }).timeout(10000);
    });
});
