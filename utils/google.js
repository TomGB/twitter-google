const google = require('google')
google.resultsPerPage = 3;

const runGoogle = (query) => new Promise((resolve) => {
  if (!query) resolve([])
  if (process.env.use_google === 'true') {
    try {
      return google(query, (err = 'res broke', res) => {
        if (err || !res) {
          resolve([])
        } else {
          resolve(res.links.map(link => {
            delete link.link;
            return link;
          }));
        }
      })
    } catch (e) {
      console.error(e);
    }
  } else {
    console.log(query);
    resolve([{ description: 'test' }])
  }
});

module.exports = runGoogle
