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
  match: {},
  response: mongoose.Schema.Types.Mixed
}, { strict: false });

export const ProjectSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true},
  endpoints: {
    type: Array,
    Schema: EndPointSchema
  },
  config: {
    username: String,
    password: String,
    host: String,
    identityLoginUrl: {
      type: String,
      default: 'https://<HOST_and_PORT>/auth/realms/<REALM_NAME>/protocol/openid-connect/token'
    },
    regex: {
      type: String,
      default: '/gateway'
    },
    loginUri: {
      type: String,
      default: 'api/auth/login'
    },
    whitelist_params: {
      type: Array,
      default: ['periodEndDate', 
      'periodStartDate', 
      'creditDebitIndicator', 
      'accountId', 
      'currencyTo', 
      'currencyFrom', 
      'arrangementId', 
      'arrangementIds', 
      'businessFunction', 
      'resourceName', 
      'privilege', 
      'status', 
      'intervalDuration']
    }
  }
}, { strict: false });
