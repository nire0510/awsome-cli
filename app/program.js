import fs from 'fs';
import path from 'path';
import { program } from 'commander';
import appRoot from '../root.js';
import config from './config/default.js';
import * as history from './actions/history.js';
import * as queries from './actions/queries.js';
import * as search from './actions/search.js';
import * as ui from './utils/ui.js';

export default async function run(args) {
  const pkg = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json')));

  program
    .name('awsome')
    .version(pkg.version, '-v, --version')
    .option('-u, --update', 'Download the latest services & queries')
    .option('-c, --command', 'Show the command')
    .description(pkg.description)
    .action(queries.run);

  program
    .command('add')
    .description('Suggest additional AWS queries')
    .action(() => {
      ui.browse(config.uris.github.services);
    });

  program
    .command('history')
    .option('-l, --latest', 'Rerun latest query')
    .description('View and execute recently run queries')
    .action(history.run);

  program
    .command('search <term>')
    .description('Search a query')
    .action(search.run);

  // parse args:
  program.parse(args);
};
