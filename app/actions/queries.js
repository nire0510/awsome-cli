import getv from 'getv';
import ora from 'ora';
import config from '../config/default.js';
import Display from '../models/display.js';
import * as files from '../utils/files.js';
import History from '../models/history.js';
import * as logger from '../utils/logger.js';
import Profile from '../models/profile.js';
import Query from '../models/query.js';
import Service from '../models/service.js';
import Variable from '../models/variable.js';
import * as shell from '../utils/shell.js';
import * as ui from '../utils/ui.js';

export async function run(options, predefinedServices) {
  try {
    if (options.update) {
      const spinner = ora();

      spinner.start('Updating queries from repository...');
      await Service.update();
      spinner.stop();
    }

    const profiles = await Profile.getAll();
    const { profile } = await ui.prompt('list', 'profile', 'AWS profile?', profiles);
    const services = Array.isArray(predefinedServices) && predefinedServices.length ?
      predefinedServices :
      await Service.getAll();
    const { serviceName } = await ui.prompt('rawlist', 'serviceName', 'AWS service?', services.map((s) => s.name).sort());
    const queries = await Query.getByService(serviceName);
    const { queryDescription } = await ui.prompt('rawlist', 'queryDescription', 'Service query?', queries.map((q) => q.description).sort());
    const query = await Query.getByDescription(serviceName, queryDescription);
    const variables = await Variable.getByQuery(serviceName, queryDescription);
    const values = await variables.reduce((a, c) => a.then(async (variableValues) => {
      let items = c.items;
      const [ServiceName, QueryDescription, Key] = c.command.split(';');

      if (['list', 'rawlist'].includes(c.type) && c.command) {
        const command = c.command.startsWith('aws ') ?
          c.command :
          (await Query.getByDescription(ServiceName, QueryDescription)).command;
        const commandWithValues = `${Object.keys(variableValues).reduce((a1, c1) => a1.replace(`{${c1}}`, `${variableValues[c1]}`), command)} --output json --profile ${profile}`;
        const response = await shell.execute(commandWithValues, 'Querying AWS...');

        items = JSON.parse(response);
      }

      return ui
        .prompt(c.type, c.name, c.description, items.reduce((a1, c1) => a1.concat(c1[Key]), []))
        .then((r) => ({ ...r, ...variableValues }))
    }), Promise.resolve({}));
    const title = `${serviceName} > ${queryDescription} (${profile})`;
    const displays = Display.getAll();
    const { display } = await ui.prompt('list', 'display', 'Query output?', displays);
    const command = getv(query, 'command', '');
    const commandWithValues = `${Object.keys(values).reduce((a, c) => a.replace(`{${c}}`, `${values[c]}`), command)} --output json --profile ${profile}`;
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
