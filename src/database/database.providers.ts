import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async (): Promise<typeof mongoose> =>
      await mongoose.connect('mongodb+srv://bbMockServer:nottesting@mocks-w55vb.mongodb.net/mocks', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }),
  },
];