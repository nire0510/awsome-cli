import inquirer from 'inquirer';
import * as shell from './shell.js';

export function browse(filepath) {
  shell.execute(`open ${filepath}`);
}

export function prompt(name, message, choices) {
  return inquirer.prompt([{ type: 'list', name, message, choices }]);
}
