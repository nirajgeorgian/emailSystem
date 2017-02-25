var mongoose = require('mongoose')
var mongoosePaginate = require('mongoose-paginate')
var Schema = mongoose.Schema

var TagsSchema = new Schema({
    tag_name: {type: String, required: true, lowercase: true},
    tag_created_by: {type: String, required: true, lowercase: true},
    tag_creation_date: {type: String, required: true},
    tag_last_update: {
      date: Date,
      updated_by: {type: String, lowercase: true}
    }
})

module.exports = mongoose.model('TagsSchema', TagsSchema)
