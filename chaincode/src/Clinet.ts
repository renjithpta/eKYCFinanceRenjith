import { Object as ContractObject, Property } from 'fabric-contract-api';
import {WhoRegistered} from './whoisregistered';
import State from './ledger-api/state';
@ContractObject()
export class Client extends State{
    @Property()
    public name: string;
    @Property()
    public dateOfBirth: string;
    @Property()
    public address: string;
    @Property()
    public idNumber: string;
    @Property()
    public email: string;
    
    @Property('whoRegistered','WhoRegistered')
    public whoRegistered : WhoRegistered;

    public constructor(name: string, dateOfBirth: string, address: string , idNumber: string, email:string,whoRegistered : WhoRegistered){
        super('org.kyc.client',  {name:name,dateOfBirth:dateOfBirth,address:address,idNumber:idNumber,email:email,whoRegistered:whoRegistered});
      
    }

}

