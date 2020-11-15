
const utils = require('./utils.js');

async function getGateWay(orgNumber, userName) {
    // l
}

exports.evaluateTransaction = async (transaction, orgNumber, userName, params = null) => {

    await utils.connectGatewayFromConfig(orgNumber.toLowerCase());
    let contract = await utils.setUserContext(userName,"pass");
    let args =[];
    if(params){

        if(typeof (params) =='string' )  {
            console.log("instring")
            args.unshift(params);
        }else {
            for(var i = params.length -1; i >=0; i--) {args.unshift(params[i].toString());console.log() }
        }

    } 
    args.unshift(transaction);
// Insert contract as args[0]
    args.unshift(contract);

    let result = await utils.submitTx.apply("unused", args);
    console.log(result);
    return result;
};

exports.submitTransaction = async (transaction, orgNumber, userName, params = null) => {

    await utils.connectGatewayFromConfig(orgNumber.toLowerCase());
    let contract = await utils.setUserContext(userName,"pass");
    let args =[];
    if(params){

        if(typeof (params) =='string') {
            console.log("instring")
            args.unshift(params);
        }else {
            for(var i = params.length -1; i >=0; i--) {args.unshift(params[i].toString());console.log() }
        }

    } 
    args.unshift(transaction);
// Insert contract as args[0]
    args.unshift(contract);
    let result = await utils.submitTx.apply("unused", args);
    console.log(result);
    return result;
};

exports.submitPrivateTransaction = async (transaction, orgNumber, userName, params, rate = null) => {
console.log(params.toString())
    await utils.connectGatewayFromConfig(orgNumber.toLowerCase());
    let contract = await utils.setPrivateUserContext(userName,'pass');
    let result   =  null;
    if( rate  && rate.trim().length >= 1)
     result = await utils.submitPrivateTx(contract,transaction ,{"customerrate" : Buffer.from(rate)} , params);
     else
     result = await utils.submitPrivateTx(contract,transaction , rate , params);
    console.log(result);
    return result;
};

