
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const NotificationSchema = Schema(
    {
        userid: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        },
        subject: {
            type: String,
            required: true,
            
        },
        displayed: {
            type: String,
            required: true,
            
        },
        message: {
            type: String,
            required: true
        }
    }
);
module.exports = mongoose.model('Notification', NotificationSchema);