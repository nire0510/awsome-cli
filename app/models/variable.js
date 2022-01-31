import Query from './query.js';

export default class Variable {
  static async getByQuery(serviceName, queryDescription) {
    const query = await Query.getByDescription(serviceName, queryDescription);

    return (query || {}).variables || [];
  }
}
