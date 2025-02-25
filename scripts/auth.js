import { fetchLogins } from '../../scripts/aem.js';

let authCallbacks = [];

export function addCallback(callback, block) {
  authCallbacks.push({
    callback: callback,
    block: block
  });
}

export async function executeCallbacks(company) {
  while (authCallbacks.length) {
    const callback = authCallbacks.shift(); // Remove & execute one by one
    callback.callback(callback.block, company);
  }
}

export async function validateAuth() {
  const { token } = JSON.parse(window.localStorage.getItem('auth'));
  const options = {
    method: 'post',
    body: JSON.stringify({
      token,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch('https://28538-authfake.adobeio-static.net/api/v1/web/FakeAuth/verify', options);
  const userInfo = await response.json();
  return userInfo;
}

export default async function authenticate(username, password) {
  const options = {
    method: 'post',
    body: JSON.stringify({
      identifier: username,
      password,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const response = await fetch('https://28538-authfake.adobeio-static.net/api/v1/web/FakeAuth/generic', options);
  if (!response.ok) {
    const loginsResponse = await fetchLogins('');

    return authenticateDefaultUser(loginsResponse, username);
  } else {
    const userInfo = await response.json();
    window.localStorage.setItem('auth', JSON.stringify(userInfo));
    return userInfo;
  }

  return null;
}

function authenticateDefaultUser(loginUsers, username) {
  // Check if loginUsers is a non empty json object
  const defaultUsers = typeof loginUsers === "object" &&
                          loginUsers !== null &&
                          !Array.isArray(loginUsers) &&
                          Object.keys(loginUsers).length > 0
                        ? loginUsers :

  // Set defaultUsers to hardcoded value otherwise
  {
    "julia.dobbs@mackenzieinvestments.com": {
      firstName: "Julia",
      lastName: "Dobbs",
      company: "igm:ig",
      email: "julia.dobbs@mackenzieinvestments.com"
    },
    "adam.kozeus@igmfinancial.com": {
      firstName: "Adam",
      lastName: "Kozeus",
      company: "igm:ig",
      email: "adam.kozeus@igmfinancial.com"
    }
  }

  return defaultUsers[username];
}
