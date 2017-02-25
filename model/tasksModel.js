var mongoose = require('mongoose')
// mongoose.Promise = require('mongoose')
var Schema = mongoose.Schema

var TasksSchema = new Schema({
      created_by: String,
      date: {type:Date, required: true},
      subject: String,
      task: String,
      created_to: String,
      created_on: Date,
      done: {type: Boolean, required: true}
})

module.exports = mongoose.model('TasksSchema', TasksSchema)
