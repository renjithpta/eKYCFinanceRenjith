/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';
import { Context } from 'fabric-contract-api';
import ISerializer from './serializer';
import State from './state';
import StateSerializerFactory from './StateSerializerFactory';
/**
 * StateList provides a named virtual container for a set of ledger states.
 * Each state has unique key which associates it with the container, rather
 * than the container containing a link to the state. This minimizes collisions
 * for parallel transactions on different states.
 */
export class StateList {

    public name: string;
    public ctx: Context;
    public serializer: ISerializer;

    /**
     * Store Fabric context for subsequent API access, and name of list
     */
    constructor(ctx, listName) {
        
        this.ctx = ctx;
        this.name = listName;
        this.serializer = StateSerializerFactory.getLedgerSerializer();
       
        
    }
    
    public async isExits(id:string): Promise<boolean>{

        const isExisting = await this.ctx.stub.getState(id);
        if( isExisting  && isExisting.length > 0) {
            return  true;
        }

        return false;

    }


    /**
     * Add a client state to the list. Creates a new state in worldstate with
     * appropriate composite key.  Note that state defines its own key.
     * State object is serialized before writing.
     */
    public async addClientState(id:string,state, whoRegistered) :Promise<string>{
        const data = this.serializer.toBuffer(state);
        let newClientId =State.makeClientKey(id);
        const isExisting = await this.isExits(newClientId);
        if(isExisting) {
            throw new Error(`${id} alrady exits with another customer!`);

        }
        await this.ctx.stub.putState( newClientId,  data);
        let rtData = await this.ctx.stub.getState( newClientId);
        const clientFiIndexKey = await this.ctx.stub.createCompositeKey('clientId~fiId', [newClientId, whoRegistered]);
        const fiClientIndexKey = await this.ctx.stub.createCompositeKey('fiId~clientId', [whoRegistered, newClientId]);
        await this.ctx.stub.putState(clientFiIndexKey, Buffer.from('\u0000'));
        await this.ctx.stub.putState(fiClientIndexKey, Buffer.from('\u0000'));
        return newClientId;

    }


    
    


      /**
     * Add a Final Institute state to the list. Creates a new state in worldstate with
     * appropriate composite key.  Note that state defines its own key.
     * State object is serialized before writing.
     */
    public async addFlState(id,state):Promise<string> {
        
        const data = this.serializer.toBuffer(state);
        let key = State.makeFlKey(id);
        const isExisting = await this.isExits(key);
        if( isExisting) {
            throw new Error(`${id} alrady exits with another customer!`);

        }
        await this.ctx.stub.putState(key, data);
        return key;
    }

    /**
     * Get a state from the list using supplied keys. Form composite
     * keys to retrieve state from world state. State data is deserialized
     * into JSON object before being returned.
     */
    public async getState(ledgerkey):Promise<any> {
       
        const data = await this.ctx.stub.getState(ledgerkey);
        if (!data || data.length === 0) {
            return null;
        }
           
        return  JSON.parse(data.toString());
    }

    /**
     * Update a state in the list. Puts the new state in world state with
     * appropriate composite key.  Note that state defines its own key.
     * A state is serialized before writing. Logic is very similar to
     * addState() but kept separate becuase it is semantically distinct.
     */
    public async updateState(state:any,key:string) {
       ;
        const data = this.serializer.toBuffer(state);
        await this.ctx.stub.putState(key, data);
    }

    /**
     * Update a state in the list. Puts the new state in world state with
     * appropriate composite key.  Note that state defines its own key.
     * A state is serialized before writing. Logic is very similar to
     * addState() but kept separate becuase it is semantically distinct.
     */
    public async approveFieldAccessState(clientId:string, fiId:string) :Promise<boolean>{
        ;
        const clientFiIndexKey = await this.ctx.stub.createCompositeKey('clientId~fiId', [clientId, fiId]);
        const fiClientIndexKey = await this.ctx.stub.createCompositeKey('fiId~clientId', [fiId, clientId]);

        if (!clientFiIndexKey) {
            throw new Error('Composite key: clientFiIndexKey is null');
        }

        if (!fiClientIndexKey) {
            throw new Error('Composite key: fiClientIndexKey is null');
        }

        await this.ctx.stub.putState(clientFiIndexKey, Buffer.from('\u0000'));
        await this.ctx.stub.putState(fiClientIndexKey, Buffer.from('\u0000'));
        return true;

     }

    /** Stores the type and the deserialization function required
     * Useful for subclasses of this to hid the details.
     */
    public use(stateClass: object, type: string) {
        this.serializer.use(stateClass, type);
    }

}