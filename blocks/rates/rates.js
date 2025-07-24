export default async function decorate(block) {
  const props = [...block.children];
  const path = props[0]?.textContent.trim();
  const highlightIndex = Number(props[2]?.textContent.trim());
  const cachebuster = Math.floor(Math.random() * 1000);

  const main = document.createElement('div');
  main.innerHTML = "Loading Rates";

  const url = path ? `https://publish-p130746-e1298459.adobeaemcloud.com/graphql/execute.json/securbank/AccountRateByPath;path=${path};variation=main?ts=${cachebuster}`
                : `https://publish-p130746-e1298459.adobeaemcloud.com/graphql/execute.json/securbank/AccountRatesList?ts=${cachebuster}`;

  const resp = await fetch(url);
  if (!resp.ok) {
    return;
  }

  const respJson = await resp.json();
  const accountsJson = path ? [respJson.data.accountRatesByPath.item] : respJson.data.accountRatesList.items;

  // Clear main div
  main.innerHTML = "";

  accountsJson.forEach(function (account) {
    const accountDiv = document.createElement('div');
    const header = document.createElement('div');
    const rows = document.createElement('div');

    header.classList.add("header");
    rows.classList.add("rate-list");

    if(!path) {
      header.addEventListener('click', function() {
        this.parentNode.classList.toggle("open");
      });

      const headerRow = document.createElement('div');
      headerRow.innerHTML = '<span class="rate">Rate</span><span class="product">Product</span>';
      rows.append(headerRow);
    }

    header.innerHTML = account.accountName;
    accountDiv.append(header);
    accountDiv.append(rows);

    account.rates.forEach(function(rate, index) {
      const rateDiv = document.createElement('div');

      if(highlightIndex == index) {
        rateDiv.classList.add("highlight");
      }

      rateDiv.innerHTML = `<span class="rate">${rate.rate.toFixed(2)}%</span><span class="product">${rate.accountType}</span>`;
      rows.append(rateDiv);
    });

    main.append(accountDiv);
  });

  main.classList.add("rates-container");

  block.closest('.rates-wrapper').classList.add(path ? "single" : "list");
  block.innerHTML = "";
  block.append(main);
}
