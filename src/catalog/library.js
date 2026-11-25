import families from './families.json';
import components from './components.json';
import sections from './sections.json';
import { foundations } from './foundations.js';
import { baseComponent } from '../components/base.js';
import { card } from '../components/cards.js';
import { filterMenu, filterOptions, filterPanel, filterRow } from '../components/filters.js';
import { section } from '../components/sections.js';

const cardKinds = new Set(['product','review','price','category-feature','vision','category','collection','editorial',
  'video','sale','service','benefit','vacancy','certificate','top-banner']);

export function createComponent(kind, variant, index = 0, props) {
  const data = props || components[variant.id] || sections[variant.id];
  if (sections[variant.id]) return section(kind,data,index);
  if (cardKinds.has(kind)) return card(kind,data,index);
  if (kind === 'filter-options') return filterOptions(['list','range','checks','colors','sizes'][index]);
  if (kind === 'filter-panel') return filterPanel();
  if (kind === 'filter-row') return filterRow(index);
  if (kind === 'filter-menu') return filterMenu('Сначала популярные',['list','range','checks','colors'][index],index>0);
  return baseComponent(kind,data,index,variant.id);
}

const translations = {
  Default:'Основной', Secondary:'Второстепенная', Button:'Со значком', Gray:'Серая', Hover:'При наведении',
  Checked:'Выбрано', Unordered:'Маркированный', Ordered:'Нумерованный', Description:'С описанием', Unstyled:'Без маркера',
  List:'Список', Range:'Диапазон', Colors:'Цвета', Sizes:'Размеры', GalleryInner:'Изображение галереи',
  Total:'Итого',Total_Final:'Оформление заказа', Desctop:'Настольная',Tablet:'Планшетная',Mobile:'Мобильная',
};
export function variantName(group, v, index) {
  if (group.group === 'Секции' && group.variants.length>1 && group.slug!=='brands-section') return v.width+' px';
  if (group.slug==='icon' || group.slug==='document-icon') return v.title;
  if (group.variants.length===1) return group.title;
  return translations[v.title] || (/^Variant\d+$/.test(v.title) ? 'Вариант '+(index+1) : v.title);
}

export const library = [...foundations,...families.map(group=>({
  ...group, variants:group.variants.map((v,i)=>({...v,title:variantName(group,v,i),make:()=>createComponent(group.slug,v,i)})),
}))];

export function figmaUrl(node) {
  const normalized=decodeURIComponent(node);
  return 'https://www.figma.com/design/SzXvyQnA3KS6fxg8qGOnbm/Web-Comp-3--Copy-?node-id='+encodeURIComponent(normalized);
}
