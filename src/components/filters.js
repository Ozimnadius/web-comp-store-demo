import { button, choices, element, icon, iconButton, toggle } from './elements.js';

const colors = [
  ['Красный', '#d7252c'], ['Синий', '#3576eb'], ['Жёлтый', '#ffdd2d'],
  ['Зелёный', '#0d8f1f'], ['Чёрный', '#191919'], ['Фиолетовый', '#8a42f9'],
  ['Серый', '#5b5b5b'], ['Пурпурный', '#a115a1'], ['Светло-серый', '#f3f3f3'],
  ['Оранжевый', '#fd9c24'], ['Песочный', '#ffee88'], ['Сиреневый', '#984995'],
  ['Тёмно-синий', '#023c81'], ['Мятный', '#84eeb1'], ['Индиго', '#3e3ab0'],
];
const sorting = ['Сначала алфавита', 'С конца алфавита', 'Сначала непопулярные', 'Сначала популярные',
  'Сначала дешевые', 'Сначала дорогие', 'Сначала недоступные', 'Сначала доступные'];

export function priceRange() {
  const values = element('div', 'price-range__values');
  const sliders = element('div', 'price-range__sliders');
  const range = element('div', 'price-range', element('span', 'price-range__label', 'Цена'), values, sliders);
  range.setAttribute('role','group');
  range.setAttribute('aria-label','Диапазон цен');
  const controls = [600, 165096].map((value, i) => {
    const input = element('input', 'price-range__number');
    const slider = element('input', 'price-range__slider');
    for (const [field, type] of [[input, 'number'], [slider, 'range']]) {
      field.type = type;
      field.min = 600;
      field.max = 165096;
      field.value = value;
      field.setAttribute('aria-label', i ? 'Цена до' : 'Цена от');
    }
    values.append(input);
    sliders.append(slider);
    return { input, slider };
  });
  controls.forEach(({ input, slider }, index) => {
    function setValue(raw) {
      const lower = index ? Number(controls[0].slider.value) : 600;
      const upper = index ? 165096 : Number(controls[1].slider.value);
      const value = Math.max(lower, Math.min(upper, Number(raw)));
      input.value = slider.value = value;
    }
    slider.addEventListener('input', () => setValue(slider.value));
    input.addEventListener('change', () => setValue(input.value));
  });
  return range;
}

function check(label) {
  const input = element('input', 'check__input');
  input.type = 'checkbox';
  const parts=label.split(' (');
  return element('label', 'check', input, parts[0],parts[1]?element('span','check__count','('+parts[1]):null);
}

export function filterOptions(mode) {
  if (mode === 'range') return priceRange();
  if (mode === 'list') return choices(sorting, 'options options--list', 3);
  if (mode === 'checks') return element('div', 'options', ...['Молния (1)', 'Свеча (1)', 'Костёр (1)'].map(check));
  if (mode === 'sizes') return choices(['XS','S','M','L','XL','XXL','XXXL','38','40','42'], 'options options--sizes', -1);
  return element('div', 'options options--colors', ...colors.map(([name, color]) => {
    const swatch = toggle('', 'swatch');
    swatch.style.setProperty('--swatch', color);
    swatch.setAttribute('aria-label', name);
    return swatch;
  }));
}

export function filterMenu(label, mode, open = false) {
  const menu = element('details', 'filter-menu',
    element('summary', 'filter-menu__summary', label, icon('down')), filterOptions(mode));
  menu.open = open;
  return menu;
}

export function filterPanel() {
  const body=element('div','filter-panel__body', ...[['Сначала популярные','list'],['Цена','range'],['Наши предложения','checks'],
      ['Бренд','checks'],['В наличии (32)','checks'],['Тип','list'],['Цвет','colors'],
      ['Тип','sizes'],['Материал','checks'],['Общая мощность, Вт','range'],['Объем, мл','range'],['Цвет','colors']]
      .map(([label, mode]) => filterMenu(label, mode)));
  const open=button([icon('filter'),'Фильтр'],'filter-panel__open',()=>setOpen(true));
  const close=iconButton('close','Закрыть фильтр',()=>{setOpen(false);open.focus();});
  function setOpen(value) {
    body.hidden=!value;
    close.hidden=!value;
    open.setAttribute('aria-expanded',String(value));
  }
  setOpen(true);
  return element('aside','filter-panel',element('header','filter-panel__header',open,close),body);
}

export function filterRow(index) {
  if (index === 1) return check('Сначала популярные (1)');
  const item = toggle('Сначала популярные', 'filter-row', index === 2);
  return item;
}
