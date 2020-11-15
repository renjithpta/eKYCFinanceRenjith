const Notification = require('../models/notification');

exports.SaveNotificaion=function(userid, email, subjcet, message){
    const newNotification = new User({
        userid,
        email,
        subjcet,
        displayed:"no",
        message: message
    });

    newNotification.save(function (err) {
        if (err) {
            console.log(err);
            return false;
        }
      
      return true;
    });

}

exports.getNotificaion=function(userid, email){
    const newNotification = new User({
        userid,
        email,
        subjcet,
        displayed:"no",
        message: message
    });

    newNotification.save(function (err) {
        if (err) {
            console.log(err);
            return false;
        }
      
      return true;
    });

}