#!/usr/bin/env node
import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import render from './view';
import resources from './locales/index';
import getDataFromRSS from './getDataFromRSS';

const validate = (existingURLs, newURL) => {
  const schema = yup.string().url('URL_invalid').notOneOf(existingURLs, 'existing_RSS');
  return schema.validate(newURL);
};

const getURLForRequest = (newUrl) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.append('disableCache', true);
  url.searchParams.append('url', newUrl);
  return url;
};

const getResponse = (newURL) => {
  const url = getURLForRequest(newURL);
  return axios.get(url);
};

const getNewPosts = (posts, oldPosts) => {
  const oldLinks = oldPosts.map((oldPost) => oldPost.link);
  return posts.filter((newPost) => !oldLinks.includes(newPost.link));
};

const updateFeeds = (state) => {
  const { content } = state;
  const promises = content.feeds.map((feed) => getResponse(feed.url));
  Promise.all(promises)
    .then((updatedFeeds) => {
      updatedFeeds.forEach((updatedFeed) => {
        const { posts } = getDataFromRSS(updatedFeed.data.contents);
        const newPosts = getNewPosts(posts, content.posts);
        content.posts = [...newPosts, ...content.posts];
      });
      setTimeout(updateFeeds, 5000, state);
    });
};

const app = () => {
  const elements = {
    language: navigator.languages,
    form: document.querySelector('.rss-form', '.text-body'),
    button: document.querySelector('.rss-form button'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    colomnFeeds: document.querySelector('.feeds'),
    colomnPosts: document.querySelector('.posts'),
  };

  const state = {
    language: 'ru',
    validate: {
      state: 'valid',
      error: null,
    },
    content: {
      feeds: [],
      posts: [],
    },
  };
  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.language,
    debug: false,
    resources,
  })
    .then(() => {
      const wacherState = onChange(state, render(elements, state, i18n));
      updateFeeds(wacherState);
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        wacherState.validate.error = null;
        wacherState.validate.state = 'updated';
        const { value: newURL } = elements.input;
        const existingURLs = state.content.feeds.map((feed) => feed.url);
        validate(existingURLs, newURL)
          .then(() => getResponse(newURL))
          .then((response) => {
            const { feed, posts } = getDataFromRSS(response.data.contents, newURL);
            wacherState.validate.state = 'valid';
            wacherState.content.feeds.push(feed);
            wacherState.content.posts.push(...posts);
            console.log(state);
          })
          .catch((err) => {
            switch (err.name) {
              case 'AxiosError':
                wacherState.validate.error = 'ERR_NETWORK';
                break;

              case 'ValidationError':
                wacherState.validate.error = err.message;
                break;

              case 'ParserError':
                wacherState.validate.error = err.message;
                break;
              default:
                console.error('Неизвестный тип ошибки: ', err);
                break;
            }
            wacherState.validate.state = 'invalid';
          });
      });
    });
};

app();
