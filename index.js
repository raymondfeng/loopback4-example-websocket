const application = require('./dist');

module.exports = application;

if (require.main === module) {
  // Run the application
  const config = {websocket: {port: 3000}};
  application.main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
