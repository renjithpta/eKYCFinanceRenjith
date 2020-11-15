/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import  { Client } from './Clinet';
import {WhoRegistered} from './whoisregistered';
import {Shim ,ClientIdentity} from 'fabric-shim';
//tslint:disable no-var:requires
const initialClientData = require('../data/initialClientData.json');// tslint:disable-line:require
//tslint:disable no-var:requires
const initialFIData     = require('../data/initialFIData.json');// tslint:disable-line:require
import { Iterators} from  'fabric-shim';
import  KycContext from './kyccontext';
import {FL} from "./fl" ;

@Info({title: 'eKycContract', description: 'ekYc contarct for finacial securties fir to share customer info' })
export class KycContract extends Contract {
   

    public createContext(): KycContext{
        return new KycContext();

    }
    constructor() {
        super();
    }
    /**
     *
     * @param {KycContext} ctx
     * @dev initiate ledger storing initial data
     */
    @Transaction(true)   
    @Returns('boolean') 
    public async init(context:KycContext):Promise<boolean> {
        const  logger = Shim.newLogger("KYccContract");
        logger.info('============= START : Initialize Ledger ===========');

        const clients = initialClientData;
        const fis     = initialFIData;
        for (const client of clients) {
            let whoRegistered : WhoRegistered = new WhoRegistered(client.whoRegistered.orgNum, client.whoRegistered.ledgerUser)
            await context.cpList.puClient(client.whoRegistered.orgNum+client.idNumber,new  Client(client.name, client.dateOfBirth, client.address, client.idNumber,client.email, whoRegistered ));
            
        }
        for (const fi of fis) {
            let whoRegistered : WhoRegistered = new WhoRegistered(fi.orgCredentials.orgNum, fi.orgCredentials.ledgerUser)
            await context.flList.putFlState(fi.orgCredentials.orgNum,new FL(fi.name, fi.idNumber, whoRegistered));
            console.info('Added <--> ', fi);
          }

        logger.info('============= END : Initialize Ledger ===========');
        return true;

    }



      
    /**
     *
     * @private
     * @param {KycContext} ctx
     * @dev extracting the CA ID
     * @returns {string} CA ID
     */
    @Transaction(false)
    @Returns('string')  
    public getCallerId(ctx:KycContext):string {
        const  logger = Shim.newLogger("KYccContract");
        logger.info('=======================getCallerId::Started==========================');
        let cid = new ClientIdentity(ctx.stub);
        const idString = cid.getID();
       
        const idParams = idString.toString().split('::');
        const mspId    = cid.getMSPID();
        console.log("---2---mspid", mspId)
        const cllaerId = idParams[1].split('CN=')[1];
        if (mspId.toUpperCase().indexOf("MSP") > 0){

            let id = mspId.substr(0, mspId.toUpperCase().indexOf("MSP"));
            return id; 
        }else {

         return idParams[1].split('CN=')[1];
        }
    }

    /**
     *
     * @private
     * @param {KycContext} ctx
     * @param {string} clientId
     * @dev tell if the caller is who registered client parameter
     * @returns {boolean} is who registered or not, return null if client does not exists or does not have data
     */
    @Transaction(false)
    @Returns('string')  
    public async isWhoRegistered(ctx:KycContext, clientId:string) {
        const  logger = Shim.newLogger("KYccContract");
        logger.info('=======================isWhoRegistered::Started==========================',clientId);
        const clientData = await ctx.cpList.getClient(clientId);
         if (!clientData || clientData === null) {
            return null;
        }
        const callerId = this.getCallerId(ctx);
        return clientData.whoRegistered.ledgerUser === callerId;
    }

    

    /**
     *
     * @param {KycContext} ctx
     * @param {object} clientData
     * @dev create a new client
     * @returns {string} new client ID
    */
    @Transaction(true)
    @Returns('string')  
    public async  createClient(ctx:KycContext, clientData:string):Promise<string> {
        const  logger = Shim.newLogger("KYccContract::createClient");
        logger.info('============= START : Create client ===========');

        let clientDetails:Client = JSON.parse(clientData);
        const callerId = this.getCallerId(ctx);
        logger.info('============= Details of data  ===========',callerId,clientDetails.whoRegistered.ledgerUser);
        if (clientDetails.whoRegistered.ledgerUser !== callerId) {
            return null;
        }
           let clientId = clientDetails.whoRegistered.orgNum.toString()+clientDetails.idNumber.toString();
           let newId = await ctx.cpList.puClient(clientId,clientDetails);
           logger.info('============= END : Create client ===========',newId);

           let createClientEvent = {
            clientId: newId,
            timestamp: new Date((ctx.stub.getTxTimestamp().getSeconds() *1000)).toUTCString()
            
           }
        ctx.stub.setEvent('CreateDigitalAssetEvent', Buffer.from(JSON.stringify(createClientEvent)));
        return newId;
    }


      /**
     *
     * @param {Context} ctx
     * @param {string} clientId
     * @param {Array} fields
     * @dev remove FI access data approval
     * @returns {boolean} return true if removed
     */
    @Transaction(true)
    @Returns('string')  
    public async remove(ctx:KycContext, clientId:string, fiId:string):Promise<boolean> {
        const  logger = Shim.newLogger("KYccContract::createClient");
        logger.info('======== START : Remove financial institution for client data access ==========');

        if (!this.isWhoRegistered(ctx, clientId)) {
            return false;
        }

        const clientFiIterator = await ctx.stub.getStateByPartialCompositeKey('clientId~fiId', [clientId, fiId]);
        const clientFiResult = await clientFiIterator.next();
        if (clientFiResult.value) {
            await ctx.stub.deleteState(clientFiResult.value.key);
        }

        const fiClientIterator = await ctx.stub.getStateByPartialCompositeKey('fiId~clientId', [fiId, clientId]);
        const fiClientResult = await fiClientIterator.next();
        if (fiClientResult.value) {
            await ctx.stub.deleteState(fiClientResult.value.key);
        }
        let removeAccess = {
            financeid: fiId,
            timestamp: new Date((ctx.stub.getTxTimestamp().getSeconds() *1000)).toUTCString()
            
           }
        ctx.stub.setEvent('removeAccess', Buffer.from(JSON.stringify(removeAccess)));

        logger.info('======== END : Remove financial institution for client data access =========');

        return true;
    }


    
    /**
     *     
     * @param {KycContext} ctx
     * @param {string} clientId
     * @param {Array} fields
     * @dev get specified fields of client data when called by an FI
     * @returns {object} client data as an object
     */
    @Transaction(false)
    @Returns('Client')  
    public async getClientData(ctx:KycContext, clientId :string, fields: string):Promise<any>{

        const  logger = Shim.newLogger("KYccContract::getClientData");
        logger.info("============= start::getClientData===============",clientId, fields);
        const clientData = await ctx.cpList.getClient(clientId);
        
        if (!clientData || clientData === null) {
            return null;
        }
        const callerId   = this.getCallerId(ctx);

        // Check caller is who registered
        if (clientData.whoRegistered.ledgerUser !== callerId) {

            // If caller is not who registered, check if caller is approved
            const relations = await this.getRelationByFi(ctx);
            if (!relations.includes(clientId)) {
                return null;
            }
        }

        // Get only requested fields
        let fieldsnew:string[] = fields.split(',').map(field => field.trim());

        let result = {};
        for (const field of fieldsnew) {
            if (clientData.hasOwnProperty(field)) {
                result[field] = clientData[field];
            }
        }
        return result;
    }

    /**
     *
     * @param {KycContext} ctx
     * @dev get financial insitution data
     * @returns {string} FI data as an object
     */
    @Transaction(false)
    @Returns('string')  
    public async getFinancialInstitutionData(ctx:KycContext) :Promise<string>{
        const  logger = Shim.newLogger("KYccContract::getFinancialInstitutionData");
        const callerId = this.getCallerId(ctx);
        logger.info("---callerid-------",callerId)
        const fiData = await ctx.flList.getFl(callerId);

        logger.info(callerId,"=======Inside======", fiData)
        if (!fiData || fiData === null) {
            return null;
        }

        return JSON.stringify(fiData);
    }

    /**
     *
     * @param {KycContext} ctx
     * @param {string} clientId
     * @param {string} fiId
     * @dev approve FI to access client data
     * @returns {boolean} return true if approved
     */
    @Transaction(true)
    @Returns('boolean')  
    public async approve(ctx: KycContext, clientId:string, fiId:string): Promise<boolean>{
        const  logger = Shim.newLogger("KYccContract::approve");
        logger.info('======== START : Approve financial institution for client data access ==========');

        const res = await this.isWhoRegistered(ctx, clientId);

        if (!res) {
            return false;
        }

        let approveAccess= {
            financeid: fiId,
            timestamp: new Date((ctx.stub.getTxTimestamp().getSeconds() *1000)).toUTCString()
            
           }
        ctx.stub.setEvent('removeAccess', Buffer.from(JSON.stringify(approveAccess)));        
        return (await ctx.cpList.approve(clientId,fiId));
    }



     /**
     *
     * @private
     * @param {KycContext} ctx
     * @param {Iterator} relationResultsIterator
     * @dev iterate a composite key iterator
     * @returns {Array} list of results of the iteration
     */
   
    async getRelationsArray(ctx:KycContext, relationResultsIterator) :Promise<string>{
        let relationsArray = [];
        while (true) {

            const responseRange = await relationResultsIterator.next();

            if (!responseRange || !responseRange.value) {
                return JSON.stringify(relationsArray);
            }

            const { attributes } = await ctx.stub.splitCompositeKey(responseRange.value.key);

            relationsArray.push(attributes[1]);
        }
    }

 /**
     *
     * @param {Context} ctx
     * @param {string} clientId
     * @dev get a list of approved FIs
     * @returns {Array} list of approved FIs
     */
    @Transaction(false)
    @Returns('string')  
    public async getRelationByClient(ctx:KycContext, clientId:string):Promise<string>{
        if (!this.isWhoRegistered(ctx, clientId)) {
            return null;
        }
        const relationResultsIterator = await ctx.stub.getStateByPartialCompositeKey('clientId~fiId', [clientId]);
        const result = await this.getRelationsArray(ctx, relationResultsIterator);
        return result;
    }
    /*
    * @param {KycContext} ctx
    * @dev get a list of clients who approved the caller FI
    * @returns {Array} list of clients who approved FI
    */
    @Transaction(false)
    @Returns('string')  
    async getRelationByFi(ctx:KycContext):Promise<string>{
        const callerID = this.getCallerId(ctx);
        const relationResultsIterator = await ctx.stub.getStateByPartialCompositeKey('fiId~clientId', [callerID]);
        const result = await this.getRelationsArray(ctx, relationResultsIterator);

        return result;
    }

    /**
     *
     * @param {KycContext} ctx
     * @dev get a list of all data stored in the ledger
     * @returns {Array} array of data of the ledger
     */
    @Transaction(false)
    @Returns('string')  
    public async queryAllData(ctx:KycContext,) :Promise<string>{
        const  logger = Shim.newLogger("KYccContract::queryAllData");
        logger.info("===========queryAllData::starte=======================");
        const startKey = '';
        const endKey = '';
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange(startKey, endKey)
        
        while (true) {
            let res = await iterator.next();
            if (res.value && res.value.value.toString()) {
            let jsonRes = {};
            logger.info(res.value.value.toString('utf8'));
              
            const strValue =res.value.value.toString('utf8');
           
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.info(err);
                record = strValue;
            }
           
            allResults.push({ Key: res.value.key.toString(), Record: record });
            
        }

        if (res.done) {

            
            await iterator.close();
            logger.info(allResults);
            return JSON.stringify(allResults);
            
        }


        }
    }


    
}
