const renderFeedback = (elements, state, status, i18n) => {
  // console.log(status);
  const { feedback, input, button } = elements;
  const { validate: { error } } = state;
  switch (status) {
    case 'valid':
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18n.t('RSS_uploaded');
      input.value = '';
      button.disabled = false;
      break;

    case 'invalid':
      feedback.textContent = i18n.t(error);
      button.disabled = false;
      break;

    case 'updated':
      feedback.textContent = '';
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
      button.disabled = true;
      break;
    default:
      throw new Error(`Неизвестный статус : ${status}`);
  }
};

const renderFeeds = (elements, feeds, i18n) => {
  const { colomnFeeds } = elements;
  colomnFeeds.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('title_feeds');
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  feeds.forEach((feed) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'border-0', 'border-end-0');
    const titleFeed = document.createElement('h3');
    titleFeed.classList.add('h6', 'm-0');
    titleFeed.textContent = feed.title;
    const description = document.createElement('p');
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = feed.description;
    item.append(titleFeed, description);
    list.append(item);
  });
  cardBody.append(cardTitle, list);
  card.append(cardBody);
  colomnFeeds.append(card);
};

const renderPosts = (elements, posts, i18n) => {
  const { colomnPosts } = elements;
  colomnPosts.innerHTML = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t('title_posts');
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  posts.forEach((post) => {
    const item = document.createElement('li');
    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const titlePosts = document.createElement('a');
    titlePosts.classList.add('fw-bold');
    titlePosts.textContent = post.title;
    titlePosts.href = post.link;
    const button = document.createElement('button');
    button.textContent = i18n.t('button_in_post');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.postID);

    item.append(titlePosts, button);
    list.append(item);
  });

  cardBody.append(cardTitle);
  card.append(cardBody, list);
  colomnPosts.append(card);
};

const render = (elements, state, i18n) => (path, value) => {
  if (path === 'validate.state') {
    renderFeedback(elements, state, value, i18n);
  }
  if (path === 'content.feeds') {
    renderFeeds(elements, state.content.feeds, i18n);
  }
  if (path === 'content.posts') {
    renderPosts(elements, state.content.posts, i18n);
  }
};

export default render;
