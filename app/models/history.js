import Storage from '../utils/storage.js';

export default class History {
  static storage;
  static maxItems = 10;

  static async init() {
    this.storage = new Storage();
    await this.storage.init({});
  }

  static async clear() {
    await this.storage.clear();
  }

  static getAll() {
    return new Promise(async (resolve, reject) => {
      if (!this.storage) {
        await this.init();
      }

      resolve(this.storage.get('history'));
    });
  }

  static async add(record) {
    const history = await this.getAll() || [];
    const similarCommandIndex = history.findIndex((c) => c.command === record.command);

    if (similarCommandIndex !== -1) {
      history.splice(similarCommandIndex, 1);
    }
    history.push(record);
    await this.storage.set('history', history.slice(0, 10));
  }
}
