var mongoose = require('mongoose')
var Schema = mongoose.Schema

var EmailSchema = new Schema({
  created_by: String,
  created_by_id: {type: Schema.Types.ObjectId, ref: 'AdminUser'},
  emailSended: [
    {
      id: {type: Schema.Types.ObjectId, ref: 'AdminUser'},
      message: String,
      subject: String,
      dateOfSending: Date,
      from: String,
      to: String
    }
  ],
  messageTags: {type: Schema.Types.ObjectId, ref: 'Tags'}
})

module.exports = mongoose.model('EmailsSend', EmailSchema)
