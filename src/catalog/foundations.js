import typography from './typography.json';
import fields from './fields.json';
import buttons from './buttons.json';
import variables from './variables.json';
import tables from './tables.json';
import typePage from './type-page.json';
import { element, button } from '../components/elements.js';
import { field, sampleButton } from '../components/fields.js';

const sizeLabels = {small:'малый',medium:'средний',large:'большой'};
const appearance = {outline:'контур',solid:'заливка',tertiary:'вспомогательное',white:'белое'};
const typeSamples = ['Велосипеды для движения в городе','Лучшие предложения','Коллекции','Услуги',
  'Монтаж оборудования','Быстрая доставка','В наличии'];
const collections = ['Светлая и тёмная палитры','Цвета темы','Ширина контейнера','Семейство шрифта',
  'Радиусы кнопок','Типографика и отступы','Начертание заголовков','Радиусы изображений',
  'Радиусы контейнеров','Интервал карточек','Режим баннера'];

function typeExample(type, index) {
  const sample = element('div','type-sample',typeSamples[index] || (type.name.startsWith('Price') ? '4 200 ₽' :
    type.name.startsWith('Button') ? 'В корзину' : type.name.startsWith('Label') ? 'НОВИНКА' : 'Бережно доставляем товары по России за 24 часа'));
  sample.style.font = 'var(--type-'+type.slug+')';
  return sample;
}

function variableSet(set) {
  const select = element('select','mode-select');
  select.setAttribute('aria-label','Режим коллекции '+set.name);
  set.modes.forEach((m,i)=>select.add(new Option(m.name,String(i))));
  const list = element('dl','token-list');
  function render() {
    list.replaceChildren();
    for (const [name,value] of Object.entries(set.modes[select.selectedIndex].values)) {
      const swatch = element('span','token-list__value',String(value));
      if (String(value).startsWith('#')) swatch.style.setProperty('--chip',value);
      list.append(element('div','token-list__row',element('dt','',name),element('dd','',swatch)));
    }
  }
  select.addEventListener('change',render);
  render();
  return element('div','token-set',select,list);
}

function tableExample(model,index) {
  const table = element('table','type-table type-table--'+index);
  const rows = model.rows.map((row,i)=>element('tr','',...row.map((value,j)=>{
    const cell = element(i ? 'td' : 'th','',i ? value : ['№','Имя','Фамилия','Имя пользователя'][j] || value);
    if (!i) cell.scope = 'col';
    return cell;
  })));
  table.append(element('thead','',rows.shift()),element('tbody','',...rows));
  return element('div','table-scroll',table);
}

const buttonVariants = buttons.map((b,i)=>({
  id:b.id, width:b.width, height:b.height, title: b.group + ' · '+(b.group==='Размер' ? b.height+' px · '+(b.background==='transparent'?'контур':'заливка') : b.label),
  make:()=>sampleButton(b),
}));

function textColumn() {
  return element('div','type-column',...typePage.sample.map((s,index)=>{
    const level=s.text.match(/Заголовок H([1-6])/);
    const node=element(level?'h'+level[1]:'p','',s.text);
    Object.assign(node.style,{fontSize:s.size+'px',fontWeight:s.weight,lineHeight:s.line+(s.unit==='PIXELS'?'px':'%')});
    return node;
  }));
}

function listColumn() {
  return element('div','type-column',...typePage.lists.map(([items],i)=>{
    if (i===3) return element('dl','',...items.map((text,j)=>element(j%2?'dd':'dt','',text)));
    return element(i===1?'ol':'ul',i===2?'text-list--plain':'',...items.map(text=>element('li','',text)));
  }));
}

function gridExample(frame) {
  const bar=element('div','grid-example__frame',element('div','grid-example__content'));
  bar.style.paddingInline=(100*frame.padding/frame.width)+'%';
  return element('div','grid-example',bar,element('p','',frame.theme+' · поле '+frame.padding+' px с каждой стороны'));
}

export const foundations = [
  {slug:'typography',title:'Шкала шрифтов',node:'164:65301',group:'Основы',
    variants:typography.map((t,i)=>({id:'type-'+t.slug,node:t.node,title:t.name+' · '+t.size+' px',make:()=>typeExample(t,i)}))},
  {slug:'variables',title:'Переменные и режимы',node:'26:278',group:'Основы',
    variants:variables.map((v,i)=>({id:'collection-'+(i+1),title:collections[i],make:()=>variableSet(v)}))},
  {slug:'rich-text',title:'Цитата, отзыв и таблицы',node:'164:67843',group:'Основы',variants:[
    {id:'164:67846',title:'Заголовки и абзацы',make:textColumn},
    {id:'261:113786',title:'Четыре вида списков',make:listColumn},
    {id:'261:113669',title:'Цитата · текст-заполнитель из макета',make:()=>element('blockquote','quote',element('p','',typePage.quote[1]),element('cite','',typePage.quote[2]))},
    {id:'261:113666',title:'Отзыв в тексте',make:()=>element('blockquote','quote quote--review',element('p','',typePage.review))},
    ...tables.map((t,i)=>({id:t.node,title:t.title,make:()=>tableExample(t,i)}))]},
  {slug:'containers',title:'Экраны и контейнеры',node:'26:278',group:'Основы',variants:typePage.frames.map(f=>({
    id:'frame-'+f.node,node:f.node,title:f.width+' px · контейнер '+f.content+' px',make:()=>gridExample(f),
  }))},
  {slug:'inputs',title:'Поля ввода и списки',node:'152:48282',group:'Элементы управления',
    variants:fields.map(f=>({id:f.id,width:{small:140,medium:180,large:220}[f.size],height:{small:30,medium:38,large:48}[f.size],
      title:[f.kind,appearance[f.variant],sizeLabels[f.size],f.disabled?'отключено':'обычное'].join(' · '),make:()=>field(f)}))},
  {slug:'sample-buttons',title:'Кнопки страницы образцов',node:'74:27675',group:'Элементы управления',variants:buttonVariants},
  {slug:'theme-button',title:'Кнопка синей темы',node:'I26:630;32:1116;32:1105',group:'Элементы управления',
    variants:[{id:'theme-blue',title:'Синяя тема · Geologica',make:()=>element('div','store-theme',button('Хит','button button--small'))}]},
];
