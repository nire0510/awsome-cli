import fs from 'fs';
import path from 'path';
import appRoot from '../root.js';
import * as files from './utils/files.js';
import * as shell from './utils/shell.js';
import * as ui from './utils/ui.js';

export default async function run(args) {
  try {
    const servicesFilepath = path.join(appRoot,  './app/data/services.json');
    const { services } = JSON.parse(fs.readFileSync(servicesFilepath));
    const { service } = await ui.prompt('list', 'service', 'AWS service?', services.map((s) => s.name).sort());
    const queries = services.find((s) => s.name === service).queries;
    const { query } = await ui.prompt('list', 'query', 'Service query?', queries.map((q) => q.description).sort());
    const variables = queries.find((q) => q.description === query).variables || [];
    const values = await variables.reduce((a, c) => a.then((results) => ui.prompt(c.type, c.name, c.description, undefined).then((r) => ({ ...r, ...results }))), Promise.resolve({}));
    const profiles = (await shell.execute('aws configure list-profiles', 'Loading profiles...')).split('\n').sort().filter((p) => p);
    const { profile } = await ui.prompt('list', 'profile', 'AWS profile?', profiles);
    const { display } = await ui.prompt('list', 'display', 'Query output?', ['Terminal', 'Web']);
    const command = services.find((s) => s.name === service).queries.find((q) => q.description === query).command;
    const output = await shell.execute(`${Object.keys(values).reduce((a, c) => a.replace(`{${c}}`, `${values[c]}`), command)} --profile=${profile}`, 'Querying AWS...');
    const results = output && JSON.parse(output);

    // download the latest version of services.json:
    if (args.some((a) => a.endsWith('awsome'))) {
      files.download('https://raw.githubusercontent.com/nire0510/awsome-cli/master/app/data/services.json', servicesFilepath);
    }

    if (Array.isArray(results) && results.length > 0) {
      switch (display) {
        case 'Web':
          const title = `${service} > ${query} (${profile})`;
          const filepath = files.exportHtml(path.join(appRoot, './app/templates/grid.html'), results, title);

          ui.browse(filepath);
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
    console.error('🐞 An error has occurred');
    fs.writeFileSync(path.join(appRoot, './error.log'), error);
  }
};
