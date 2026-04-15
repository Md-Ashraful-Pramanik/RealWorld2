const express = require('express');
const cors = require('cors');

const config = require('./config/env');
const { initDb, closeDb } = require('./config/db');
const routes = require('./routes');
const { attachCurrentUser } = require('./utils/auth');
const { auditTrail } = require('./services/auditService');
const { errorHandler, notFoundHandler } = require('./utils/errors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(attachCurrentUser);
app.use(auditTrail);

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await initDb();

  const server = app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });

  const gracefulShutdown = async () => {
    server.close(async () => {
      await closeDb();
      process.exit(0);
    });
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;