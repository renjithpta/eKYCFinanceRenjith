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

async function instantiateChaincode(index){

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
         } );

    const orderer = client.newOrderer("grpc://localhost:17050",{
            'ssl-target-name-override':"orderer.finance.security"
    });

    const peer = [peers1, peers2, peers3];

    const channel = getOrCreateChannel("financechannel",client);


    let txId = client.newTransactionID();
    let fcn  ="init";
    let args ="[]";
    let instantiateOrUpgradeRequest = {
            'targets':peer,
            'chaincodeId': "eKYC",
            'chaincodeVersion': "1.0",
             txId,
             fcn,
             args
        };

console.log("==============Before submmitting transction========")     
            // Use a lengthy timeout to cater for building of Docker images on slower systems.  
let proposalResponseObject = await channel.sendInstantiateProposal(instantiateOrUpgradeRequest, 5 * 60 * 1000);
console.log("=== After submitting transaction========",proposalResponseObject)
  // Validate the proposal responses.
let payload = null;
const validProposalResponses = [];
console.log("=====after the trasction======")
const proposal = proposalResponseObject[1];
for (const proposalResponse of proposalResponseObject[0]) {

      if (proposalResponse instanceof Error) {
          console.log("error1")
          throw proposalResponse;
      } else if (proposalResponse.response.status !== 200) {
        console.log("error2")
          throw new Error(proposalResponse.response.message);
      } else if (proposalResponse.response.payload.length) {
        console.log("error3")
          payload = proposalResponse.response.payload;
      }
      validProposalResponses.push(proposalResponse);
  }

  // Set up the channel event hub for this transaction.
  console.log("-=====event Start =====")
  const eventHub = channel.newChannelEventHub(peers[0]);
  console.log("-=====event Start =====")
  let eventReceived  = false;
  await new Promise((resolve, reject) => {
      eventHub.connect(null, (err) => {
          // Doesn't matter if we received the event.
          if (err && !eventReceived) {
              return reject(err);
          }
          resolve();
      });
  });
  const eventHubPromise = new Promise((resolve, reject) => {
      eventHub.registerTxEvent(txId.getTransactionID(), (eventTxId, code , blockNumber) => {
          eventReceived = true;
          if (code !== 'VALID') {
              console.log(`Peer ${peerNames[0]} has rejected the transaction ${eventTxId} with code ${code} in block ${blockNumber}`)
              return reject(new Error(`Peer ${peerNames[0]} has rejected the transaction ${eventTxId} with code ${code} in block ${blockNumber}`));
          }
          resolve();
      }, (err) => {
          // Doesn't matter if we received the event.
          if (err && !eventReceived) {
              return reject(err);
          }
      }, {
          disconnect: true,
          unregister: true
      });
  });
  console.log("-=====event end  =====")
  // Send the proposal responses to the ordering service.
  const broadcastResponse = await channel.sendTransaction({
      proposal,
      proposalResponses: validProposalResponses,
      orderer,
      txId
  });

  // Check that the ordering service accepted the transaction.
  if (broadcastResponse.status !== 'SUCCESS') {
      eventHub.disconnect();
      throw new Error(`Failed to send peer responses for transaction ${txId.getTransactionID()} to orderer. Response status: ${broadcastResponse.status}`);
  }

  // Wait for the transaction to be committed to the ledger.
  await eventHubPromise;

  // Return the payload, if any.
console.log("===FInal Payload=====",payload)


        


}


function getOrCreateChannel(channelName, client) {
    let channel = client.getChannel(channelName, false);
    if (!channel) {
        channel = client.newChannel(channelName);
    }
    return channel;
    
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

async function invokeInstantiation(){
   await  instantiateChaincode(0);
   await  instantiateChaincode(1);
   await  instantiateChaincode(2);
}
    
invokeInstantiation()