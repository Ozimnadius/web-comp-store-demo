import { pricePanel } from './price.js';
import { badge, button, demoAction, element, icon, notice, photo, toggle } from './elements.js';

function heading(text) { return element('h3', 'card__title', text); }
function muted(text) { return element('span', 'card__meta', text); }
function words(texts) { return texts.filter(Boolean).join(' '); }

export function cartButton(label = 'В корзину') {
  const b = button(label, 'button button--small', () => {
    const chosen = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(chosen));
    b.textContent = chosen ? 'В корзине' : label;
  });
  b.setAttribute('aria-pressed', 'false');
  return b;
}

function product(texts, image, compact) {
  const price = texts.findIndex(t => t.includes('₽'));
  const labels = texts.slice(0, price).map(badge);
  const actions = element('div', 'product__actions');
  for (const [name, label] of [['heart','В избранное'],['compare','Добавить к сравнению']]) {
    const b = toggle(icon(name), 'product__action');
    b.setAttribute('aria-label', label);
    actions.append(b);
  }
  return element('article', 'product' + (compact ? ' product--compact' : ''),
    element('div', 'product__media', image, element('div','product__badges',...labels),actions),
    element('strong','product__price',texts[price]), heading(texts[price+1]),
    element('div','product__availability', icon('star'), texts[price+2], element('span','product__stock',words(texts.slice(price+3,-1)))),
    cartButton(texts.at(-1)));
}

function review(texts, image) {
  const body = element('p','review__text', texts[4]);
  const more = button(texts[5] || 'Отзыв полностью', 'text-button', () => {
    const expanded = more.getAttribute('aria-expanded') !== 'true';
    more.setAttribute('aria-expanded', String(expanded));
    body.classList.toggle('review__text--expanded', expanded);
    more.textContent = expanded ? 'Свернуть отзыв' : 'Отзыв полностью';
  });
  more.setAttribute('aria-expanded','false');
  return element('article','review', element('header','review__header',image,
    element('div','review__author', element('div','review__name',heading(texts[0]),element('span','review__rating','★ '+texts[1])), muted(texts[2]+' · '+texts[3]))), body, more);
}

export function card(kind, model, index = 0) {
  const t = model.texts;
  const photos = model.photos;
  const image = photos[0] ? photo(photos[0]) : null;
  const wrap = (...children) => element('article','card card--' + kind, ...children);
  const media = (...children) => element('div','card__media', image, ...children);
  const body = (...children) => element('div','card__body', ...children);
  switch (kind) {
    case 'product': return product(t,image,index === 1 || model.width <= 190);
    case 'review': return review(t,image);
    case 'price': return pricePanel(t,image,index,cartButton);
    case 'category-feature': case 'vision': {
      return wrap(image, t.length ? body(muted(t[0]),heading(t[1]), t.length > 2 ?
        element('div','card__tags',...t.slice(2).map(label=>element('span','tag',label))) : null) : null);
    }
    case 'category': {
      const tile = wrap(media(), heading(t[0]));
      tile.classList.toggle('card--category-stacked', index === 1);
      return tile;
    }
    case 'collection': return wrap(heading(t[0]), muted(t[1]), element('div','card__mosaic',...photos.map(key=>photo(key))));
    case 'editorial': {
      if (!t.length) return wrap(image);
      if (t.length === 2) return wrap(media(),body(muted(t[0]),heading(t[1])));
      return wrap(media(),body(heading(t[0]),muted(words(t.slice(1)))));
    }
    case 'video': {
      const play = button(icon('play'),'video__play',() => {
        const video = element('video', 'video__player');
        video.controls = true;
        video.playsInline = true;
        video.src = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
        notice(t[1], element('div', '', video, element('p', '', 'Демонстрационный ролик MDN.')));
      });
      play.setAttribute('aria-label','Открыть видеоотзыв');
      return wrap(media(play,element('span','video__duration',t[0])),body(heading(t[1]),muted(t[2])));
    }
    case 'sale': return wrap(media(element('div','card__labels', element('span','sale-label',t[0]),
      element('span','sale-clock',icon('fire'),words(t.slice(1,-2))))),body(heading(t.at(-2)),muted(t.at(-1))));
    case 'service': {
      if (!image) return wrap(heading(t[0]),muted(t[1]),element('div','service-order',element('strong','',t[2]),cartButton(t.at(-1))));
      const discounted = t[0].startsWith('-');
      const prices = t.slice(discounted ? 2 : 1,-1);
      return wrap(media(discounted ? element('span','sale-label',t[0]) : null),
        body(heading(t[discounted ? 1 : 0]),element('div','card__price',prices[0],prices[1] ? element('del','',prices[1]) : null),demoAction(t.at(-1))));
    }
    case 'benefit': return wrap(icon(['72:3474','73:3603','73:3604','73:3605'][index%4]),heading(t[0]),muted(t[1]));
    case 'vacancy': {
      const salary=t.findIndex(s=>s.includes('120'));
      const summary=element('summary','vacancy__summary',element('div','vacancy__intro',heading(t[0]),muted(t.slice(1,salary).join(' '))),
        element('strong','vacancy__salary',t[salary],icon('down')));
      const detail=t[salary+1] || 'Мы ищем специалиста, который имеет опыт самостоятельного создания, ведения и анализа рекламных кампаний.';
      const details=element('details','vacancy',summary,element('p','',detail),demoAction('Отправить резюме'));
      details.open=index<2;
      return details;
    }
    case 'certificate': return wrap(image,heading(t[0]),muted(t[1]));
    case 'top-banner': return element('div','top-banner',image);
    default: throw new Error('Неизвестная карточка ' + kind);
  }
}
