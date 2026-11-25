import { element, icon } from './elements.js';

const options = ['По популярности', 'По цене', 'По названию'];

export function field(model) {
  const select = model.kind === 'Список';
  const search = model.kind.startsWith('Поиск');
  const wrapper = element('label', 'field-control field-control--' + model.size);
  wrapper.style.setProperty('--field-bg', model.background);
  wrapper.style.setProperty('--field-color', model.color);
  wrapper.style.setProperty('--field-line', model.outline ? '#ddd' : 'transparent');
  const control = element(select ? 'select' : 'input', 'field-control__input');
  control.setAttribute('aria-label', model.kind + ' · ' + model.label);
  control.disabled = model.disabled;
  if (select) {
    for (const label of [model.label, ...options]) control.add(new Option(label, label));
  } else {
    control.type = search ? 'search' : 'text';
    control.placeholder = model.label;
  }
  if (search && model.kind.endsWith('1')) wrapper.append(icon('search'));
  wrapper.append(control);
  if (select || (search && model.kind.endsWith('2'))) wrapper.append(icon(select ? 'down' : 'search'));
  return wrapper;
}

export function sampleButton(model) {
  const b = element('button', 'sample-button', model.label);
  b.type = 'button';
  b.disabled = model.group === 'Отключена';
  Object.assign(b.style, {
    width: model.width + 'px', height: model.height + 'px', color: model.color,
    background: model.background, borderColor: model.border, fontSize: model.size + 'px',
  });
  return b;
}
