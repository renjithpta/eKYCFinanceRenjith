const User = require('../models/user');
const Notification = require('../models/notification');

exports.clientCreate = async function (login, password, ledgerId, whoRegistered) {
    const newClient = new User({
        login,
        password,
        ledgerId,
        whoRegistered
    });

    newClient.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('New client: ' + newClient.login);
    });
};

exports.fiCreate = async function (login, password, ledgerId, ledgerUser, orgNum) {
    const newFi = new User({
        login,
        password,
        ledgerId,
        ledgerUser,
        orgNum
    });

    newFi.save(function (err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('New fi: ' + newFi.login);
    });
};

exports.SaveNotificaion= async function(userid, email, subjcet, message){
    console.log("inside message save")
    const newNotification = new Notification({
        userid:userid,
        email:email,
        subject:subjcet,
        displayed:"no",
        message: message
    });

    newNotification.save(function (err) {
        console.log("save  message after",err)
        if (err) {
            console.log(err);
            return false;
        }
        console.log("inside message save")
      return true;
    });

}

exports.getNotificaion=async function(userid, email){
console.log("---get notification----",email)
    return Notification.find( {
        $and: [
            { $and: [{userid: userid}, {email: email}] },
            { $or: [{displayed: 'no'}, {displayed: 'No'}] }
        ]
    }, function(err, result) 
    {
     console.log(err, result);
       return result;
   
    });

    

}

exports.updateNotification= async function(email){

    console.log(" Indide update notification");

    Notification.deleteMany({ email: email}, function (err) {
        if(err) console.log(err);
        console.log("Successful deletion");
      });

   
   
}