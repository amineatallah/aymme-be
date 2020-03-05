export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    name: process.env.DB_NAME || 'aymme',
    host: process.env.DB_HOST || 'mongodb://127.0.0.1:27017/',
  }
});