const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Item = new Schema({
  name: {
    type: String,
    required: true
  },
  data: {
    type: String,
    required: true
  }
});
mongoose.model('items', Item);
