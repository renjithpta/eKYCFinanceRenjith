import { Object as ContractObject, Property } from 'fabric-contract-api';
import {WhoRegistered} from './whoisregistered';
import State from './ledger-api/state';
@ContractObject()
export class FL extends State{
    
    @Property()
    public name: string;
    @Property()
    public idNumber: string;
    @Property('orgCredentials','WhoRegistered')
    public orgCredentials: WhoRegistered

    public constructor(name: string,idNumber:string, orgCredentials: WhoRegistered){
       super("org.kyc.fl", {name:name,idNumber:idNumber,orgCredentials:orgCredentials});
       /* this.name= name;
        this.idNumber= idNumber;
        this.orgCredentials = orgCredentials;*/

    }

}