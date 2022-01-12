import getv from 'getv';
import config from '../config/default.js';
import Display from '../models/display.js';
import * as files from '../utils/files.js';
import History from '../models/history.js';
import * as logger from '../utils/logger.js';
import Profile from '../models/profile.js';
import Service from '../models/service.js';
import * as shell from '../utils/shell.js';
import * as ui from '../utils/ui.js';

export async function run(options) {
  try {
    if (options.update) {
      spinner.start('Updating queries from repository...');
      await Service.update();
      spinner.stop();
    }

    const services = await Service.getAll() || [];
    const { serviceName } = await ui.prompt('list', 'serviceName', 'AWS service?', services.map((s) => s.name).sort());
    const service = services.find((s) => s.name === serviceName);
    const queries = getv(service, 'queries', []);
    const { queryDescription } = await ui.prompt('list', 'queryDescription', 'Service query?', queries.map((q) => q.description).sort());
    const query = queries.find((q) => q.description === queryDescription);
    const variables = getv(query, 'variables', []);
    const values = await variables.reduce((a, c) => a.then((results) => ui.prompt(c.type, c.name, c.description, undefined).then((r) => ({ ...r, ...results }))), Promise.resolve({}));
    const profiles = await Profile.getAll();
    const { profile } = await ui.prompt('list', 'profile', 'AWS profile?', profiles);
    const title = `${serviceName} > ${queryDescription} (${profile})`;
    const displays = Display.getAll();
    const { display } = await ui.prompt('list', 'display', 'Query output?', displays);
    const command = getv(query, 'command', '');
    const commandWithValues = `${Object.keys(values).reduce((a, c) => a.replace(`{${c}}`, `${values[c]}`), command)} --profile=${profile}`;
    const output = await shell.execute(commandWithValues, 'Querying AWS...');
    const results = output ? JSON.parse(output) : [];

    History.add({
      title,
      command: commandWithValues,
    });

    if (Array.isArray(results) && results.length > 0) {
      switch (display) {
        case 'Web':
          const uri = files.exportHtml(config.uris.app.templates.grid, results, title);

          ui.browse(uri);
          break;
        case 'Terminal':
        default:
          console.log();
          console.table(results);
          break;
      }
    }
    else {
      console.log();
      console.log('😕 No results found.');
    }
  }
  catch (error) {
    logger.error('An error has occurred.', error);
  }
}
