'use strict';

import { StateList } from './ledger-api/statelist';
import { FL } from './fl';
import { WhoRegistered } from './whoisregistered';

export class FlList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.kyc.fl');
        this.use(FL, "org.kyc.fl");
    }

    
    public async putFlState(id:string,fl:FL):Promise<string>{
        return this.addFlState(id,fl);
    }


    public async getFl(key:string):Promise<FL> {
        return this.getState(key);
    }

    public async updateClient(fl:FL,key:string) {
        return this.updateState(fl,key);
    }
}