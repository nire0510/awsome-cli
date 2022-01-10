import inquirer from 'inquirer';
import * as shell from './shell.js';

export function browse(filepath) {
  shell.execute(`open ${filepath}`);
}

export function prompt(type, name, message, choices, fallback) {
  return inquirer.prompt([{ type, name, message, choices, default: fallback }]);
}
