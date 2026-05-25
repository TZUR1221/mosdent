import App from './app.js';
import logger from './config/logger.js';

async function main() {
  try {
    const app = new App();

    // Connect to database
    await app.connect();

    // Start server
    app.listen();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await app.disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      await app.disconnect();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start application', { error });
    process.exit(1);
  }
}

main();
