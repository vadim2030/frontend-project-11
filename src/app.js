import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './view';
import resources from './locales/index';
import getDataFromRSS from './getDataFromRSS';
import locale from './locales/locale';

const updateTime = 5000;

const validate = (existingURLs, newURL) => {
  yup.setLocale(locale);
  const schema = yup.string().url().notOneOf(existingURLs);
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
  const promises = state.content.feeds.map((feed) => getResponse(feed.url)
    .then((response) => {
      const data = getDataFromRSS(response.data.contents);
      const newPosts = getNewPosts(data.posts, state.content.posts)
        .map((post) => ({
          ...post,
          feedID: feed.id,
          postID: uniqueId(),
        }));

      if (newPosts.length > 0) state.content.posts.unshift(...newPosts);
    }));
  Promise.allSettled(promises)
    .then(() => setTimeout(updateFeeds, updateTime, state));
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
    modal: document.querySelector('#modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalDescription: document.querySelector('.text-break'),
    modalBtnRead: document.querySelector('.modal-footer > a'),
    modalBtnClose: document.querySelector('.modal-footer > button'),
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
    readPosts: new Set(),
    modal: {
      post: null,
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
      setTimeout(updateFeeds, updateTime, wacherState);
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        wacherState.validate.error = null;
        wacherState.validate.state = 'updated';
        const formData = new FormData(e.target);
        const newURL = formData.get('url');
        const existingURLs = state.content.feeds.map((feed) => feed.url);
        validate(existingURLs, newURL)
          .then(() => getResponse(newURL))
          .then((response) => {
            const { feed, posts } = getDataFromRSS(response.data.contents, newURL);
            wacherState.validate.state = 'valid';
            const feedID = uniqueId();
            wacherState.content.feeds.push({
              ...feed,
              id: feedID,
              url: newURL,
            });
            wacherState.content.posts.push(...posts.map((post) => ({
              feedID,
              ...post,
              postID: uniqueId(),
            })));
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
                wacherState.validate.error = { key: err.message };
                break;
              default:
                console.error('Неизвестный тип ошибки: ', err);
                break;
            }
            wacherState.validate.state = 'invalid';
          });
      });
      elements.modal.addEventListener('hide.bs.modal', () => {
        wacherState.modal.post = null;
      });
      elements.colomnPosts.addEventListener('click', ({ target }) => {
        const postID = target.getAttribute('data-id');
        if (postID) {
          wacherState.readPosts.add(postID);
          const [currentPost] = state.content.posts.filter((post) => post.postID === postID);
          wacherState.modal.post = currentPost;
        }
      });
    });
};

export default app;
