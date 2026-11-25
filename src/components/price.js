import { demoAction, element, icon } from './elements.js';

function promoField() {
  const input = element('input','form-field__input');
  input.setAttribute('aria-label','Промокод');
  return element('details','price-panel__promo',element('summary','','Есть промокод?',icon('right')),input);
}

function actionLink(label) {
  return demoAction(label, 'text-button');
}

export function pricePanel(t,pic,index,cartButton) {
  if (!index) {
    const stock=element('div','price-panel__stock',element('span','product__stock',t[3]),' ',t[4]);
    const info=element('div','price-panel__links',stock,...t.slice(5,8).map(actionLink),element('small','',t[8]));
    const block=element('div','price-panel__box',element('strong','price-panel__amount',t[0]),
      element('div','price-panel__buttons',cartButton(t[1]),demoAction(t[2])),info);
    return element('article','price-panel price-panel--product',block,element('div','price-panel__foot',pic,
      element('div','price-panel__tags',actionLink(t[9]),actionLink(t[10])),element('small','',t[11])));
  }
  const total=element('header','price-panel__total',element('strong','',t[0]),element('strong','',t[1]));
  const block=element('div','price-panel__box',total);
  if (index===1) {
    block.append(promoField(),element('div','price-panel__warning',element('span','',t[3]),element('small','',t[4]),icon('134:39625')),demoAction(t.at(-1)));
  } else {
    const rows=[[t[2],t[3]],['Доставка:',t[5]],['Экономия:',t[7]]].map(([label,value])=>
      element('div','price-panel__line',element('span','',label),element('i',''),element('span','',value)));
    block.append(element('div','price-panel__items',...rows),promoField(),
      element('div','price-panel__delivery',element('span','',t[9],' ',element('em','',t[10])),element('small','',t[11]),
        element('span','',t[12],' ',element('em','',t[13]))),demoAction(t.at(-1)));
  }
  return element('article','price-panel price-panel--total',block);
}
