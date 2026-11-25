import { card } from './cards.js';
import { choices, element, iconButton, photo, demoAction } from './elements.js';
import { footer, header } from './navigation.js';

function stepTrack(track, direction) {
  const visible = [...track.children].filter(item => !item.hidden);
  if (visible.length < 2) return;
  const amount = visible[0].offsetWidth + (parseFloat(getComputedStyle(track).columnGap) || 0);
  const end = track.scrollWidth - track.clientWidth;
  if (end < 2) {
    if (direction > 0) track.append(visible[0]);
    else track.prepend(visible.at(-1));
    return;
  }
  let target = track.scrollLeft + amount * direction;
  if (direction > 0 && track.scrollLeft >= end - 2) target = 0;
  if (direction < 0 && track.scrollLeft < 2) target = end;
  track.scrollTo({left:target,behavior:'instant'});
}

function controls(track) {
  return element('div','strip__controls',iconButton('left','Прокрутить назад',()=>stepTrack(track,-1)),
    iconButton('right','Прокрутить вперёд',()=>stepTrack(track,1)));
}

function scrollKeys(track) {
  track.tabIndex = 0;
  track.setAttribute('role','region');
  track.setAttribute('aria-label','Лента элементов');
  track.addEventListener('keydown',event=>{
    if (event.target !== track || !['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    stepTrack(track,event.key === 'ArrowLeft' ? -1 : 1);
  });
}

function brands(data) {
  const track = element('div','brands__track', ...data.brands.map(brand=>{
    const im = photo(brand.photo,brand.name);
    im.width = brand.width;
    im.height = brand.height;
    return im;
  }));
  scrollKeys(track);
  const arrows = controls(track);
  return element('div','brands',arrows.firstElementChild,track,arrows.lastElementChild);
}

export function section(kind, data, index = 0, storefront = false) {
  const box = element('section','store-section store-section--'+kind);
  for (const [role,font] of Object.entries(data.type || {})) box.style.setProperty('--section-'+role,font);
  box.style.setProperty('--section-padding', data.padding.map(v=>v+'px').join(' '));
  box.style.setProperty('--section-gap', Math.max(0,data.gap)+'px');
  box.style.setProperty('--section-color', data.background || 'transparent');
  box.style.minHeight = data.height+'px';
  if (kind === 'header') return header(data.width);
  if (kind === 'footer') {
    const foot = footer(data.width);
    foot.style.setProperty('--directory-height', data.footerMainHeight+'px');
    box.append(foot);
    return box;
  }
  if (kind === 'empty-layer') return element('span','empty-layer');
  if (kind === 'brands-section' && index === 1) { box.append(brands(data)); return box; }
  if (kind === 'hero-section' || kind === 'promo-section') {
    const banner = element('div','banner', photo(data.photos[0],kind === 'promo-section' ? 'Промоакция магазина' : 'Велосипедист в городе'));
    const layout=data.layout;
    banner.style.height = layout.banner.h+'px';
    if (kind === 'hero-section' && data.photos[1]) {
      const overlay=photo(data.photos[1]);
      overlay.style.left=100*(layout.overlay.x-layout.banner.x)/layout.banner.w+'%';
      overlay.style.width=100*layout.overlay.w/layout.banner.w+'%';
      banner.append(overlay);
    }
    box.append(banner);
    if (data.texts.length) box.append(element('div','banner__copy',element('h2','',data.texts[0]),element('p','',data.texts[1]),choices([...data.texts.slice(2),...data.choices])));
    return box;
  }
  const title = element('h2','store-section__title', data.texts[0] || 'Лучшие предложения');
  const head = element('header','store-section__heading',title);
  const options = data.choices.length ? choices(data.choices) : null;
  const layout=data.layout || {};
  const inlineChoices=layout.choices && layout.title && Math.abs(layout.choices.y-layout.title.y)<10;
  const headBounds=inlineChoices ? {
    y:Math.min(layout.title.y,layout.choices.y),
    h:Math.max(layout.title.y+layout.title.h,layout.choices.y+layout.choices.h)-Math.min(layout.title.y,layout.choices.y),
  } : layout.title;
  if (options && (inlineChoices || kind==='brands-section')) head.append(options);
  if (kind === 'about-section') {
    const aboutLink = demoAction(data.texts.at(-1));
    aboutLink.href = '/catalog/#about-section';
    box.append(element('div','about'+(data.width<=768?' about--stacked':''),
      element('div','about__copy',title,...data.texts.slice(1,-1).map(s=>element('p','',s)),aboutLink),
      photo(data.photos[0],'Доставка заказа')));
  } else {
    box.append(head);
    if (kind === 'gallery-section' || kind === 'vision-section') box.append(element('p','store-section__lead',data.texts[1]));
    if (options && !inlineChoices && kind!=='brands-section') box.append(options);
  }
  if (!data.items.length) return box;
  const first = data.items[0];
  const firstRow = data.items.filter(item=>Math.abs(item.y-first.y)<1);
  const track = element('div','strip');
  const available = data.width - data.padding[1] - data.padding[3];
  const overflow = firstRow.reduce((w,item)=>w+item.width,0) > available + 2;
  const columns = firstRow.length;
  const gap = firstRow.length > 1 ? Math.max(0,firstRow[1].x-first.x-first.width) : Math.max(0,data.cardGap);
  track.style.setProperty('--columns',String(columns));
  track.style.setProperty('--track-gap',Math.min(gap,80)+'px');
  track.classList.toggle('strip--scroll',overflow);
  for (const [i,item] of data.items.entries()) {
    const node = card(item.kind,item,item.kind === 'benefit' ? i : 0);
    node.style.setProperty('--item-width',item.width+'px');
    node.style.setProperty('--item-height',item.height+'px');
    node.style.minHeight = item.height+'px';
    node.dataset.labels = item.texts.slice(0,4).join('|').toLowerCase();
    track.append(node);
  }
  if (options && kind === 'product-section') options.addEventListener('choice',event=>{
    const label=data.choices[event.detail].toLowerCase();
    for (const node of track.children) node.hidden=!node.dataset.labels.split('|').includes(label);
  });
  if (overflow || ['gallery-section','blog-section','video-section'].includes(kind) ||
      (storefront && ['product-section','category-section','feature-section','service-section','sale-section','review-section'].includes(kind))) {
    scrollKeys(track);
    const next = iconButton('right','Показать следующие элементы',()=>stepTrack(track,1));
    head.insertBefore(next,head.children[1] || null);
  }
  box.append(track);
  box.style.gap='0';
  let previousBottom=data.padding[0];
  for (const child of box.children) {
    const region = child===head ? headBounds : child===options ? layout.choices : child===track ? layout.track :
      child.classList.contains('about') ? layout.about : layout.lead;
    if (!region) continue;
    child.style.marginBlockStart=Math.max(0,region.y-previousBottom)+'px';
    child.style.minHeight=region.h+'px';
    previousBottom=region.y+region.h;
  }
  return box;
}
