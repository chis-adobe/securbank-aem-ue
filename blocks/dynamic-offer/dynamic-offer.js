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
  const customParamsJson = props[5]?.textContent?.trim();

  if (!cost || !apr) {
    block.innerHTML = '<p class="error-message">Please provide both cost and APR values in the block configuration.</p>';
    return;
  }

  // Parse custom parameters if provided
  let customParams = {};
  if (customParamsJson) {
    try {
      customParams = JSON.parse(customParamsJson);
    } catch (error) {
      console.error('Error parsing custom parameters JSON:', error);
    }
  }

  // Calculate each parameter value with custom params taking precedence
  const hideBlackGalaxyValue = customParams['$hideBlackGalaxy'] !== undefined ? customParams['$hideBlackGalaxy'] : (hideBlackGalaxy ? '1' : '0');
  const eventNameValue = customParams['$eventName'] !== undefined ? customParams['$eventName'] : eventName;
  const costValue = customParams['$cost'] !== undefined ? customParams['$cost'] : cost;
  const aprValue = customParams['$aprCost'] !== undefined ? customParams['$aprCost'] : apr;
  const hideWhiteGalaxyValue = customParams['$hideWhiteGalaxy'] !== undefined ? customParams['$hideWhiteGalaxy'] : (hideWhiteGalaxy ? '1' : '0');
  const widthValue = customParams.wid !== undefined ? customParams.wid : '2000';
  const heightValue = customParams.hei !== undefined ? customParams.hei : '2000';
  const qualityValue = customParams.qlt !== undefined ? customParams.qlt : '100';
  const fitValue = customParams.fit !== undefined ? customParams.fit : 'constrain';

  // Build URL manually to preserve $ characters
  const dynamicUrl = `https://smartimaging.scene7.com/is/image/DynamicMediaNA/Offer-1?$hideBlackGalaxy=${hideBlackGalaxyValue}&$eventName=${encodeURIComponent(eventNameValue)}&$cost=${costValue}&$aprCost=${aprValue}&$hideWhiteGalaxy=${hideWhiteGalaxyValue}&wid=${widthValue}&hei=${heightValue}&qlt=${qualityValue}&fit=${fitValue}`;

  // Render the image
  block.innerHTML = `
    <div class="dynamic-offer-block">
      <img src="${dynamicUrl}" alt="Dynamic Offer Image" class="offer-image" loading="lazy">
    </div>
  `;
} 