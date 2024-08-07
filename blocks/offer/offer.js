import { getEnvUrls } from '../../scripts/aem.js';

/* eslint-disable no-underscore-dangle */
export default async function decorate(block) {
  const aempublishurl = getEnvUrls().publish;
  const aemauthorurl = getEnvUrls().author;
  const persistedquery = '/graphql/execute.json/securbank/OfferByPath';
  const offerpath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();
  const variationname = block.querySelector(':scope div:nth-child(2) > div').innerHTML.trim();

  const url = window.location && window.location.origin && window.location.origin.includes('author')
    ? `${aemauthorurl}${persistedquery};path=${offerpath};variation=${variationname};ts=${Math.random() * 1000}`
    : `${aempublishurl}${persistedquery};path=${offerpath};variation=${variationname};ts=${Math.random() * 1000}`;
  const options = { credentials: 'include' };

  // console.log(url); //https://author-p123917-e1220159.adobeaemcloud.com/graphql/execute.json/securbank/OfferByPath;path=/content/dam/securbank/en/offers/997;variation=main;ts=172.03956935404463

  const cfReq = await fetch(url, options)
    .then((response) => response.json())
    .then((contentfragment) => {
      let offer = '';
      if (contentfragment.data) {
        offer = contentfragment.data.offerByPath.item;
      }
      return offer;
    });

  const itemId = `urn:aemconnection:${offerpath}/jcr:content/data/master`;

  block.innerHTML = `
  <div class='banner-content' data-aue-resource=${itemId} data-aue-type="reference" data-aue-filter="cf">
    <div class="banner-content__info">
      <p data-aue-prop="headline" data-aue-type="text" class='banner-content__info--headline'>${cfReq.headline}</p>
      <p data-aue-prop="detail" data-aue-type="richtext" class='banner-content__info--detail'>${cfReq.detail.plaintext}</p>
    </div>
    <img class="banner-content__img" src=${aempublishurl + cfReq.heroImage._dynamicUrl}>
  </div>
`;
}
