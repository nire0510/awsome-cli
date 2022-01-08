import { exec } from 'child_process';
import ora from 'ora';

export function execute(command, message) {
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
  });
}
