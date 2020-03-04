export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    databaseName: process.env.DB_NAME || 'aymme',
    host: process.env.DATABASE_HOST || 'mongodb://127.0.0.1:27017/',
  }
});