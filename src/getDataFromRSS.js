import { uniqueId } from 'lodash';
import ParserError from './ParseError';

const getFeed = (rssDOM, feedID, rssURL) => ({
  title: rssDOM.querySelector('title').textContent,
  description: rssDOM.querySelector('description').textContent,
  id: feedID,
  url: rssURL,
});

const getPosts = (rssDOM, feedID) => {
  const items = rssDOM.querySelectorAll('item');
  return Array.from(items).map((item) => ({
    feedID,
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
    postID: uniqueId(),
  }));
};

const getDataFromRSS = (rss, rssURL) => {
  const parser = new DOMParser();
  const rssDOM = parser.parseFromString(rss, 'application/xhtml+xml');
  if (rssDOM.querySelector('parsererror')) throw new ParserError();
  const feedID = uniqueId();

  return {
    feed: getFeed(rssDOM, feedID, rssURL),
    posts: getPosts(rssDOM, feedID),
  };
};

export default getDataFromRSS;
