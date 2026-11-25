import '@fontsource-variable/geologica/wght.css';
import '../styles/main.scss';
import '../styles/home.scss';
import layouts from './layouts.json';
import { homeSection } from './sections.js';

const bands = [
  [560, 375], [850, 768], [1050, 1000], [1280, 1200],
].map(([max, profile]) => ({ query: matchMedia('(max-width: ' + max + 'px)'), profile }));

function mountHome() {
  const main = document.querySelector('#home-main');
  const heading = main.querySelector('h1');
  const requested = new URLSearchParams(location.search).get('container');
  let desktop = ['1296', '1500'].includes(requested) ? Number(requested) : 1696;
  const lightDesktop = desktop === 1296 ? 1296 : 1696;
  let current;
  const states = new Map();

  function switchTheme() {
    desktop = desktop === 1500 ? lightDesktop : 1500;
    render();
  }

  function render() {
    const profile = bands.find(b => b.query.matches)?.profile || desktop;
    const theme = desktop === 1500 ? 'dark' : desktop === 1296 ? 'red' : 'blue';
    const version = profile + '-' + theme;
    if (current === version) return;
    const focused = document.activeElement?.dataset.homeControl;
    for (const el of document.querySelectorAll('[data-home-control]')) {
      if (el.matches('input,select')) states.set(el.dataset.homeControl, el.value);
      else if (el.dataset.changed) states.set(el.dataset.homeControl, el.getAttribute('aria-pressed') || el.getAttribute('aria-expanded'));
    }
    current = version;
    document.body.classList.toggle('store-theme--dark', theme === 'dark');
    document.body.classList.toggle('store-theme--narrow', theme === 'red');
    const content = document.createDocumentFragment();
    const width = profile > 1200 ? 1920 : profile;
    for (const [kind, spec] of Object.entries(layouts[profile])) {
      const node = homeSection(kind, spec, width, theme, switchTheme);
      const groups = new Map();
      for (const el of node.querySelectorAll('button,input,select')) {
        const role = el.getAttribute('aria-label') || el.className + ':' + (el.tagName === 'BUTTON' ? el.textContent : el.type);
        const count = groups.get(role) || 0;
        groups.set(role, count + 1);
        const key = kind + '/' + role + '/' + count;
        el.dataset.homeControl = key;
        const saved = states.get(key);
        if (saved === undefined) continue;
        if (el.matches('input,select')) el.value = saved;
        else if (saved === 'true' && (el.getAttribute('aria-pressed') === 'false' || el.getAttribute('aria-expanded') === 'false')) {
          el.click();
          el.dataset.changed = 'true';
        }
      }
      if (kind === 'header' || kind === 'footer') document.querySelector('#home-' + kind).replaceChildren(node);
      else content.append(node);
    }
    main.replaceChildren(heading, content);
    if (focused) document.querySelector('[data-home-control="' + CSS.escape(focused) + '"]')?.focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    const el = event.target.closest('button[aria-pressed],button[aria-expanded]');
    if (el?.dataset.homeControl && !el.closest('.store-header__modes')) {
      if (el.classList.contains('choice')) {
        for (const peer of el.parentElement.children) states.delete(peer.dataset.homeControl);
      }
      el.dataset.changed = 'true';
    }
  });
  for (const band of bands) band.query.addEventListener('change', render);
  render();
}

// Сохраняем ранее опубликованные ссылки на образцы в корне проекта.
function route() {
  if (location.hash && !location.hash.startsWith('#home-')) {
    location.replace('/catalog/' + location.hash);
    return true;
  }
  return false;
}
if (!route()) {
  mountHome();
  window.addEventListener('hashchange', route);
}
