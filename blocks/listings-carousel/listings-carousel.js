import { getAEMPublish } from '../../scripts/endpointconfig.js';

/**
 * Listings Carousel Block
 * Displays real estate listings in a carousel format
 */

export default async function decorate(block) {
  const props = [...block.children];
  const title = props[0]?.textContent.trim() || 'Featured Listings';
  const tag = props[1]?.textContent.trim() || 'listings';
  const cachebuster = Math.floor(Math.random() * 1000);
  
  const aempublishurl = getAEMPublish();
  const url = `${aempublishurl}/graphql/execute.json/securbank/ListingsByTag;tag=${tag}?ts=${cachebuster}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const listings = data.data?.listingList?.items || [];
    
    if (listings.length === 0) {
      block.innerHTML = '<p>No listings found.</p>';
      return;
    }
    
    // Create carousel structure
    const carousel = document.createElement('div');
    carousel.classList.add('listings-carousel');
    
    // Add title
    const titleElement = document.createElement('h2');
    titleElement.classList.add('carousel-title');
    titleElement.textContent = title;
    carousel.appendChild(titleElement);
    
    // Create carousel container
    const carouselContainer = document.createElement('div');
    carouselContainer.classList.add('carousel-container');
    
    // Create carousel track
    const carouselTrack = document.createElement('div');
    carouselTrack.classList.add('carousel-track');
    
    // Generate listing cards
    listings.forEach((listing) => {
      const card = document.createElement('div');
      card.classList.add('carousel-item', 'listing-card');
      
      const imageUrl = listing.image?._publishUrl || listing.image?._dynamicUrl || '';
      const formattedRent = new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD'
      }).format(listing.monthlyRent);
      
      card.innerHTML = `
        <div class="listing-image">
          ${imageUrl ? `<img src="${imageUrl}" alt="${listing.title}" loading="lazy">` : ''}
        </div>
        <div class="listing-content">
          <h3 class="listing-title">${listing.title}</h3>
          <p class="listing-address">${listing.address}</p>
          <div class="listing-details">
            <span class="bedrooms">${listing.bedrooms} bed</span>
            <span class="bathrooms">${listing.bathrooms} bath</span>
            <span class="rent">${formattedRent}/month</span>
          </div>
          <div class="listing-description">
            ${listing.description?.html || listing.description?.plaintext || ''}
          </div>
        </div>
      `;
      
      carouselTrack.appendChild(card);
    });
    
    carouselContainer.appendChild(carouselTrack);
    carousel.appendChild(carouselContainer);
    
    // Add navigation buttons
    const navigation = document.createElement('div');
    navigation.classList.add('carousel-nav');
    navigation.innerHTML = `
      <button class="carousel-prev" aria-label="Previous listing">‹</button>
      <button class="carousel-next" aria-label="Next listing">›</button>
    `;
    carousel.appendChild(navigation);
    
    // Clear block and add carousel
    block.textContent = '';
    block.appendChild(carousel);
    
    // Initialize carousel functionality
    initializeCarousel(carousel);
    
  } catch (error) {
    console.error('Error loading listings:', error);
    block.innerHTML = '<p>Error loading listings. Please try again later.</p>';
  }
}

function initializeCarousel(carousel) {
  const track = carousel.querySelector('.carousel-track');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const items = carousel.querySelectorAll('.carousel-item');
  
  let currentIndex = 0;
  const itemWidth = 100 / 3; // Show 3 items at a time
  
  function updateCarousel() {
    const translateX = -currentIndex * itemWidth;
    track.style.transform = `translateX(${translateX}%)`;
    
    // Update button states
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= items.length - 3;
  }
  
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    if (currentIndex < items.length - 3) {
      currentIndex++;
      updateCarousel();
    }
  });
  
  // Initialize
  updateCarousel();
} 