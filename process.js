const { read, write } = require('./utils/file');
const google = require('./utils/google')

const data = read('raw_data.txt');

const rawTweets = data.split('@agilereading');
rawTweets.shift(); // remove first element as not a tweet

const tweets = rawTweets

const splitByAuthor = (date, data) => {
  const byAdded = ' added by '
  const byFrom = ' from '

  if (data.includes(byAdded)) {
    const dataSplit = data.split(byAdded)
    if (dataSplit.length == 2){
      return dataSplit;
    }
  }

  if (data.includes(byFrom)) {
    const dataSplit = data.split(byFrom)
    if (dataSplit.length == 2){
      return dataSplit;
    }
  }

  return [data];
}

const processMeta = (meta, [date, data]) => {
  const labeledMeta = meta.split(' ').filter(
    line => !line.includes('http')
  ).map(
    line => ({
      type: line.includes('#') ? 'tag' : 'from',
      text: line
    })
  ).filter(line => line !== '');

  const tags = labeledMeta.reduce((acc, { type, text }) => (
    type === 'tag' ? acc.concat(' '+text) : acc
  ), '').trim();

  const from = labeledMeta.reduce((acc, { type, text }) => (
    type === 'from' && !text.includes('…') ? acc.concat(' '+text) : acc
  ), '').trim();

  return {
    from,
    date,
    tags
  }
}

const processContent = async ([date, data]) => {
  const [content, meta] = splitByAuthor(date, data)

  if (meta) {
    const metaData = processMeta(meta, [date, data]);

    const searchQuery = content.split(' ').filter(line =>
      !line.includes('http') && line !== ''
    ).join(' ').trim();

    if (!searchQuery || searchQuery === ' ') {
        throw Error('\nno content to search: \n'+date+' \n'+data);
    }

    metaData.text = searchQuery
    metaData.searchResults = await google(searchQuery)

    return metaData;
  } else {
    return {}
  }
}

const runPromises = (promises) =>
  new Promise((resolve) =>
    Promise.all(promises).then(
      result => {
        resolve(result);
      }
    ).catch((error) => {
      console.error(error);
      resolve([])
    })
  );

const processTweets = async (tweets) => {
  const promises = tweets.map(async tweet => {
    const tweetLines = tweet.split('\n').filter(
     line => !['', 'More', 'agile reading list'].includes(line.replace(/[^\x00-\x7F]/g, ''))
    ).filter(
     line => !(line.includes('like') && line.includes('repl') && line.includes('retweet'))
    ).filter(
     line => !(line.includes('Like') && line.includes('Reply') && line.includes('Retweet'))
    ).filter(
     line => !line.includes('Translate from ')
    ); //remove useless lines

    try {
     const returnData = await processContent(tweetLines)

     returnData.date = tweetLines[0].trim()

     return returnData
    } catch (e) {
     console.log(e);
       return false;
    }
  });

  const output = await runPromises(promises);

  write('data_out.json', output);
}

processTweets(tweets);
