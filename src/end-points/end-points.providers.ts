import { Connection } from 'mongoose';
import { EndPointSchema } from './schemas/endpoint.schema';

export const endPointProviders = [
  {
    provide: 'ENDPOINT_MODEL',
    useFactory: (connection: Connection) => connection.model('EndPoint', EndPointSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];