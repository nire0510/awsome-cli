import fs from 'fs';
import https from 'https';
import os from 'os';
import path from 'path';

export function download(url, destination) {
  return new Promise((resolve) => {
    const extension = destination.split('.').pop();
    const filepath = generateTempFile(extension);
    const file = fs.createWriteStream(filepath);

    file
      .on('finish', () => {
        file.close(() => {
          fs.renameSync(filepath, destination);

          return resolve(destination);
        });
      })
      .on('error', (error) => {
        resolve(error);
      });

    https
      .get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
        }
      })
      .on('error', (error) => {
        resolve(error);
      });
  });
}

export function exportHtml(source, results, title) {
  if (Array.isArray(results) && results.length > 0) {
    const columns = Object.keys(results[0]).map((key) => ({ field: key, resizable: true, sortable: true, text: key }));
    const destination = generateTempFile('html');
    const searches = Object.keys(results[0]).map((key) => ({ field: key, label: key, type: 'text' }));
    const template = fs.readFileSync(source).toString();
    const html = template
      .replace(/{TITLE}/g, title)
      .replace('{COLUMNS}', JSON.stringify(columns))
      .replace('{RECORDS}', JSON.stringify(results.map((r, index) => ({
        recid: index,
        ...r,
      }))))
      .replace('{SEARCHES}', JSON.stringify(searches));

    fs.writeFileSync(destination, html);

    return destination;
  }

  return null;
}

export function generateTempFile(extension = 'txt') {
  return path.resolve(os.tmpdir(), `${(Math.random() + 1).toString(36).substring(7)}.${extension}`)
}
