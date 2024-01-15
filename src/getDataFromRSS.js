import ParserError from './ParseError';

const getFeed = (rssDOM) => ({
  title: rssDOM.querySelector('title').textContent,
  description: rssDOM.querySelector('description').textContent,
});

const getPosts = (rssDOM) => {
  const items = rssDOM.querySelectorAll('item');
  return Array.from(items).map((item) => ({
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
  }));
};

const getDataFromRSS = (rss) => {
  const parser = new DOMParser();
  const rssDOM = parser.parseFromString(rss, 'application/xhtml+xml');
  if (rssDOM.querySelector('parsererror')) throw new ParserError();

  return {
    feed: getFeed(rssDOM),
    posts: getPosts(rssDOM),
  };
};

export default getDataFromRSS;
