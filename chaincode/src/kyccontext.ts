import { Context } from 'fabric-contract-api';

// Utility classes
import ISerializer from './ledger-api/serializer';
import StateSerializerFactory from './ledger-api/StateSerializerFactory';
import { Client } from './Clinet';
import { ClientList } from './ClientList';
import { FlList } from './fllist';

/**
 * Define custom context for commercial paper by extending Fabric ContractAPI's Context class
 */
export default class KycContext extends Context {

    public cpList: ClientList;
    public flList : FlList;
    public transactionSerializer: ISerializer;

    constructor() {
        super();
        this.cpList = new ClientList(this);
        this.flList = new FlList(this);
        this.transactionSerializer = StateSerializerFactory.getTransactionSerializer();
    
    }

    /** should be pushed into 'chaincode from contract' class so that the code just returned what it needs to */
    public returnClient(client: Client): Buffer {
        return this.transactionSerializer.toBuffer(client);
    }
}