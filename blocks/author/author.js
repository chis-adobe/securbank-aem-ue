export default async function decorate(block) {
  const props = [...block.children];
  const path = props[0]?.textContent.trim();
  const cachebuster = Math.floor(Math.random() * 1000);

  const main = document.createElement('div');
  main.innerHTML = "Loading Author";

  if(!path) {
    return;
  }

  const url = `https://publish-p130746-e1298459.adobeaemcloud.com/graphql/execute.json/securbank/AuthorByPath;path=${path};variation=main?ts=${cachebuster}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    return;
  }

  const randomDays = Math.floor(Math.random() * 365);

  // Get today's date
  const today = new Date();

  // Subtract the random number of days
  const pastDate = new Date(today);
  pastDate.setDate(today.getDate() - randomDays);

  // Format the date as "Month Day, Year"
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = pastDate.toLocaleDateString('en-US', options);

  const respJson = await resp.json();
  const authorJson = respJson.data.authorByPath.item;

  // Clear main div
  main.innerHTML = "";

  const name = document.createElement('div');

  name.classList.add("author-name");
  name.innerHTML = `<span class="date">${formattedDate}<span>  |  <span class="name">${authorJson.name}</span>`;
  
  main.append(name);

  block.innerHTML = "";
  block.append(main);
}
