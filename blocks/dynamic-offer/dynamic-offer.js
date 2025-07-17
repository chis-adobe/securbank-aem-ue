/**
 * Dynamic Offer Block
 * Prompts user for cost and APR values and generates a dynamic image URL
 */

export default async function decorate(block) {
  const props = [...block.children];
  const eventName = props[0]?.textContent?.trim() || 'Black Friday Event';
  const cost = props[1]?.textContent?.trim();
  const apr = props[2]?.textContent?.trim();
  const hideBlackGalaxy = props[3]?.textContent?.includes('true');
  const hideWhiteGalaxy = props[4]?.textContent?.includes('true');

  if (!cost || !apr) {
    block.innerHTML = '<p class="error-message">Please provide both cost and APR values in the block configuration.</p>';
    return;
  }

  // Generate the dynamic URL
  const baseUrl = 'https://smartimaging.scene7.com/is/image/DynamicMediaNA/Offer-1';
  const hideBlackGalaxyValue = hideBlackGalaxy ? '1' : '0';
  const hideWhiteGalaxyValue = hideWhiteGalaxy ? '1' : '0';
  
  const params = new URLSearchParams({
    '$hideBlackGalaxy': hideBlackGalaxyValue,
    '$eventName': eventName,
    '$cost': cost,
    '$aprCost': apr,
    '$hideWhiteGalaxy': hideWhiteGalaxyValue,
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
    </div>
  `;
} 