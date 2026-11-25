import masters from '../catalog/sections.json';
import { section } from '../components/sections.js';
import { demoAction, element, icon, photo } from '../components/elements.js';
import { header, footer } from '../components/navigation.js';

function banner(kind, master, spec) {
  const [left, , width, height] = spec.banner;
  const hero = kind === 'hero-section';
  const picture = photo(master.photos[0], hero ? 'Велосипедист на городской улице' : 'Акустика. Наслаждайтесь любимой музыкой');
  const artwork = element(hero ? 'div' : 'a', 'home-banner__art', picture);
  if (!hero) {
    artwork.href = '/#home-sale-section';
    artwork.setAttribute('aria-label', 'Подробнее об акциях');
  }
  artwork.style.aspectRatio = width + ' / ' + height;
  if (hero) {
    const rider = photo(master.photos[1]);
    for (const image of [picture, rider]) {
      image.loading = 'eager';
      image.fetchPriority = 'high';
    }
    const [offset, , riderWidth] = spec.overlay;
    rider.style.left = (offset - left) / width * 100 + '%';
    rider.style.width = riderWidth / width * 100 + '%';
    artwork.append(rider);
  } else {
    artwork.style.height = height + 'px';
  }
  const box = element('section', 'home-banner home-banner--' + (hero ? 'hero' : 'promo'),
    element('div', 'home-banner__frame', artwork));
  box.setAttribute('aria-label', hero ? 'Велосипеды для города' : 'Акустика');
  if (hero && master.texts.length) {
    const markers = element('span', 'home-banner__markers');
    markers.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 4; i++) markers.append(element('i'));
    artwork.append(markers);
    box.append(element('div', 'home-banner__copy',
      element('h2', '', master.texts[0]), element('p', '', master.texts[1]),
      element('div', 'home-banner__actions', ...[master.texts[2], ...master.choices].map(label => demoAction(label)))));
  }
  return box;
}

function sectionModel(master, spec, width) {
  const model = { ...master, width, height: spec.height, padding: spec.padding };
  if (!spec.grid) return model;
  const { grid } = spec;
  model.choices = spec.choice ? master.choices : [];
  model.items = master.items.map((item, index) => ({
    ...item, width: grid.width, height: grid.height,
    x: (index % grid.columns) * (grid.width + grid.gap),
    y: Math.floor(index / grid.columns) * (grid.height + grid.gap),
    texts: spec.benefits?.[index] || item.texts,
  }));
  model.cardGap = grid.gap;
  model.layout = {
    title: spec.title, choices: spec.choice, lead: spec.lead, about: spec.about,
    track: { y: grid.top, h: spec.height - spec.padding[2] - grid.top },
  };
  return model;
}

export function homeSection(kind, spec, width, theme, switchTheme) {
  const master = masters[spec.master];
  let node;
  if (kind === 'header') {
    node = header(width, { theme, switchTheme });
  } else if (kind === 'footer') {
    node = footer(width);
    node.querySelector('.store-footer__contacts').id = 'home-contacts';
    const catalog = element('a', 'store-footer__library', 'Дизайн-система');
    catalog.href = '/catalog/';
    node.querySelector('.store-footer__end').append(catalog);
  } else if (spec.banner) {
    node = banner(kind, master, spec);
  } else {
    node = section(kind, sectionModel(master, spec, width), kind === 'brands-section' ? 1 : 0, true);
    if (kind === 'brands-section' && !spec.arrows) {
      node.classList.add('home-brands--compact');
      node.querySelectorAll('.brands > .icon-button').forEach(button => button.remove());
    }
    if (spec.grid) {
      node.style.setProperty('--tile-ratio', spec.grid.width / spec.grid.height);
      node.querySelector('.strip').style.minHeight = '';
      if (kind === 'category-section' || kind === 'vision-section') {
        node.querySelectorAll('.card__title').forEach(title => title.append(icon('right')));
      }
      if (kind === 'collection-section') {
        node.style.setProperty('--collection-limit', (spec.grid.columns * spec.grid.width + (spec.grid.columns - 1) * spec.grid.gap) + 'px');
      }
      if (kind === 'about-section' && theme === 'blue') {
        node.querySelectorAll('.card--benefit .icon').forEach((icon, index) => {
          icon.src = '/media/home/benefit-' + (index + 1) + '.svg';
        });
      }
    }
  }
  node.dataset.section = kind;
  if (kind !== 'header' && kind !== 'footer') node.id = 'home-' + kind;
  node.style.setProperty('--pad-top', spec.padding[0] + 'px');
  node.style.setProperty('--pad-bottom', spec.padding[2] + 'px');
  const available = width - spec.padding[1] - spec.padding[3];
  node.style.setProperty('--content-limit', width === 1920 ? available + 'px' : '100%');
  node.style.setProperty('--gutter', (width === 1920 ? 40 : spec.padding[3]) + 'px');
  if (kind === 'footer' || kind === 'header') node.style.minHeight = spec.height + 'px';
  return node;
}
