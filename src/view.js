const renderFeedback = (elements, state, status, i18n) => {
  console.log(status);
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

const render = (elements, state, i18n) => (path, value) => {
  if (path === 'validate.state') {
    renderFeedback(elements, state, value, i18n);
  }
};

export default render;
