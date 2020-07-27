
import * as mongoose from 'mongoose';

export const PortalModelSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  host: String,
  activePage: String,
  loginUrl: String,
  modelUrl: String,
  identityLoginUrl: String,
  client_id: {
    type: String,
    default: 'bb-tooling-client',
  },
  grant_type: {
    type: String,
    default: 'password'
  },
  useIdentity: {
    type: Boolean,
    default: false,
  },
  pages: mongoose.Schema.Types.Mixed
});




