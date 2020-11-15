/*
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto = require('crypto');
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { CustomerRate } from './customerrate-asset';
import {Shim ,ClientIdentity} from 'fabric-shim';
const myCollectionName: string = 'KycCollection';

@Info({title: 'KycPrivateAssetContract', description: 'Kyc Private Data Smart Contract' })
export class KycPrivateAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async kycPrivateAssetExists(ctx: Context,  collectionName:string , clientId: string): Promise<boolean> {
        const buffer: Buffer = await ctx.stub.getPrivateDataHash(collectionName, clientId);
  
        return (!!buffer && buffer.length > 0);
    }

    @Transaction(true)
    public async createKycPrivateAsset(ctx: Context, clientId: string): Promise<void> {
        console.log("======================createKycPrivateAsset======================");
        let cid = new ClientIdentity(ctx.stub);
        console.log("======================createKycPrivateAsset cid======================");
        let collectionMSPName :string =cid.getMSPID()+myCollectionName;
        console.log("======================createKycPrivateAsset collectionMSPName======================");
        const exists: boolean  = await this.kycPrivateAssetExists(ctx, collectionMSPName,clientId);
        console.log("======================createKycPrivateAsset exists======================");
        if (exists) {
            throw new Error(`The client rate for the client  ${clientId} already exists`);
        }

        const privateAsset: CustomerRate = new CustomerRate();
        console.log("======================createKycPrivateAsset privateAsset======================");
        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('customerrate')) {
            throw new Error('The customerrate key was not specified in transient data. Please try again.');
        }
        console.log("======================createKycPrivateAsset transientData======================");
        privateAsset.rate = transientData.get('customerrate').toString('utf8');
        console.log("======================createKycPrivateAsset privateAsset======================");
        await ctx.stub.putPrivateData(collectionMSPName, clientId, Buffer.from(JSON.stringify(privateAsset)));
    }

    @Transaction(false)
    @Returns('CustomerRate')
    public async readKycPrivateAsset(ctx: Context, clientId: string): Promise<string> {

        let cid = new ClientIdentity(ctx.stub);
        let collectionMSPName :string =cid.getMSPID()+myCollectionName;
        const exists: boolean = await this.kycPrivateAssetExists(ctx,collectionMSPName, clientId);
        if (!exists) {
            throw new Error(`The client rate for the client ${clientId} does not exist`);
        }
        let privateDataString: string;
        const privateData: Buffer = await ctx.stub.getPrivateData(collectionMSPName, clientId);
        privateDataString = JSON.parse(privateData.toString());
        return privateDataString;

    }

    @Transaction(true)
    public async updateKycPrivateAsset(ctx: Context, clientId: string): Promise<void> {
        let cid = new ClientIdentity(ctx.stub);
        const exists: boolean = await this.kycPrivateAssetExists(ctx,cid.getMSPID()+myCollectionName, clientId);
        if (!exists) {
            throw new Error(`The client rate for the client ${clientId} does not exist`);
        }
        const privateAsset: CustomerRate = new CustomerRate();
        const transientData: Map<string, Buffer> = ctx.stub.getTransient();
        if (transientData.size === 0 || !transientData.has('customerrate')) {
            throw new Error('The privateValue key was not specified in transient data. Please try again.');
        }
        privateAsset.rate = transientData.get('customerrate').toString('utf8');

        await ctx.stub.putPrivateData(cid.getMSPID()+myCollectionName, clientId, Buffer.from(JSON.stringify(privateAsset)));
    }

    @Transaction(true)
    public async deleteKycPrivateAsset(ctx: Context, clientId: string): Promise<void> {
        let cid = new ClientIdentity(ctx.stub);
        const exists: boolean = await this.kycPrivateAssetExists(ctx,cid.getMSPID()+myCollectionName, clientId);
        if (!exists) {
            throw new Error(`The client rate for the client ${clientId} does not exist`);
        }
        await ctx.stub.deletePrivateData(cid.getMSPID()+myCollectionName, clientId);
    }

    @Transaction()
    public async verifyClientRate(ctx: Context, clientId: string, ownerFIMSP:string, objectToVerify: string): Promise<boolean> {
        // Convert user provided object into a hash
        const hashToVerify: string = crypto.createHash('sha256').update(objectToVerify).digest('hex');
        const pdHashBytes: Buffer = await ctx.stub.getPrivateDataHash(ownerFIMSP+myCollectionName, clientId);
        if (pdHashBytes.length === 0) {
            throw new Error(`No private data hash with the Key: ${clientId}`);
        }

        const actualHash: string = pdHashBytes.toString('hex');

        // Compare the hash calculated (from object provided) and the hash stored on public ledger
        if (hashToVerify === actualHash) {
            return true;
        } else {
            return false;
        }
    }


    @Transaction(true)
    public async shareClinetRate(ctx: Context, clientId: string, requestFIMSP:string): Promise<boolean> {
        // Convert user provided object into a hash
        let cid = new ClientIdentity(ctx.stub);
        let collectionName:string
        if((requestFIMSP =='FI1MSP' && cid.getMSPID() == 'FI2MSP' ) || (requestFIMSP =='FI2MSP' && cid.getMSPID() == 'FI1MSP'))
             collectionName =  "FI1MSPFI2MSP"+myCollectionName;

        if((requestFIMSP =='FI1MSP' && cid.getMSPID() == 'FI3MSP' ) || (requestFIMSP =='FI3MSP' && cid.getMSPID() == 'FI1MSP'))
             collectionName =  "FI1MSPFI3MSP"+myCollectionName;
     
        if((requestFIMSP =='FI2MSP' && cid.getMSPID() == 'FI3MSP' ) || (requestFIMSP =='FI3MSP' && cid.getMSPID() == 'FI2MSP'))
             collectionName =  "FI2MSPFI3MSP"+myCollectionName;
     

        const exists: boolean = await this.kycPrivateAssetExists(ctx,cid.getMSPID()+myCollectionName, clientId);
        if (!exists) {
            throw new Error(`The client rate for the client ${clientId} does not exist`);
        }
       
        const privateData: Buffer = await ctx.stub.getPrivateData(cid.getMSPID()+myCollectionName, clientId);
        
        let  verificationResult : boolean  =  await this.verifyClientRate(ctx,clientId,cid.getMSPID(),privateData.toString());

        if(!verificationResult) { 

            throw new Error(`The client rate for the client ${clientId} does not match with hash`);

        }
        await ctx.stub.putPrivateData(collectionName, clientId ,privateData);
        return true;

    }


    @Transaction(false)
    public async readSharedClinetRate(ctx: Context, clientId: string): Promise<string> {
        // Convert user provided object into a hash
        let cid = new ClientIdentity(ctx.stub);
        let collectionName:string ;
        const data = await ctx.stub.getState(clientId);
        const clientData = JSON.parse(data.toString())
        let ownerFIMSP = clientData.whoRegistered.ledgerUser + "MSP" ;
        if((ownerFIMSP =='FI1MSP' && cid.getMSPID() == 'FI2MSP' ) || (ownerFIMSP =='FI2MSP' && cid.getMSPID() == 'FI1MSP'))

             collectionName =  "FI1MSPFI2MSP"+myCollectionName;

        if((ownerFIMSP =='FI1MSP' && cid.getMSPID() == 'FI3MSP' ) || (ownerFIMSP =='FI3MSP' && cid.getMSPID() == 'FI1MSP'))

             collectionName =  "FI1MSPFI3MSP"+myCollectionName;
     
        if((ownerFIMSP =='FI2MSP' && cid.getMSPID() == 'FI3MSP' ) || (ownerFIMSP =='FI3MSP' && cid.getMSPID() == 'FI2MSP'))

             collectionName =  "FI2MSPFI3MSP"+myCollectionName;
     
        if(collectionName != "FI1MSPFI2MSP"+myCollectionName && collectionName != "FI1MSPFI3MSP"+myCollectionName  && collectionName != "FI2MSPFI3MSP"+myCollectionName){

            throw new Error(`The collection name  ${collectionName} does not exist`);
        }
        const exists: boolean = await this.kycPrivateAssetExists(ctx,collectionName, clientId);

        if (!exists) {
            throw new Error(`The client rate for the client ${clientId} does not exist`);
        }
        const privateData: Buffer = await ctx.stub.getPrivateData(collectionName , clientId);

        let privateDataString :string = JSON.parse(privateData.toString());
        

        return privateDataString;
      
    }
 

}
