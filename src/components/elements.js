const iconNames = {
  star: '24-10', heart: '24-26', compare: '24-39', right: '24-7769',
  menu: '29-860', down: '29-905', search: '29-938', location: '30-947',
  sun: '30-959', moon: '30-962', user: '30-987', bag: '30-1001',
  left: '46-1998', fire: '69-2348', phone: '87-24914', play: '141-45978',
  close: '250-118410', plus: '250-118881', filter: '267-155651',
};

export function element(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children.flat().filter(child => child != null));
  return node;
}

export function icon(name, label = '') {
  const image = element('img', 'icon');
  image.alt = label;
  image.src = '/media/icons/' + (iconNames[name] || name.replace(':', '-')) + '.svg';
  return image;
}

export function photo(key, description = '') {
  const image = element('img', 'photo');
  image.src = '/media/photos/' + key + '.webp';
  image.alt = description;
  image.loading = 'lazy';
  return image;
}

export function button(label, className = 'button', action) {
  const node = element('button', className, label);
  node.type = 'button';
  if (action) node.addEventListener('click', action);
  return node;
}

export function iconButton(name, label, action) {
  const node = button(icon(name), 'icon-button', action);
  node.setAttribute('aria-label', label);
  return node;
}

export function toggle(label, className, selected = false) {
  const node = button(label, className);
  node.setAttribute('aria-pressed', String(selected));
  node.addEventListener('click', () => {
    node.setAttribute('aria-pressed', String(node.getAttribute('aria-pressed') !== 'true'));
  });
  return node;
}

export function choices(labels, className = 'choices', selected = 0) {
  const group = element('div', className);
  labels.forEach((label, index) => {
    const option = button(label, 'choice', () => {
      [...group.children].forEach(other => other.setAttribute('aria-pressed', String(other === option)));
      group.dispatchEvent(new CustomEvent('choice', { detail: index }));
    });
    option.setAttribute('aria-pressed', String(index === selected));
    group.append(option);
  });
  return group;
}

export function notice(title, content) {
  const close = button('Закрыть', 'button');
  const dialog = element('dialog', 'dialog', element('h2', 'dialog__title', title), content, close);
  dialog.setAttribute('aria-label', title);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}

export function demoAction(label, message = 'Адрес для перехода пока не задан.') {
  return button(label, 'button', () => notice(label, element('p', '', message)));
}

export function badge(label) {
  const labels = ['хит', 'советуем', 'новинка', 'акция'];
  const palette = ['hit', 'pick', 'new', 'sale'];
  return element('span', 'badge badge--' + palette[labels.indexOf(label.toLowerCase())], label);
}
