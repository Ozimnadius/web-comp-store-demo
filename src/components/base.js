import { badge, choices, demoAction, element, icon, photo, toggle } from './elements.js';

export function baseComponent(kind, model, index, id) {
  const label = model.texts?.[0];
  switch (kind) {
    case 'logo': case 'icon': case 'benefit-icon': case 'document-icon': return icon(id);
    case 'badge': return badge(label);
    case 'thumbnail': return photo(model.photos[0], 'Товар подборки');
    case 'brand': return element('div','brand-mark',photo(model.photos[0],'Жерко'));
    case 'main-button': case 'small-button': {
      const b = demoAction(label);
      if (index === 1 && kind === 'main-button') b.prepend(icon('menu'));
      b.classList.toggle('button--small', kind === 'small-button');
      b.classList.toggle('button--secondary', index === 2 || (kind === 'small-button' && index === 1));
      b.style.width = model.width + 'px';
      b.style.height = model.height + 'px';
      return b;
    }
    case 'tag': return element('span', 'tag '+(index?'tag--letter':'tag--overlay'), label);
    case 'menu-link': {
      if (index < 2) return element('details', 'menu-link'+(index===0?' menu-link--high':''),
        element('summary', 'menu-link__label', label, icon('down')), choices(['Монтаж оборудования','Сборка мебели'], 'menu-link__options'));
      const link=demoAction(label);
      link.className='menu-link__plain';
      return link;
    }
    case 'list': {
      if (index === 2) return element('dl', 'text-list', element('dt', '', 'Описание'), element('dd', '', 'Строка списка с пояснением'));
      const list = element(index === 1 ? 'ol' : 'ul', 'text-list' + (index === 3 ? ' text-list--plain' : ''));
      list.append(element('li', '', 'Строка списка'));
      return list;
    }
    case 'action-card': {
      const card = toggle([icon('user'), element('span','action-card__copy', element('strong','',label),element('small','',model.texts[1]))],
        'action-card' + (index % 2 ? ' action-card--row' : '') + (index > 1 ? ' action-card--hover' : ''));
      return card;
    }
    case 'form-field': {
      const input = element('input', 'form-field__input');
      input.type = index ? 'tel' : 'text';
      input.placeholder = model.texts[1];
      return element('label', 'form-field', element('span','',label), input, index ? element('small','',model.texts[2]) : null);
    }
    case 'account-menu': return choices(model.texts, 'account-menu');
    case 'sidebar': return index === 2 ? element('details', 'sidebar', element('summary', '', label), choices(['Полотенца','Постельное бельё'], 'account-menu')) : toggle(label, 'sidebar__item', index === 0);
    case 'textile': return toggle([photo(model.photos[0], ''), label], 'textile');
    default: throw new Error('Неизвестный базовый компонент ' + kind);
  }
}
