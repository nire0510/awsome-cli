import os from 'os';
import storage from 'node-persist';

export default class Storage {
  stoarge;
  constructor() {
    this.storage = storage.create({
      dir: `${os.tmpdir()}/awsome/`,
    });
  }

  async init(options) {
    await this.storage.init(options);
  }

  async get(key) {
    return this.storage.getItem(key);
  }

  async set(key, value) {
    await this.storage.setItem(key, value);
  }

  async remove(key) {
    await this.storage.removeItem(key);
  }

  async clear() {
    await this.storage.clear();
  }
}
