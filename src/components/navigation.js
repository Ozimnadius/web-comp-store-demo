import { button, choices, demoAction, element, icon, iconButton, notice } from './elements.js';

const navLabels = ['Бренды', 'Акции', 'Услуги', 'Компания', 'Блог', 'Информация', 'Контакты'];
const categories = ['Смартфоны','Инструменты','Одежда на весну','Комплект сантехники','Набор для рыбалки','Диваны'];

function catalogMenu() {
  return notice('Каталог', choices(categories, 'account-menu'));
}

function storeSearch() {
  const input = element('input','store-search__input');
  input.type = 'search';
  input.placeholder = 'Найти';
  input.setAttribute('aria-label','Поиск по каталогу');
  const form = element('form','store-search',input,iconButton('search','Найти'));
  form.lastChild.type = 'submit';
  form.addEventListener('submit', event => {
    event.preventDefault();
    const query = input.value.trim().toLocaleLowerCase('ru');
    const scope = form.querySelector('select')?.value;
    const hits = categories.filter(name => (!scope || scope === name) && name.toLocaleLowerCase('ru').includes(query));
    notice('Результаты поиска', element('p','',hits.join(' · ') || 'Категории по запросу не найдены.'));
  });
  return form;
}

export function header(width, home) {
  const large = width > 1000;
  const logo = icon('29:920','Маркет PRO');
  logo.className = 'store-header__logo';
  if (home && home.theme !== 'red') logo.src = '/media/home/' + (home.theme === 'dark' ? 'logo-dark' : 'logo') + '.svg';
  const menu = iconButton('menu','Открыть каталог',catalogMenu);
  const accounts = [['user','Войти'],['compare','Сравнение'],['heart','Избранное'],['bag','Корзина']];
  const actions = element('div','store-header__actions');
  for (const [name,label] of accounts) {
    const b = iconButton(name,label,()=>notice(label,element('p','','Демонстрационный раздел магазина.')));
    if (large) b.append(element('small','',label));
    actions.append(b);
  }
  const bar = element('div','store-header__row');
  if (!large) bar.append(menu);
  bar.append(logo);
  if (width > 375) bar.append(button([icon('menu'),'Каталог'],'button',catalogMenu));
  if (large) {
    const search = storeSearch();
    if (home) {
      const scope = element('select', 'store-search__scope');
      scope.setAttribute('aria-label', 'Область поиска');
      scope.add(new Option('Каталог', ''));
      for (const category of categories) scope.add(new Option(category, category));
      search.insertBefore(scope, search.lastChild);
    }
    bar.append(search);
  }
  else actions.prepend(iconButton('phone','Контактный телефон',()=>notice('Контакты',element('p','','+7 100 000-00-00'))),
    iconButton('search','Открыть поиск',()=>notice('Поиск по каталогу',storeSearch())));
  bar.append(actions);
  const root = element('header','store-header');
  if (large) {
    const mode = iconButton('moon','Включить тёмную тему',()=>{
      const dark = root.classList.toggle('store-theme--dark');
      mode.replaceChildren(icon(dark ? 'sun' : 'moon'));
      mode.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    });
    let modes = mode;
    if (home) {
      const light = iconButton('sun', 'Светлая тема', () => { if (home.theme === 'dark') home.switchTheme(); });
      const dark = iconButton('moon', 'Тёмная тема', () => { if (home.theme !== 'dark') home.switchTheme(); });
      light.setAttribute('aria-pressed', String(home.theme !== 'dark'));
      dark.setAttribute('aria-pressed', String(home.theme === 'dark'));
      modes = element('div', 'store-header__modes', light, dark);
    }
    const navigation = choices(navLabels, 'store-header__nav', -1);
    const phone = element('span', '', '+7 100 000-00-00');
    if (home) {
      for (const label of ['Услуги', 'Компания']) navigation.children[navLabels.indexOf(label)].append(icon('down'));
      phone.append(icon('down'));
    }
    const callback = demoAction('Заказать звонок');
    root.append(element('div','store-header__top',element('span','',icon('location'),'Москва'),
      navigation, home ? element('div','store-header__contact',phone,callback) : [phone,callback],modes));
  }
  root.append(bar);
  if (large) root.append(choices(categories,'store-header__nav',-1));
  return root;
}

export function footer(width) {
  const subscribe = element('form','subscription',element('strong','','Подписаться на новости и акции'));
  const input = element('input','form-field__input');
  input.type = 'email'; input.required = true; input.placeholder = 'Электронная почта';
  input.setAttribute('aria-label','Электронная почта');
  const submit = button('Подписаться','button');
  submit.type = 'submit';
  subscribe.append(input,submit);
  subscribe.addEventListener('submit',event=>{
    event.preventDefault();
    notice('Подписка',element('p','','Адрес прошёл проверку. Отправка подписки будет доступна после подключения формы.'));
  });
  const groups = [['Интернет-магазин','Каталог','Акции','Бренды','Услуги'],
    ['Компания','О компании','Лицензии','Отзывы','Документы'],
    ['Информация','Реквизиты','Магазины','Возможности'],
    ['Помощь','Условия оплаты','Условия доставки','Гарантия на товар','Вопрос-ответ','Обзоры']];
  const links = element('nav','store-footer__links',...groups.map(([title,...labels])=>
    element('div','store-footer__column',element('strong','',title),...labels.map(label=>demoAction(label)))));
  const contacts = element('address','store-footer__contacts',element('strong','','Контакты'),
    ...['+7 100 000-00-00','msk.no-reply@aspro-demo.ru','Москва, ул. Пушкина 21, 3 этаж, офис 4'].map(line=>element('span','',line)),icon('socials','Социальные сети'));
  return element('footer','store-footer' + (width <= 1000 ? ' store-footer--compact' : ''),
    element('div','store-footer__main',element('div','store-footer__directory',subscribe,links),contacts),
    element('div','store-footer__end','© 2025 Интернет-магазин Лайтшоп',icon('payments','Способы оплаты'),
      element('span','','Конфиденциальность · Оферта'),element('span','','Разработано в web-comp')));
}
