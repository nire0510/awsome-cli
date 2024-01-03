import path from 'path';
import appRoot from '../../root.js';

export default {
  settings: {
    updateInterval: 1000 * 60 * 60 * 24 * 1, // 1 day
  },
  uris: {
    app: {
      logs: path.join(appRoot, '/logs'),
      services: path.join(appRoot,  './app/data/services.v2.json'),
      templates: {
        grid: path.join(appRoot, './app/templates/grid.html'),
      },
    },
    github: {
      respository: 'https://github.com/nire0510/awsome-cli',
      services: 'https://github.com/nire0510/awsome-cli/blob/master/app/data/services.v2.json',
      servicesJson: 'https://raw.githubusercontent.com/nire0510/awsome-cli/master/app/data/services.v2.json',
    }
  },
};
