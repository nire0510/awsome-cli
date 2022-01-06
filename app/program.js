import { exec } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const appDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function prompt(name, message, choices) {
  return inquirer.prompt([{ type: 'list', name, message, choices }]);
}

function execute(command, message) {
  const spinner = ora();

  return new Promise((resolve, reject) => {
    spinner.start(message);
    exec(command, (err, stdout, stderr) => {
      spinner.stop();

      if (err) {
        return reject(stderr);
      }
      resolve(stdout);
    });
  })
}

function browse(results, title) {
  if (Array.isArray(results) && results.length > 0) {
    const columns = Object.keys(results[0]).map((key) => ({ field: key, text: key, sortable: true }));
    const filepath = path.resolve(os.tmpdir(), `${(Math.random() + 1).toString(36).substring(7)}.html`);
    const template = fs.readFileSync(path.join(appDir, './templates/grid.html')).toString();
    const html = template
      .replace(/{TITLE}/g, title)
      .replace('{COLUMNS}', JSON.stringify(columns))
      .replace('{RECORDS}', JSON.stringify(results));

    fs.writeFileSync(filepath, html);
    execute(`open ${filepath}`);
  }
}

export default async function run() {
  try {
    const { services } = JSON.parse(fs.readFileSync(path.join(appDir,  './data/services.json')));
    const { service } = await prompt('service', 'AWS service?', services.map((s) => s.name).sort());
    const queries = services.find((s) => s.name === service).queries;
    const { query } = await prompt('query', 'Service query?', queries.map((q) => q.description).sort());
    const profiles = (await execute('aws configure list-profiles', 'Loading profiles...')).split('\n').sort().filter((p) => p);
    const { profile } = await prompt('profile', 'AWS profile?', profiles);
    const { display } = await prompt('display', 'Query output?', ['Terminal', 'Web']);
    const command = services.find((s) => s.name === service).queries.find((q) => q.description === query).command;
    const output = await execute(`${command} --profile=${profile}`, 'Querying AWS...');
    const results = output && JSON.parse(output);

    if (Array.isArray(results) && results.length > 0) {
      switch (display) {
        case 'Web':
          browse(results, `${profile} > ${service} > ${query}`);
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
    fs.writeFileSync(path.join(appDir, './error.log'), error);
  }
};
