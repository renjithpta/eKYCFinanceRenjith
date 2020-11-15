import * as chai from 'chai';
import * as chaiAsPromied from 'chai-as-promised';
import { ChaincodeStub } from 'fabric-shim';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import  KycContext from './kyccontext';
import State from './ledger-api/state';
import { StateList } from './ledger-api/statelist';
import { expect } from 'chai';

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromied);

// tslint:disable:max-classes-per-file

describe ('#StateList', () => {

    
    let sandbox: sinon.SinonSandbox;
    
    let stub: sinon.SinonStubbedInstance<ChaincodeStub>;
    let mockContext: sinon.SinonStubbedInstance<KycContext> = sinon.createStubInstance(KycContext);
    let mockState: sinon.SinonStubbedInstance<State>;

    let stateList: StateList;

    let splitKeyStub: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        mockContext = sinon.createStubInstance(KycContext);
        mockContext.stub = sinon.createStubInstance(ChaincodeStub);
        mockState = sinon.createStubInstance(State);
        stateList = new StateList(mockContext, 'some list name');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe ('constructor', () => {
        it ('should assign values', () => {
            (stateList as any).ctx.should.deep.equal(mockContext);
            stateList.name.should.deep.equal('some list name');
          
        });
    });

    describe ('addClientState', () => {

        beforeEach(() => {
           // mockState.serialize.returns('some serialized value');
          
        });
        

        it ('should not add new client', async () => {

            const existsStub = sandbox.stub(stateList, 'isExits').resolves(true);
            let result =  await stateList.addClientState("12345",mockState,"123").should.be.rejectedWith(
                '12345 alrady exits with another customer!',
            );;
                        
            existsStub.should.have.been.calledOnceWithExactly('CLIENT12345');

            
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).createCompositeKey
                .should.not.have.been.called;
         
           
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).putState.should.not.have.been.called;
     
        });


        it ('should add new client', async () => {

             //const existsStub = sandbox.stub(stateList.ctx.stub, 'getState').resolves(Buffer.from("something"));
             let result =  await stateList.addClientState("12345",mockState,"123");
                         
            expect(result =='CLIENT12345');
               
         //   existsStub.should.have.been.calledOnceWithExactly('state key');
            
            



            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).createCompositeKey
                .should.have.been.called;
          
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).putState.should.have.been.called;
        });
    });




    describe ('addFIState', () => {

        beforeEach(() => {
           // mockState.serialize.returns('some serialized value');
          
        });
        

        it ('should not add FI', async () => {

            const existsStub = sandbox.stub(stateList, 'isExits').resolves(true);
            let result =  await stateList.addFlState("12345",mockState).should.be.rejectedWith(
                '12345 alrady exits with another customer!',
            );;
                        
            existsStub.should.have.been.calledOnceWithExactly('FI12345');

            
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).createCompositeKey
                .should.not.have.been.called;
         
           
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).putState.should.not.have.been.called;
     
        });


        it ('should add FI ', async () => {

            const existsStub = sandbox.stub(stateList, 'isExits').resolves(false);
             let result =  await stateList.addFlState("12345",mockState);
                         
            expect(result =='FI12345');
               
           existsStub.should.have.been.calledOnceWithExactly('FI12345');
            
            
     
            
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).putState.should.have.been.called;
        });
    });





    describe ('approveFieldAccessState', () => {

        beforeEach(() => {
           // mockState.serialize.returns('some serialized value');
          
        });
        

        it ('should put in world state ', async () => {


            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).createCompositeKey.resolves("test");

            let result =  await stateList.approveFieldAccessState("12345","fi1");
         
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).createCompositeKey
                .should.have.been.called;
         
           
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).putState.should.have.been.called;
     
        });


        it ('should  not  in world state ', async () => {

          
              await stateList.approveFieldAccessState("12345","fi1").should.have.been.rejected;
                         
                    
            // tslint:disable-next-line:no-unused-expression
            (mockContext.stub as sinon.SinonStubbedInstance<ChaincodeStub>).putState.should.not.have.been.called;
        });
    });

});