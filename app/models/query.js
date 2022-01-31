import Service from './service.js';

export default class Query {
  static async getAll() {
    const services = await Service.getAll();

    return services.reduce((a, c) => a.concat(c.queries), []);
  }

  static async getByService(serviceName) {
    const service = await Service.getByName(serviceName);

    return (service || {}).queries;
  }

  static async getByDescription(serviceName, queryDescription) {
    const queries = await Query.getByService(serviceName);

    return queries.find((q) => q.description === queryDescription);
  }
}
