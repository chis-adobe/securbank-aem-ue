/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-globals */
import { getMetadata } from '../../scripts/aem.js';
// import { getActiveAudiences } from '../../scripts/utils.js';
import { loadFragment } from '../fragment/fragment.js';
import authenticate from './auth.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');
const LOGIN_FORM = `<button type="button" aria-label="Login">
<span>Sign in</span>
</button>`;

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('role', 'button');
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('role');
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }
  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

export function decorateNavAuth() {
  const auth = document.getElementsByClassName('nav-auth')[0];
  auth.innerHTML = `<button type="button" id="logout" aria-label="Login">
            <span>Sign out</span>
          </button>`;
  const logoutButton = auth.children[0];
  logoutButton.addEventListener('click', () => {
    auth.innerHTML = LOGIN_FORM;
    window.localStorage.removeItem('auth');
    location.reload();
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : (window.location.href.includes("/fr") ? '/fr_ca/nav' : '/en/nav');
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
    brandLink.querySelector('img').setAttribute('alt', 'logo');
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  // login section
  const auth = document.createElement('div');
  auth.classList.add('nav-auth');
  // console.log(getActiveAudiences());
  if (window.localStorage.getItem('auth') === null) {
    auth.innerHTML = LOGIN_FORM;
    auth.addEventListener('click', () => {
      const loginForm = document.getElementsByClassName('login-form')[0];
      loginForm.style.display = 'block';
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('userName').value;
        const password = document.getElementById('password').value;

        authenticate(username, password).then((user) => {
          // console.log(user);
          const auth = document.getElementsByClassName('nav-auth')[0];
          auth.innerHTML = `<button type="button" id="logout" aria-label="Login">
            <span>Sign out</span>
          </button>`;
          const logoutButton = document.getElementById('logout');
          logoutButton.addEventListener('click', () => {
            auth.innerHTML = LOGIN_FORM;
            window.localStorage.removeItem('auth');
            const loginForm = document.getElementsByClassName('login-form')[0];
            loginForm.style.display = 'none';
          });
        });
        // handle submit
      });
    });
  } else {
    auth.innerHTML = `<button type="button" id="logout" aria-label="Login">
            <span>Sign out</span>
          </button>`;
    const logoutButton = auth.children[0];
    logoutButton.addEventListener('click', () => {
      window.localStorage.removeItem('auth');
      location.reload();
    });
  }

  nav.append(auth);

  const navWrapper = document.createElement('div');
  const navWarning = document.createElement('div');
  const topNav = document.createElement('div');
  const mainNav = document.createElement('div');
  const mainNavContainer = document.createElement('div');
  const utilsNav = document.createElement('div');

  navWrapper.className = 'nav-wrapper';
  navWarning.className = 'nav-warning';
  topNav.className ='nav-header';
  mainNav.className ='nav-main';
  mainNavContainer.className ='nav-container';
  utilsNav.className = 'nav-utils';

  navWarning.innerHTML = '<div class="yellow-bar"></div><div class="warning-message"><span class="warning-icon"></span><div class="warning-text"><span>Mail delays expected as Canada Post service resumes. If you receive printed statements for your account(s) in the mail, there may still be a delay in their delivery.</span> <span><a href="#">Learn how you can avoid this interruption.</a></span></div></div>';
  topNav.innerHTML = '<nav aria-label="Banking"><div class="primary-nav"><ul id="header-lob" class="primary-nav-list active-loc"><li class="personal-banking active-loc"><a href="https://www.rbcroyalbank.com/personal.html" id="header-personal-banking" data-loc-id="personal-banking">Personal</a></li><li class="business-banking"><a href="https://www.rbcroyalbank.com/business/index.html" id="header-business-banking" data-loc-id="business-banking">Business</a></li><li class="wealth"><a href="https://www.rbcwealthmanagement.com/" id="header-wealth" data-loc-id="wealth">Wealth</a></li><li class="dropdown-overlay right institutional"><a href="https://www.rbcwealthmanagement.com/" id="header-wealth" data-loc-id="wealth">Institutional</a></li><li class="about-rbc"><a href="https://www.rbc.com/canada.html" id="header-about-rbc" data-loc-id="about-rbc">About RBC</a></li></ul></div><div class="secondary-nav"></div></div></nav>';
  utilsNav.innerHTML = '<div class="header-content"><div class="search-trigger mousedown" aria-label="Open search dialog" role="button" tabindex="0"><span class="search-text"><img src="https://www.rbcroyalbank.com/dvl/v1.0/assets/images/icons/icon-search-inverse.svg" alt=""><span>Search RBC...</span></span></div><div class="global-nav"><div class="global-nav-item contact"><a href="#" class="standalone-link">Contact Us</a></div><div class="global-nav-item dropdown-overlay right language"><div class="dropdown-text" role="button" tabindex="0" aria-expanded="false" aria-controls="content-language" aria-label="Select language">(EN)</div></div><div class="global-nav-item secure-btn"><a href="#" class="btn secondary fl-r" role="button" aria-label="Sign in to R B C Online Banking">Sign In</a></div></div></div>';

  navWrapper.append(navWarning);
  navWrapper.append(topNav);
  navWrapper.append(mainNav);

  mainNav.append(mainNavContainer);
  mainNavContainer.appendChild(nav.querySelector('picture'));
  mainNavContainer.append(utilsNav);
  mainNavContainer.append(nav);
  block.append(navWrapper);
}
