/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity, ChaincodeInterface } from 'fabric-shim';
import { KycContract } from './ekyc-contract';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');
import KycContext from './kyccontext';
import { KeyPairSyncResult } from 'crypto';
import { StateList } from './ledger-api/statelist';
import { Client } from './Clinet';
import { ClientList } from './ClientList';
import { FlList } from './fllist';
import { expect } from 'chai';
import {ChaincodeMockStub, Transform} from '@theledger/fabric-mock-stub';
import { WhoRegistered } from './whoisregistered';
import { FL } from './fl';
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);
let cert='-----BEGIN CERTIFICATE-----'+
'MIICujCCAmGgAwIBAgIUGBUGI6ZY0b6H+xE16d16wEmmmrYwCgYIKoZIzj0EAwIw'+
'fzELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh'+
'biBGcmFuY2lzY28xHzAdBgNVBAoTFkludGVybmV0IFdpZGdldHMsIEluYy4xDDAK'+
'BgNVBAsTA1dXVzEUMBIGA1UEAxMLZXhhbXBsZS5jb20wHhcNMjAwODMxMTYwNjAw'+
'WhcNMjEwODMxMTYxMTAwWjBgMQswCQYDVQQGEwJVUzEXMBUGA1UECBMOTm9ydGgg'+
'Q2Fyb2xpbmExFDASBgNVBAoTC0h5cGVybGVkZ2VyMQ8wDQYDVQQLEwZjbGllbnQx'+
'ETAPBgNVBAMTCEZJMkFkbWluMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEjn8y'+
'B7c3be7vGVU07R3jKQ14aiUO+xdQJcAlioYqEF/X3k7d2US/IeIyLMnI/Jct+6pe'+
'eUF9r7DEobWtqKqreaOB2TCB1jAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0TAQH/BAIw'+
'ADAdBgNVHQ4EFgQUREHjueDRmYU+tTs4ysIulblsmY4wHwYDVR0jBBgwFoAUF2dC'+
'Paqegj/ExR2fW8OZ0bWcSBAwGQYDVR0RBBIwEIIOaXAtMTAtMjUxLTQtNjcwWwYI'+
'KgMEBQYHCAEET3siYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiIiLCJoZi5FbnJv'+
'bGxtZW50SUQiOiJGSTJBZG1pbiIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYIKoZI'+
'zj0EAwIDRwAwRAIgNllWXpFj0EdXbrobXeHiJyqguUiDhMlM0/x8Sry6xOECIH3U'+
'WNYqB+7eev/LmeAa3xC/It0nutRHKWRM21WK0qeX'+
'-----END CERTIFICATE-----';


class TestContext implements Context {

    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);


    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}



describe('eKYCContract', () => {

    let contract: KycContract;
    let ctx:  sinon.SinonStubbedInstance<KycContext>;
    let stub: sinon.SinonStubbedInstance<ChaincodeStub>;
    let clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> ;
    let clientList: ClientList;
    let flList: FlList;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        
        contract = new KycContract();
        ctx = sinon.createStubInstance(KycContext);
        stub = sinon.createStubInstance(ChaincodeStub)
        clientIdentity = sinon.createStubInstance(ClientIdentity); 
        
        sandbox = sinon.createSandbox();
        
        (ctx as any)._clientIdentity = clientIdentity;
     
      
       
        (ctx as any).stub = stub;
        clientList = new ClientList(ctx);
        flList = new FlList(ctx);
        (ctx as any).cpList = clientList;
        (ctx as any).flList = flList;
    
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#createClient', () => {

        var data = {
            "name": "user02",
            "dateOfBirth": "1991-11-19",
            "address": "Mississauga, ON - Canada",
            "idNumber": "839047",
            "email":"re@ge.com",
            "whoRegistered": {
                "orgNum": 2,
                "ledgerUser": "FI2"
            }
        };

        it('should create a client', async () => {

        sinon.stub(contract, 'getCallerId').callsFake(() => { return "FI2"; });
        
           let result =  await contract.createClient(ctx, JSON.stringify(data));
           
           let clientId = data.whoRegistered.orgNum.toString()+data.idNumber.toString();
            ctx.stub.putState.should.have.been.calledWithExactly('CLIENT'+clientId, Buffer.from(JSON.stringify(data)));
        });
      
        it('should create a client', async () => {
              sinon.stub(contract, 'getCallerId').callsFake(() => { return "FI1"; });
            
               let result =  await contract.createClient(ctx, JSON.stringify(data));
               
               expect(result == null)
            });


        it('should create a client', async () => {
            sinon.stub(contract, 'getCallerId').callsFake(() => { return "FI2"; });
          
             let result =  await contract.createClient(ctx, JSON.stringify(data));
           
          });
                

          it('should throw error for same idNumber client', async () => {
            sinon.stub(contract, 'getCallerId').callsFake(() => { return "FI2"; });
          
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
             try{
             let result = await contract.createClient(ctx, JSON.stringify(data));
             console.log("------------------------------",result)
             }catch(ex){
                 console.log("Error",ex)
                 expect(ex.toString().indexOf("already exits")> 0)
             }
             console.log("result")
             expect(key != null)
          });

       

    });



    



    describe('#init', () => {

        

        it('should initalize properly', async () => {
        
           let result =  await contract.init(ctx);
           expect(result == true)
         
            ctx.stub.putState.should.have.been.calledWith("FI2");
            ctx.stub.putState.should.have.been.calledWith("FI2");

        });
      
       

    });



    describe('#Callerid', () => {

        


        it('should return caller id', async () => {
              
        const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
         stub.setCreator("F12MSP")
        ctx.stub = stub;
        let result =  await contract.getCallerId(ctx);
      
        expect(result ='F12')    
                  
         });
          

        it('should return caller id', async () => {
              
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
             stub.setCreator("F12")
            ctx.stub = stub;
            let result =  await contract.getCallerId(ctx);
           
            expect(result !='F12')    
                      
            });
     

      
       

    });



    describe('#isWhoRegistered', () => {

        

        var data = {
            "name": "user02",
            "dateOfBirth": "1991-11-19",
            "address": "Mississauga, ON - Canada",
            "idNumber": "839047",
             "email":"re@tets.com",
            "whoRegistered": {
                "orgNum": 2,
                "ledgerUser": "FI2"
            }
        };


        it('geWhoRegisterd', async () => {
         sinon.stub(contract, 'getCallerId').callsFake(() => { return "FI2"; });
            let result =  await contract.createClient(ctx, JSON.stringify(data));
            console.log("result",result)
            let whoRegisterd =await contract.isWhoRegistered(ctx, result);
                expect(whoRegisterd == true)//
                expect(contract.getCallerId).callCount(1)
        });

        it('geWhoRegisterd return false', async () => {
            sinon.stub(contract, 'getCallerId').callsFake(() => { return "FI2"; });         
             let result =  await contract.createClient(ctx, JSON.stringify(data));
             expect(contract.getCallerId).callCount(1);
             let whoRegisterd =await contract.isWhoRegistered(ctx, result);
             let callerId = contract.getCallerId(ctx);
             expect(contract.getCallerId).callCount(2);
             expect(callerId == 'FI2')
          });
        
      
       

    });


 

describe('#getFinancialInstitutionData', () => {


       

        
        it('getFinancialInstitutionData successfully', async () => {

            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI1MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            console.log("--------------------------1----------------------");
            let whoRegistered : WhoRegistered = new WhoRegistered(2, "FI1");
            let flData = new FL("FI1", "123353257", whoRegistered)
           // let key =await ctx.flList.putFlState("2",flData);
            stub.setCreator("FI1MSP");
            await contract.init(ctx);
            console.log("--------------------------2---------------------")
            ctx.stub = stub;
            console.log("------6---------------6")
            let searchResultstr =  await contract.getFinancialInstitutionData(ctx);
            console.log("--------------------------1-searchresult---------------------",searchResultstr)
             let searchResult = JSON.parse(searchResultstr)
            expect(searchResult.orgCredentials.ledgerUser == whoRegistered.ledgerUser)
            expect(searchResult.orgCredentials.orgNum == whoRegistered.orgNum)

            expect(searchResult.name == flData.name)
            expect(searchResult.idNumber== flData.idNumber)
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            
        });



        it('getFinancialInstitutionData mismatch caller identity: Not return data', async () => {

            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI1MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let whoRegistered : WhoRegistered = new WhoRegistered(2, "FI1");
            let flData = new FL("FI1", "123353257", whoRegistered)
            let key =await ctx.flList.putFlState("2",flData);
            stub.setCreator("F133MSP");
            ctx.stub = stub;
            let searchResult =  await contract.getFinancialInstitutionData(ctx);
            console.log("---search result------",searchResult);
            expect(searchResult == null)
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            
        });

        
      
       

    });
   


    describe('#getClientData', () => {
 
        var data = {
            "name": "user02",
            "dateOfBirth": "1991-11-19",
            "address": "Mississauga, ON - Canada",
            "idNumber": "839047",
            "email":'re@test.com',
            "whoRegistered": {
                "orgNum": 2,
                "ledgerUser": "FI2"
            }
        };

        it('getClientData successfully', async () => {

            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
           
            console.log("=====key=======",key)
            let searchResult =  await contract.getClientData(ctx,key,'name,idNumber');
            
            console.log("==========Search Result===========", searchResult)

            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            expect(searchResult.name == data.name)
            expect(searchResult.idNumber == data.idNumber)
            
        });

        it('getClientData fileds combination successfully', async () => {

            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
                  
            let searchResult =  await contract.getClientData(ctx,key,'name,address');
            
            

            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            expect(searchResult.name == data.name)
            expect(searchResult.idNumber == data.address)
            
        });


        it('getClientData unauthorized call return null', async () => {

            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
                       stub.setCreator("FI1MSP");
            let searchResult =  await contract.getClientData(ctx,key,'name,address,whoRegisterd');
            console.log("==========Search Result===========", searchResult)
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            expect(searchResult== null)
          
            
        });



        it('getClientData all fields comparision ', async () => {
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
           
            console.log("=====key=======",key)
            let searchResult:Client =  await contract.getClientData(ctx,key,'name,dateOfBirth,address,idNumber,email,whoRegistered');
            let  whoReg = searchResult.whoRegistered;
            console.log("==========Search Result===========", whoReg)
                        
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            expect(searchResult).to.deep.equal(data)
        });
            

        it('getClientData unauthorized call return null', async () => {

            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
                       stub.setCreator("FI1MSP");
            let searchResult =  await contract.getClientData(ctx,key,'name,address,whoRegisterd');
            console.log("==========Search Result===========", searchResult)
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            expect(searchResult== null)
          
            
        });



        it('getClientData  should return null ', async () => {
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
              let searchResult:Client =  await contract.getClientData(ctx,"CLIENT0123",'name,dateOfBirth,address,idNumber,whoRegistered');
           
            expect(searchResult = null);
        });

        
      
       

    });
 

    describe('#approve', () => {

        var data = {
            "name": "user02",
            "dateOfBirth": "1991-11-19",
            "address": "Mississauga, ON - Canada",
            "idNumber": "839047",
            "email":'re@test.com',
            "whoRegistered": {
                "orgNum": 2,
                "ledgerUser": "FI2"
            }
        };

        it('#approve Client approve Finance Institution eKYC request ', async () => {
        
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
           
           
            let result:boolean =  await contract.approve(ctx,key,"FI1");
           
                          
           
            expect( result  == true);   
            stub.setCreator("FI1MSP");
            let fields =  await contract.getClientData(ctx,key,"name,address");
            expect(fields.name == data.name)
            expect(fields.address == data.address)
                        
            stub.setCreator("FI3MSP");
            fields =  await contract.getClientData(ctx,key,"name,address");
            expect(fields == null)

            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")

        });


        it('#approve return null incase called by fi is not registerd', async () => {
        
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
            stub.setCreator("FI1MSP");
            console.log("=====key=======",key)
            let result:boolean =  await contract.approve(ctx,key,"FI1");
           
            console.log("==========Approve Result===========", result)
                        
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            expect( result  == false);        
        });
      

    });

   describe('#getRelationByClient', () => {

        var data = {
            "name": "user02",
            "dateOfBirth": "1991-11-19",
            "address": "Mississauga, ON - Canada",
            "idNumber": "839047",
            "email":"email@email.com",
            "whoRegistered": {
                "orgNum": 2,
                "ledgerUser": "FI2"
            }
        };

        it('#getRelationByClient of all the approved', async () => {
        
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
            let result:boolean =  await contract.approve(ctx,key,"FI1");
            expect( result  == true);   
            let fields =  await contract.getRelationByClient(ctx,"CLIENT2839047");
            console.log("----------------",fields)
            let fis = JSON.parse(fields)
            expect(fis.length == 2)
            expect(fields != null)
            expect(fis[0] =='FI2' )
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")

        });


        it('##getRelationByClient of all the should be null', async () => {
        
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
            stub.setCreator("FI1MSP");
            let result =  await contract.getRelationByClient(ctx,"CLIENT2839047");
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")
            expect( result  == null);        
        });
      

    });
     



   
    describe('#remove', () => {

        
        var data = {
            "name": "user02",
            "dateOfBirth": "1991-11-19",
            "address": "Mississauga, ON - Canada",
            "idNumber": "839047",
            "email":'re@test.com',
            "whoRegistered": {
                "orgNum": 2,
                "ledgerUser": "FI2"
            }
        };
        it('#Remove approval succesffully', async () => {
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
           
           
            let result:boolean =  await contract.approve(ctx,key,"FI1");
           console.log("result====", result)
                          
           
            expect( result  == true);   
            stub.setCreator("FI2MSP");
            let fields =  await contract.remove(ctx,"FI1","name, address");
            expect(fields == true)
           
           
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")


        });


        it('#remove failed', async () => {
         const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
           
           
            let result:boolean =  await contract.approve(ctx,key,"FI1");
           console.log("result====", result)
                          
           
            expect( result  == true);   
            stub.setCreator("FI1MSP");
            let fields =  await contract.remove(ctx,"FI1","name, address");
            expect(fields == false)
           
           
            stub.mockTransactionEnd("12345678uiiiiiiiiiiiiiiiiiiiiiiii")

        });
      
      
       

    });


   
    describe('#getRelationByFi', () => {

        
        var data = {
            "name": "user02",
            "dateOfBirth": "1991-11-19",
            "address": "Mississauga, ON - Canada",
            "idNumber": "839047",
            "email":'re@test.com',
            "whoRegistered": {
                "orgNum": 2,
                "ledgerUser": "FI2"
            }
        };
        it('#getRelationByFi get the relation with FI org and client successfully', async () => {
        
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
            let relation  = await contract.getRelationByFi(ctx);
            relation = JSON.parse(relation)
            expect(relation).to.deep.equal([key])

        });


        it('#getRelationByFi get the relation  empty array with FI org and client successfully', async () => {
        
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
            let key =  await contract.createClient(ctx, JSON.stringify(data));
            stub.setCreator("FI1MSP");
            let relation  = await contract.getRelationByFi(ctx);
            relation = JSON.parse(relation)
            expect(relation).to.deep.equal([])

        });
      
      
       

    });

    describe('#queryAllData', () => {

        

        it('should return all the data', async () => {
            const stub = new ChaincodeMockStub('MyMockStub', contract as any ,  cert);
            stub.setCreator("FI2MSP");
            ctx.stub = stub;
            clientList = new ClientList(ctx);
            flList = new FlList(ctx);
            ctx.cpList = clientList;
            ctx.flList = flList;
            stub.mockTransactionStart("oxertyuiiiiiiiiiiiiiiiiiiiiiiiii");
 
        
           let result =  await contract.init(ctx);

           let allData  = await contract.queryAllData(ctx);
           let allDataParsed = JSON.parse(allData)

           let filteredData=allDataParsed.filter(object=>object.Key==='CLIENT1873451');
           //console.log("Fileterd========================================",filteredData[0].Record.name)
           expect(filteredData[0].Record.name).to.be.equal('user01');
          
            filteredData=allDataParsed.filter(object=>object.Key==='CLIENT18734512');
            expect(filteredData.length == 0)
          // console.log("Fileterd========================================",filteredData[0].Record.name)
          // expect(filteredData[0].Record.name).to.be.equal('user02')
           
           
        });
      
       

    }); 



});
