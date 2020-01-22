export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    collection: process.env.COLLECTION_NAME || 'mocks',
    host: process.env.DATABASE_HOST || 'mongodb://127.0.0.1:27017/',
  }
});