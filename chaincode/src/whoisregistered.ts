import { Object , Property } from 'fabric-contract-api';
@Object()
export class WhoRegistered{

    @Property()
    public orgNum: number;

    
    @Property()
    public ledgerUser: string;

    public constructor(orgName: number, ledgerUser: string){

        this.orgNum = orgName;
        this.ledgerUser = ledgerUser ;
    }

}