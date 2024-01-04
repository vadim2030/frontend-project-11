#!/usr/bin/env node
import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import resources from './locales/index.js'

const app = () => {
  const elements = {
    language: navigator.languages,
    form: document.querySelector('.rss-form', '.text-body'),
    button: document.querySelector('.rss-form button'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
  };
  const state = {
    language: 'ru',
    validate: {
      state: 'valid',
      error: null,
    },
    feeds: [],
  };
  const validate = (url) => {
    const schema = yup.string().url('URL_invalid').notOneOf(state.feeds, 'existing_RSS');
    return schema.validate(url);
  };
  const i18n = i18next.createInstance();
  i18n.init({
    lng: state.language,
    debug: false,
    resources,
  })
    .then(() => {
      const wacherState = onChange(state, render(elements, state, i18n));
      console.log(i18n.t('heloo'))
      // wacherState.validate.state = 'invalid';
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        wacherState.validate.error = null;
        wacherState.validate.state = 'updated';
        const { value: valueFromInput } = elements.input;
        validate(valueFromInput)
          .then((newUrl) => {
            wacherState.validate.state = 'valid';
            wacherState.feeds.push(newUrl);
          })
          .catch((err) => {
            wacherState.validate.error = err.message;
            wacherState.validate.state = 'invalid';
          });
      });
    });

};

app();
