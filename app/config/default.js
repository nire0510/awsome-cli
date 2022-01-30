import path from 'path';
import appRoot from '../../root.js';

export default {
  uris: {
    app: {
      logs: path.join(appRoot, '/logs'),
      services: path.join(appRoot,  './app/data/services.json'),
      templates: {
        grid: path.join(appRoot, './app/templates/grid.html'),
      },
    },
    github: {
      respository: 'https://github.com/nire0510/awsome-cli',
      services: 'https://github.com/nire0510/awsome-cli/blob/master/app/data/services.json',
      servicesJson: 'https://raw.githubusercontent.com/nire0510/awsome-cli/master/app/data/services.json',
    }
  },
};
