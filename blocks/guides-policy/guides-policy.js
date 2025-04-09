export default async function decorate(block) {
  const props = [...block.children];
  const path = props[0]?.textContent.trim();
  const cachebuster = Math.floor(Math.random() * 1000);

  const main = document.createElement('div');
  main.innerHTML = "Loading Policy";

  const url = path ? `https://author-p130746-e1298459.adobeaemcloud.com/graphql/execute.json/CF-from-Guides/guidesCfByPath;path=${path};variation=main?ts=${cachebuster}`
                : `https://author-p130746-e1298459.adobeaemcloud.com/graphql/execute.json/CF-from-Guides/guidesCF?ts=${cachebuster}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    return;
  }

  const respJson = await resp.json();
  const policyJson = path ? respJson.data.cfFromAemGuidesByPath.item : respJson.data.cfFromAemGuidesList.items[0];

  // Clear main div
  main.innerHTML = "";
  
  const title = document.createElement('div');
  const descriptionDiv = document.createElement('div');
  const topics = document.createElement('div');

  title.classList.add("header");
  descriptionDiv.classList.add("description");
  topics.classList.add("topics");

  title.innerHTML = policyJson.title;
  descriptionDiv.append(policyJson.shortdesc.html);
  topics.append(policyJson.topicData.html);

  main.append(title);
  main.append(descriptionDiv);
  main.append(topics);

  main.classList.add("guides-policy-container");

  block.closest('.guides-policy-wrapper').classList.add(path ? "single" : "list");
  block.innerHTML = "";
  block.append(main);
}
