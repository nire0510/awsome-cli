import * as shell from '../utils/shell.js';

export default class Profile {
  static async getAll() {
    const profiles = await shell.execute('aws configure list-profiles', 'Loading profiles...');

    if (profiles) {
      return profiles.split('\n').sort().filter((p) => p);
    }

    return [];
  }
}
