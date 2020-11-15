'use strict';

import { StateList } from './ledger-api/statelist';
import { Client } from './Clinet';
import { WhoRegistered } from './whoisregistered';

export class ClientList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.kyc.client');
        this.use(Client, "org.kyc.client");
    }

    public async puClient(id :string,client:Client) :Promise<string>{
        
        return this.addClientState(id,client,client.whoRegistered.ledgerUser);
    }
   
    public async putFlState(id:string,fl:WhoRegistered) {
        return this.addFlState(id,JSON.stringify(fl));
    }


    public async getClient(key:string) : Promise<any>{
      const client = await this.getState(key);
      return client;
    }

    public async updateClient(client:any,key:string) {
        return this.updateState(client,key);
    }

    public async approve(clientId:string, fiId:string) :Promise<boolean>{
        return  this.approveFieldAccessState(clientId,fiId)
    }
}