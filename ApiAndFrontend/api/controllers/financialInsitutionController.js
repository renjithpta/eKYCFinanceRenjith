const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/user');
const io = require('../db/io');
const networkConnection = require('../utils/networkConnection');
const sendEmail = require('../utils/sendEmail');

exports.createClient = (req, res) => {

    const orgNum = req.orgNum;
    const ledgerUser = req.ledgerUser;

    const { login, password, name, dateOfBirth, email , address, idNumber } = req.body;
    const clientData = JSON.stringify({ name, dateOfBirth, address, idNumber, email, whoRegistered: { orgNum, ledgerUser } });

    networkConnection
        .submitTransaction('createClient', "fi"+orgNum, ledgerUser, [clientData])
        .then(async result => {
            if (result) {
                result = result.toString();
                if (result.length > 0) {
                    await io.clientCreate(login, password, result, JSON.stringify({ orgNum, ledgerUser }));
                    return res.json({ message: `New client ${result} created`, ledgerId: result });
                }
            }


        })
        .catch((err) => {
            return res.status(500).json({ error: `Something went wrong\n ${err}` });
        });
};

exports.login = async (req, res) => {

    const { login, password, userType } = req.body;

    if (!login || !password) {
        return res.status(401).json({ message: 'Invalid login/password' });
    }

    const fi = await User.findOne({
        $and:
            [
                { login },
                { userType }
            ]
    });
    if (!fi) {
        return res.status(401).json({ message: 'Invalid login' });
    }

    const isMatch = await bcrypt.compare(password, fi.password);
    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const userJWT = jwt.sign({ login }, process.env.PRIVATE_KEY, { algorithm: 'HS256' });

    return res.json({ userJWT, orgCredentials: fi.orgCredentials });
};

exports.getFiData = (req, res) => {
    console.log(req.ledgerUser,req.orgNum)

    networkConnection
        .evaluateTransaction('getFinancialInstitutionData',  "fi"+req.orgNum, req.ledgerUser)
        .then(result => {
            if (result) {
                if (result.length > 0) {
                    return res.json({ fiData: JSON.parse(result.toString()) });
                }
                return res.json({ fiData: result.toString() });
            }
            return res.status(500).json({ error: 'Something went wrong'+ req.orgNum +  ","+req.ledgerUser });
        })
        .catch((err) => {
            return res.status(500).json({ error: `Something went wrong\n ${err}` });
        });


};

async function getShareCustomerRate(customerId,orgNum, ledgerUser){

    try{
        
      return   networkConnection
            .submitPrivateTransaction('readSharedClinetRate', orgNum, ledgerUser,[customerId])
            .then(result => {
                console.log("reslt", result)
                if (result) {
                    if (result.length > 0) {
                        return  JSON.parse(result.toString()).rate;
                    }
                    return "";
                }
                return "";
            })
            .catch((err) => {
                console.log("---inside error", err)
                return "";
            });
        }catch(e){
console.log("------------------------err share reading-------------------")
            return "";
        }

}

exports.getCustomerRate = async (req, res) => {
    console.log("---in----")
    try{
    const {  customerId  } = req.body;
  console.log("----", customerId,"fi"+req.orgNum, req.ledgerUser);
    networkConnection
        .submitPrivateTransaction('readKycPrivateAsset',  "fi"+req.orgNum, req.ledgerUser,[customerId])
        .then(result => {
            console.log("reslt", result)
            if (result) {
                if (result.length > 0 ) {
                    return res.json( JSON.parse(result.toString()) );
                }
                return res.json({ "rate": ""});
            }
            return res.status(200).json({ "rate": ''});
        })
        .catch(async (err) => {
            console.log("---inside error")
            try{
           let result = await getShareCustomerRate(customerId,"fi"+req.orgNum,req.ledgerUser);
           let shared = false;
           if(result != '') shared= true;
           return res.status(200).json({ "rate": result, "shared" : shared});
            }catch(err){

                return res.status(200).json({ "rate": ""});
            }
        });
    }catch(e){
        try{
        console.log("-----------------------eroor try sare-----")
        return  getShareCustomerRate(customerId,"fi"+req.orgNum,req.ledgerUser).then(result => { return res.status(200).json({ "rate": result}); });
    }catch(err){
        return res.status(200).json({ "rate": ''});
    }
    }
        
};

exports.updateCustomerRate = async (req, res) => {
    const { customerId, rate ,oldRate } = req.body;
  console.log( " customerId, rate ,oldRate",customerId, rate ,oldRate)
  try{
    if (!oldRate || oldRate =='' || oldRate.length ==0) {
        networkConnection
        .submitPrivateTransaction('createKycPrivateAsset',  "fi"+req.orgNum, req.ledgerUser,customerId,rate);
                   
       }else{

        networkConnection
        .submitPrivateTransaction('updateKycPrivateAsset',  "fi"+req.orgNum, req.ledgerUser,customerId,rate);         
        }
               
            
            return res.status(200).json({ "message": 'Rate updated successfully!'});
    }catch(err){
                console.log("---inside error", err)
                return res.status(500).json({ error: `Something went wrong\n ${err}` });
    }

        
};
exports.shareCustomerRate = (req, res) => {

    console.log("----------cusomer rate share-----------------------")
    const { customerId, reqfiMSPID } = req.body;
  console.log( " customerId, rate ,oldRate",customerId, reqfiMSPID)
  
        networkConnection
        .submitPrivateTransaction('shareClinetRate',  "fi"+req.orgNum, req.ledgerUser,[customerId,reqfiMSPID]);         
        
      return res.status(200).json({ "message": 'Rate updated successfully!'});
       

        
};

exports.sendEmailRequest = (req, res) => {
    const {  email  } = req.body;
console.log("------inside------")
return sendEmail.sendEmail(email,  "Request access to details  from "+req.orgNum, "Hi , Please provide acess  to your details  personal account details ")
        .then(result => {
            io.SaveNotificaion("",email,"Verification:Request access to details  from FI"+req.orgNum,"Hi , Please provide acess  to your details  personal account details to verify the background");
             
            return res.status(200).json({ message: 'Mail send successfully!' });
           
          
        })
        .catch((err) => {
            console.log("in error ",err)
            return res.status(500).json({ error: `Something went wrong\n ${err}` });
        });
};

exports.getClientData = (req, res) => {

    const { clientId, fields } = req.query;

    networkConnection
        .evaluateTransaction('getClientData', "fi"+req.orgNum, req.ledgerUser, [clientId, fields || []])
        .then(result => {
            if (result) {
                if (result.length > 0) {
                    return res.json({ clientData: JSON.parse(result.toString()) });
                }
                return res.json({ clientData: result.toString() });
            }
            return res.status(500).json({ error: 'Something went wrong' });
        })
        .catch((err) => {
            return res.status(500).json({ error: `Something went wrong\n ${err}` });
        });
};

exports.getApprovedClients = async (req, res) => {
    networkConnection
        .evaluateTransaction('getRelationByFi', "fi"+req.orgNum, req.ledgerUser)
        .then(result => {
            if (result) {
                if (result.length > 0) {
                    return res.json({ approvedClients: JSON.parse(result.toString()) });
                }
            }
            return res.status(500).json({ error: 'Something went wrong' });
        })
        .catch((err) => {
            return res.status(500).json({ error: `Something went wrong\n ${err}` });
        });
};