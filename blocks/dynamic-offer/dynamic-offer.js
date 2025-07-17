/**
 * Dynamic Offer Block
 * Prompts user for cost and APR values and generates a dynamic image URL
 */

export default async function decorate(block) {
  // Get model values from block dataset or config
  const cost = block.dataset.cost || block.querySelector('[data-name="cost"]')?.textContent?.trim();
  const apr = block.dataset.apr || block.querySelector('[data-name="apr"]')?.textContent?.trim();

  if (!cost || !apr) {
    block.innerHTML = '<p class="error-message">Please provide both cost and APR values in the block configuration.</p>';
    return;
  }

  // Generate the dynamic URL
  const baseUrl = 'https://smartimaging.scene7.com/is/image/DynamicMediaNA/Offer-1';
  const params = new URLSearchParams({
    '$hideBlackGalaxy': '0',
    '$eventName': 'Black Friday Event',
    '$cost': cost,
    '$aprCost': apr,
    '$hideWhiteGalaxy': '0',
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
        <p><strong>Cost:</strong> $${parseFloat(cost).toLocaleString()}</p>
        <p><strong>APR:</strong> ${parseFloat(apr).toFixed(2)}%</p>
      </div>
    </div>
  `;
} 