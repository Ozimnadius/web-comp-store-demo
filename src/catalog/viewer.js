import { button, element } from '../components/elements.js';
import { figmaUrl, library } from './library.js';

function link(label, href, className) {
  const a=element('a',className,label);
  a.href=href;
  return a;
}
const slugId = id => id.replaceAll(':','-');
const route = (g,v) => '#'+g.slug+(v?'/'+slugId(v.id):'');

export function mountLibrary() {
  const nav=document.querySelector('[data-library-nav]');
  const search=document.querySelector('#library-search');
  const content=document.querySelector('#examples');
  const heading=document.querySelector('#family-title');
  const source=document.querySelector('#family-source');
  const eyebrow=document.querySelector('#family-group');
  const filterButton=document.querySelector('#library-menu');
  const sidebar=document.querySelector('#library-sidebar');
  let observers=[];
  let active;
  document.querySelector('.skip-link').addEventListener('click',event=>{
    event.preventDefault();
    heading.focus();
  });

  function closeMenu() {
    sidebar.classList.remove('library-nav--open');
    filterButton.setAttribute('aria-expanded','false');
  }
  filterButton.addEventListener('click',()=>{
    const open=sidebar.classList.toggle('library-nav--open');
    filterButton.setAttribute('aria-expanded',String(open));
  });

  function navigation() {
    const query=search.value.trim().toLowerCase();
    nav.replaceChildren();
    for(const category of new Set(library.map(g=>g.group))) {
      const matches=library.filter(g=>g.group===category && (g.title+' '+g.slug+' '+g.variants.map(v=>v.title).join(' ')).toLowerCase().includes(query));
      if (!matches.length) continue;
      const group=element('details','library-nav__group',element('summary','library-nav__group-title',category));
      group.open=Boolean(query) || active.group===category;
      for(const g of matches) {
        const a=link(g.title,route(g),'library-nav__link');
        if (g===active) a.setAttribute('aria-current','page');
        a.addEventListener('click',closeMenu);
        group.append(a);
      }
      nav.append(group);
    }
    if (!nav.children.length) nav.append(element('p','library-nav__empty','Совпадений нет'));
  }

  function specimen(g,v,wide) {
    const node=v.make();
    const wrap=element('div','specimen__canvas',node);
    const viewer=element('div','specimen__viewport',wrap);
    const meta=element('div','specimen__meta',link(v.title,route(g,v),'specimen__permalink'),
      link('Figma ↗',figmaUrl(v.node || (v.id.includes(':')?v.id:g.node)),'specimen__source'));
    const result=element('article','specimen', meta,viewer);
    result.id='sample-'+slugId(v.id);
    if (v.width>0) {
      wrap.style.width=v.width+'px';
      if (g.group==='Составные компоненты' || g.group==='Базовые элементы') {
        node.style.width=v.width+'px';
        node.style.minHeight=v.height+'px';
        if (node.matches('img')) { node.style.height=v.height+'px'; node.style.objectFit='contain'; }
      }
      const dimensions=element('span','specimen__dimensions',v.width.toLocaleString('ru')+' × '+v.height.toLocaleString('ru')+' px');
      meta.insertBefore(dimensions,meta.lastChild);
      let natural=false;
      const fit=()=>{
        wrap.style.zoom=natural?'1':String(Math.min(1,viewer.clientWidth/v.width));
      };
      if (wide) {
        const size=button('Масштаб 1:1','specimen__scale',()=>{
          natural=!natural;
          size.textContent=natural?'Вписать по ширине':'Масштаб 1:1';
          size.setAttribute('aria-pressed',String(natural));
          fit();
        });
        size.setAttribute('aria-pressed','false');
        meta.insertBefore(size,meta.lastChild);
      }
      const observer=new ResizeObserver(fit);
      observer.observe(viewer);
      observers.push(observer);
    }
    return result;
  }

  function render() {
    const changingVariant=document.activeElement?.closest('.variant-picker');
    document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());
    observers.forEach(o=>o.disconnect());
    observers=[];
    const [slug,selected]=location.hash.slice(1).split('/');
    active=library.find(g=>g.slug===slug) || (slug==='field-outline-small'?library.find(g=>g.slug==='inputs'):library.find(g=>g.slug==='product'));
    const group=active;
    const chosen=group.variants.find(v=>slugId(v.id)===selected) || group.variants[0];
    heading.textContent=group.title;
    eyebrow.textContent=group.group;
    source.href=figmaUrl(group.node);
    document.title=group.title+' · Дизайн-система Web Comp';
    navigation();
    content.replaceChildren();
    const section=group.group==='Секции';
    if (section && group.variants.length>1) {
      const select=element('select','mode-select');
      select.setAttribute('aria-label','Вариант секции');
      group.variants.forEach(v=>select.add(new Option(v.title,slugId(v.id),false,v===chosen)));
      select.addEventListener('change',()=>{location.hash=group.slug+'/'+select.value;});
      content.append(element('label','variant-picker','Вариант секции',select));
      if (changingVariant) select.focus({preventScroll:true});
    }
    const compact=['icon','document-icon','benefit-icon','badge','sample-buttons','inputs','main-button','small-button','tag','menu-link'].includes(group.slug);
    const grid=element('div','examples'+(compact?' examples--compact':''));
    for (const v of (section?[chosen]:group.variants)) grid.append(specimen(group,v,section));
    content.append(grid);
    if (selected && !section) {
      const target=document.getElementById('sample-'+slugId(chosen.id));
      target?.scrollIntoView({block:'nearest'});
      if (target) { target.tabIndex=-1; target.focus({preventScroll:true}); }
    } else { window.scrollTo(0,0); }
  }
  search.addEventListener('input',navigation);
  window.addEventListener('hashchange',render);
  render();
}
