import * as mongoose from 'mongoose';

export const ReponseDataSchema = new mongoose.Schema({
    endpointId: mongoose.Schema.Types.ObjectId
}, {strict: false});
