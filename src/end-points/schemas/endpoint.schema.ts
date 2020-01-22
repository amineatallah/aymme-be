import * as mongoose from 'mongoose';

export const EndPointSchema = new mongoose.Schema({
  path: String,
  statusCode: {type:String, default: '500'},
  availableStatusCodes: Array,
  delay: {type:Number, default: 0},
  emptyArray: Boolean,
  serviceName: String,
  customHeaders: mongoose.Schema.Types.Mixed,
  forward: {type: Boolean, default: false},
  response: mongoose.Schema.Types.Mixed
}, { strict: false });
