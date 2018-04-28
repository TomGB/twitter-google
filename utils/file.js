const fs = require('fs');

const read = (name = 'raw_data.txt') =>
  fs.readFileSync(name, 'utf8');

const write = (name = 'data_out.json', data) => {
  fs.writeFile(name, JSON.stringify(data, 0 , 2), (err) => {
      if(err) {
          return console.log(err);
      }

      console.log('The file was saved!');
  });
}

module.exports = {
  read, write
}
