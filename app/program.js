import fs from 'fs';
import path from 'path';
import dirname from '../dirname.js';
import * as files from './utils/files.js';
import * as shell from './utils/shell.js';
import * as ui from './utils/ui.js';

export default async function run() {
  try {
    const servicesFilepath = path.join(dirname,  './app/data/services.json');
    const { services } = JSON.parse(fs.readFileSync(servicesFilepath));
    const { service } = await ui.prompt('service', 'AWS service?', services.map((s) => s.name).sort());
    const queries = services.find((s) => s.name === service).queries;
    const { query } = await ui.prompt('query', 'Service query?', queries.map((q) => q.description).sort());
    const profiles = (await shell.execute('aws configure list-profiles', 'Loading profiles...')).split('\n').sort().filter((p) => p);
    const { profile } = await ui.prompt('profile', 'AWS profile?', profiles);
    const { display } = await ui.prompt('display', 'Query output?', ['Terminal', 'Web']);
    const command = services.find((s) => s.name === service).queries.find((q) => q.description === query).command;
    const output = await shell.execute(`${command} --profile=${profile}`, 'Querying AWS...');
    const results = output && JSON.parse(output);

    // download the latest version of services.json:
    files.download('https://raw.githubusercontent.com/nire0510/awsome-cli/master/app/data/services.json', servicesFilepath);

    if (Array.isArray(results) && results.length > 0) {
      switch (display) {
        case 'Web':
          const filepath = files.exportHtml(path.join(dirname, './app/templates/grid.html'), results, `${profile} > ${service} > ${query}`);

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
    fs.writeFileSync(path.join(dirname, './error.log'), error);
  }
};
