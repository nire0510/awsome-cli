import fs from 'fs';
import path from 'path';
import config from '../config/default.js';

function appendToLog(filepath, type = 'INFO', message) {
  const logStream = fs.createWriteStream(filepath, { flags: 'a' });

  logStream.write(`${new Date()} ${type} ${message}\n`);
  logStream.close();
}

export function info(message, data) {
  const filepath = path.join(config.uris.app.logs, 'info.log');

  console.log(`🟢 ${message}`);
  appendToLog(filepath, 'INFO', `${message} ${typeof data === 'object' ? JSON.stringify(data) : data}`);
}

export function error(message, data) {
  const filepath = path.join(config.uris.app.logs, 'error.log');

  console.log(data);
  appendToLog(filepath, 'ERROR', `${message} ${typeof data === 'object' ? JSON.stringify(data) : data}`);
}

export function log(message) {
  console.error(`🔴 ${message}`);
  info(message);
}

export function warn(message, data) {
  const filepath = path.join(config.uris.app.logs, 'warn.log');

  console.warn(`🟡 ${message}`);
  appendToLog(filepath, 'WARN', `${message} ${typeof data === 'object' ? JSON.stringify(data) : data}`);
}
