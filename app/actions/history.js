import History from '../models/history.js';
import * as logger from '../utils/logger.js';
import * as shell from '../utils/shell.js';
import * as ui from '../utils/ui.js';

export async function run() {
  try {
    const history = await History.getAll();

    if (Array.isArray(history) && history.length > 0) {
      const { commandTitle } = await ui.prompt('list', 'commandTitle', 'Command?', history.map((s) => s.title).reverse());
      const command = history.find((c) => c.title === commandTitle);
      const output = await shell.execute(command.command, 'Querying AWS...');
      const results = output ? JSON.parse(output) : [];

      console.table(results);
    }
    else {
      console.log('😕 Your history is empty.');
    }
  }
  catch (error) {
    logger.error('An error has occurred.', error);
  }
}
