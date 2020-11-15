import * as chai from 'chai';

import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import State from './ledger-api/state';
import 'reflect-metadata';

// tslint:disable:max-classes-per-file

const should = chai.should();
chai.use(sinonChai);

describe ('#State', () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });


    describe ('callConstructor', () => {
        it ('should throw an error if class is not instance of state', () => {
            new State("Org",{client:{name:"test"}}).getType().should.equal("Org");
        });


    });

    describe ('makeClientKey', () => {
        it ('should return a key with key CLIENT', () => {
            State.makeClientKey("12345").should.deep.equal("CLIENT12345");
        });
    });



    describe ('setType', () => {
        it ('should return a key with key CLIENT', () => {
           let state= new State("Org",{client:{name:"test"}});
           state.setType("Client")
           state.getType().should.deep.equal("Client");
        });
    });


     describe ('makeFlKey', () => {
        it ('should return a key with key FI1', () => {
            State.makeFlKey("1").should.deep.equal("FI1");
        });
    });

      describe ('makeCompositeKeyClientFL', () => {
        it ('should return a key with key clientId~fiId', () => {
            State.makeCompositeKeyClientFL().should.deep.equal("clientId~fiId");
        });
    });




});

