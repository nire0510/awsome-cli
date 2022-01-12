import fs from 'fs';
import config from '../config/default.js';
import * as files from '../utils/files.js';

export default class Service {
  static async getAll() {
    return new Promise((resolve, reject) => {
      fs.readFile(config.uris.app.services, (err, data) => {
        if (err) {
          return reject(err);
        }

        resolve(JSON.parse(data).services);
      });
    });
  }

  static async findByName(name) {
    const services = await Service.getAll();

    return services.find((s) => s.name === name);
  }

  static async update() {
    return files
      .download(config.uris.github.services, config.uris.app.services);
  }
}
