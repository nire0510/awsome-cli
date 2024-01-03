import * as logger from '../utils/logger.js';
import Service from '../models/service.js';
import * as queriesAction from './queries.js';

export async function run(term) {
  try {
    const services = await Service.getAll();
    const regex = new RegExp(term, 'i');
    const results = services.filter((service) =>
      regex.test(service.name) ||
        service.queries.some((q) => regex.test(q.description)));

    if (results.length > 0) {
      queriesAction.run({}, results);
    }
    else {
      console.log('😕 No results found.');
    }
  }
  catch (error) {
    logger.error('An error has occurred.', error);
  }
}
