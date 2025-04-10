import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  block.textContent = '';

  // load footer fragment
  const footerPath = footerMeta.footer || '/footer';
  
  // Extract language locale and path from URL
  const pathParts = window.location.pathname.split('/');
  const localeIndex = pathParts.findIndex(part => ['en', 'fr'].includes(part));
  const basePath = localeIndex >= 0 ? pathParts.slice(0, localeIndex + 1).join('/') : '/content/securbank/en';
  
  // Prepend base path to footer path
  const localizedFooterPath = `${basePath}/${footerPath.substring(1)}`;
  const fragment = await loadFragment(localizedFooterPath);

  // decorate footer DOM
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);
}
