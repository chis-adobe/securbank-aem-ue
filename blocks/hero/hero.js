/* eslint-disable no-unused-expressions */
import authenticate from '../../scripts/auth.js';
import { executeCallbacks } from '../../scripts/auth.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { decorateNavAuth } from '../header/header.js';

function decorateAuthenticatedState(parent, user) {
  const USER_INFO = `<div class="dashboard-mini">
      <span class="dashboard-mini-welcome">Welcome back ${user.firstName}!</span>
      <div class="dashboard-mini-account-balance">
        <p class="dashboard-mini-account-balance-value">The Intranet Hub is your gateway to collaboration, insights, and success</p>
      </div>
      <div class=dashboard-mini-quick-actions>
        <span><a href="https://securbank-react.vercel.app/" target="_blank">View your benefits information</a></span>
      </div>
    </div>
  `;
  const miniDashboard = document.createElement('div');
  miniDashboard.classList.add('user-info');
  miniDashboard.innerHTML = USER_INFO;
  parent.append(miniDashboard);
  executeCallbacks(user.company);
}

function decorateUnAuthenticatedState(parent) {
  const FORM = `<form class="login-form">
      <div id="login-message" class="login-form-message">
        <span>Welcome back!</span>
        <p class="error-message" style="display:block"></p>
      </div>
      <div class="login-form-input">
        <div class="login-form-label">
          <span>Username</span>
        </div>
        <div id="login-username">
          <input id="username" type="text" placeholder="e.g. jdoe@adobe.com" />
        </div>
      </div>
      <div class="login-form-input">
        <div class="login-form-label">
          <span>Password</span>
        </div>
        <div id="login-password">
          <input id="password" type="password" placeholder="At least 8 characters" />
        </div>
      </div>
      <div class="login-form-submit">
        <div id="login-submit">
          <input id="login-button" type="submit" value="Log In" />
        </div>
      </div>
      <div class="login-form-forgot-password">
        <span>Forgot user ID or password?</span>
      </div>
    </form>`;

  const loginForm = document.createElement('div');
  loginForm.classList.add('login');
  loginForm.id = 'log-in';
  loginForm.innerHTML = FORM;
  const form = loginForm.firstElementChild;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    authenticate(username, password).then((user) => {
      // console.log(user);
      /* if (user === null) {
        const errorMessage = document.getElementsByClassName('error-message')[0];
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Authentication failed.';
      } else { */
        const errorMessage = document.getElementsByClassName('error-message')[0];
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
        document.getElementById('log-in').remove();
        decorateAuthenticatedState(parent, user);
        decorateNavAuth();
      //}
    });
    // handle submit
  });
  parent.append(loginForm);
}

export default async function decorate(block) {
  let row = block.firstElementChild;
  const bg = row.querySelector('picture');
  block.append(bg);
  row.remove();
  const bgP = block.closest('p');
  if (bgP) bgP.remove();
  row = block.firstElementChild;
  row.classList.add('hero-body');

  const links = block.querySelectorAll('a');
  const dmurlEl = Array.from(links).find(link => link.href.includes("smartimaging.scene7.com"));
  let dmUrl;
  if(dmurlEl) {
    dmUrl = dmurlEl.innerHTML;
    dmurlEl.remove();
  }

  const content = document.getElementsByClassName('hero-body')[0].children[0].children[0].children[0];
  moveInstrumentation(row, content);
  if (block.classList.contains('authbox')) {
    window.localStorage.getItem('auth') === null ? decorateUnAuthenticatedState(row) : decorateAuthenticatedState(row, JSON.parse(window.localStorage.getItem('auth')));
  }

  // Get image
  let imageEl = bg.getElementsByTagName("img")[0];
  if(!imageEl) {
    console.error("Image element not found, ensure it is defined in the dialog");
    return;
  }

  let imageSrc = imageEl.getAttribute("src");
  if(!imageSrc) {
    console.error("Image element source not found, ensure it is defined in the dialog");
    return;
  }

  // Get imageName from imageSrc expected in the format /content/dam/<...>/<imageName>.<extension>
  let imageName = imageSrc.split("/").pop().split(".")[0];

  imageEl.setAttribute("data-src", dmUrl + (dmUrl?.endsWith('/') ? "" : "/") + imageName);
  imageEl.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
  imageEl.setAttribute("data-mode", "smartcrop");

  s7responsiveImage(imageEl);
}
