/**
 * Dynamic Offer Block
 * Prompts user for cost and APR values and generates a dynamic image URL
 */

export default async function decorate(block) {
  const props = [...block.children];
  const eventName = props[0]?.textContent?.trim() || 'Black Friday Event';
  const cost = props[1]?.textContent?.trim();
  const apr = props[2]?.textContent?.trim();
  const hideBlackGalaxy = props[3]?.textContent?.trim() === 'true';
  const hideWhiteGalaxy = props[4]?.textContent?.trim() === 'true';

  if (!cost || !apr) {
    block.innerHTML = '<p class="error-message">Please provide both cost and APR values in the block configuration.</p>';
    return;
  }

  // Generate the dynamic URL
  const baseUrl = 'https://smartimaging.scene7.com/is/image/DynamicMediaNA/Offer-1';
  const params = new URLSearchParams({
    '$hideBlackGalaxy': hideBlackGalaxy ? '1' : '0',
    '$eventName': eventName,
    '$cost': cost,
    '$aprCost': apr,
    '$hideWhiteGalaxy': hideWhiteGalaxy ? '1' : '0',
    'wid': '2000',
    'hei': '2000',
    'qlt': '100',
    'fit': 'constrain'
  });

  const dynamicUrl = `${baseUrl}?${params.toString()}`;

  // Render the image
  block.innerHTML = `
    <div class="dynamic-offer-block">
      <img src="${dynamicUrl}" alt="Dynamic Offer Image" class="offer-image" loading="lazy">
      <div class="offer-details">
        <p><strong>Event:</strong> ${eventName}</p>
        <p><strong>Cost:</strong> $${parseFloat(cost).toLocaleString()}</p>
        <p><strong>APR:</strong> ${parseFloat(apr).toFixed(2)}%</p>
        <p><strong>Hide Black Galaxy:</strong> ${hideBlackGalaxy ? 'Yes' : 'No'}</p>
        <p><strong>Hide White Galaxy:</strong> ${hideWhiteGalaxy ? 'Yes' : 'No'}</p>
      </div>
    </div>
  `;
} 