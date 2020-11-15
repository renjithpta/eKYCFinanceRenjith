const fabricClient  = require('fabric-client');

const { FileSystemWallet, Gateway, User, X509WalletMixin } = require('fabric-network');
const fs            = require('fs-extra')
const pathFs        = require('path')
let profile = {

    FI1:{

        "Wallet" :"network/wallets/FI1",
        "CCP": "network/gateways/FI1/FI1 gateway.json"
    }
}

async function installChaincode(pathToPackage){
    let gateWay = await getConnectedGateway() ;
    client = gateWay.getClient();
    const peers1 = client.newPeer("grpc://localhost:18051",{
   'ssl-target-name-override':"peer0.fi1.finance.security"
    });
   
    const peers2 = client.newPeer("grpc://localhost:19051",{
   'ssl-target-name-override':"peer0.fi2.finance.security"
    });

    const peers3 = client.newPeer("grpc://localhost:20051",{
        'ssl-target-name-override':"peer0.fi3.finance.security"
         });
     

    const peer = [peers1, peers2, peers3];
    var request = {


        targets: peer,
        chaincodePath:pathToPackage,
        chaincodeId:"eKyc",
        chaincodeVersion:"0.0.1",
        chaincodeType:"node"
    };
    const pkgBuffer  = await fs.readFile(pathToPackage);
    const installRequest = {
        targets: peer,
        chaincodePackage: pkgBuffer,
        txId: this.client.newTransactionID()
    };
    const response  = await client.installChaincode(installRequest);
    const proposalResponse = response[0][0];
    if (proposalResponse instanceof Error) {
        throw proposalResponse;
    } else if (proposalResponse.response.status !== 200) {
        throw new Error(proposalResponse.response.message);
    }else{
        console.log(response)
    }
}




async function getConnnectionOptions(){
console.log("==== start=======")
    let parent =  pathFs.join(__dirname,"..","..");
    let wallet =  new FileSystemWallet(parent+"/"+profile.FI1.Wallet);
    const isExists = await wallet.exists("F11Admin");
    console.log("======",isExists)

    let connnectionOptions = {

        identity:"F11Admin",
        wallet : wallet,
        discovery:{ enabled : true, asLocalHost:true}
    };
    console.log("=== end=======")
    return connnectionOptions;
}

async function getConnectedGateway() {

    let parent =  pathFs.join(__dirname,"..","..");
    const connectionProfileContents = await fs.readFile(parent+"/"+profile.FI1.CCP, 'utf8');
    let connectionProfile = JSON.parse(connectionProfileContents);
    let connnectionOptions =await getConnnectionOptions();
    let gateway = new Gateway()
    console.log("=== start conecttion=====")
    await gateway.connect(connectionProfile,connnectionOptions );
    return gateway;

}

    
installChaincode(pathFs.join(__dirname,"..")+"/api/eKYC@0.0.1.cds")