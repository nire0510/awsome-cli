import chalk from 'chalk';
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
    const lastUpdated = await Service.lastUpdated;

    if (options.update || Date.now() - lastUpdated > config.settings.updateInterval) {
      const spinner = ora();

      spinner.start('Updating queries from repository...');
      await Service.update();
      spinner.stop();
    }

    const profiles = await Profile.getAll();
    const { profile } = profiles.length === 1 ?
      { profile: profiles[0] } :
      await ui.prompt('list', 'profile', 'AWS profile?', profiles);
    const services = await Service.getAll();
    const { serviceName } = await ui.prompt('list', 'serviceName', 'AWS service?', services.map((s) => s.name).sort());
    const queries = await Query.getByService(serviceName);
    const { queryDescription } = await ui.prompt('list', 'queryDescription', 'Service query?', queries.map((q) => q.description).sort());
    const query = await Query.getByDescription(serviceName, queryDescription);
    const variables = await Variable.getByQuery(serviceName, queryDescription);
    const values = await variables.reduce((a, variable) => a.then(async (variableValues) => {
      let items = variable.items;

      if (['list', 'rawlist'].includes(variable.type) && variable.command) {
        const [serviceNameRef, queryDescriptionRef, keyRef] = variable.command.split(';');
        const command = variable.command.startsWith('aws ') ?
          variable.command :
          (await Query.getByDescription(serviceNameRef, queryDescriptionRef)).command;
        const commandWithValues = `${Object.keys(variableValues).reduce((a1, c1) => a1.replace(`{${c1}}`, `${variableValues[c1]}`), command)} --output json --profile ${profile}`;

        try {
          const response = await shell.execute(commandWithValues, 'Querying AWS...');

          items = JSON.parse(response)
            .reduce((a1, c1) => a1.concat(c1[keyRef]), []);
        }
        catch (error) {
          logger.error(`An error has occurred while trying to execute the following command:\n${chalk.red(commandWithValues)}\n(Have all placeholdres been replaced?)`);
          process.exit(1);
        }
      }

      return ui
        .prompt(variable.type, variable.name, variable.description, items)
        .then((r) => ({ ...r, ...variableValues }));
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

    if (options.command) {
      console.log(`\n${commandWithValues}`);
    }

    if (Array.isArray(results) && results.length > 0) {
      switch (display) {
        case 'Web':
          ui.browse(files.exportHtml(config.uris.app.templates.grid, results, title));
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
