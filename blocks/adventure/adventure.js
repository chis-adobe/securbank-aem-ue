/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

/* eslint-disable no-console */

import {
  decorateMain,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
export async function loadFragment(path) {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  let variation = params.variation ?? "main";

  if (path && path.startsWith('/')) {
    const resp = await fetch(`https://publish-p130746-e1298459.adobeaemcloud.com/graphql/execute.json/wknd-shared/adventure-by-path;adventurePath=${path};variation=${variation}`);
    if (resp.ok) {
      const main = document.createElement('div');
      const leftEl = document.createElement('div');
      const rightEl = document.createElement('div');
      const titleEl = document.createElement('h1');
      const descEl = document.createElement('div');
      const activityEl = document.createElement('div');
      const locationEl = document.createElement('div');
      const tripLengthEl = document.createElement('div');
      const imgEl = document.createElement('img');
      const respJson = await resp.json();
      const adventureJson = respJson.data.adventureByPath.item;

      leftEl.classList.add("left");
      rightEl.classList.add("right");
      titleEl.innerHTML = adventureJson.title;
      descEl.innerHTML = adventureJson.description.html;
      descEl.classList.add("description");
      activityEl.innerHTML = `Activity Type: ${adventureJson.activity}`;
      locationEl.innerHTML = `Location: ${adventureJson.destination}`;
      tripLengthEl.innerHTML = `Date: ${adventureJson.date}`;
      imgEl.src = `https://publish-p130746-e1298459.adobeaemcloud.com${adventureJson.primaryImage._dynamicUrl}`;
      
      leftEl.append(titleEl);
      leftEl.append(descEl);
      rightEl.append(activityEl);
      rightEl.append(locationEl);
      rightEl.append(tripLengthEl);
      main.append(imgEl);
      main.append(leftEl);
      main.append(rightEl);

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      block.closest('.adventure').replaceWith(...fragment.childNodes);
    }
  }
}
