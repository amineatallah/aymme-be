
import * as mongoose from 'mongoose';

export const PortalModelSchema = new mongoose.Schema({
  name: String,
  host: String,
  activePage: String,
  loginUrl: String,
  pages: mongoose.Schema.Types.Mixed
});




