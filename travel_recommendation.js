// Fetch travel recommendations from the JSON API
let allRecommendations = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
  fetchTravelData();
  setupSearchListeners();
});

// Fetch data from the JSON file
function fetchTravelData() {
  fetch('travel_recommendation_api.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch travel recommendations');
      }
      return response.json();
    })
    .then(data => {
      // Organize all recommendations
      allRecommendations = [];
      
      // Add countries and their cities
      if (data.countries) {
        data.countries.forEach(country => {
          if (country.cities) {
            country.cities.forEach(city => {
              allRecommendations.push({
                type: 'city',
                name: city.name,
                description: city.description,
                imageUrl: city.imageUrl,
                country: country.name
              });
            });
          }
        });
      }
      
      // Add temples
      if (data.temples) {
        data.temples.forEach(temple => {
          allRecommendations.push({
            type: 'temple',
            name: temple.name,
            description: temple.description,
            imageUrl: temple.imageUrl
          });
        });
      }
      
      // Add beaches
      if (data.beaches) {
        data.beaches.forEach(beach => {
          allRecommendations.push({
            type: 'beach',
            name: beach.name,
            description: beach.description,
            imageUrl: beach.imageUrl
          });
        });
      }
      
      console.log('Travel recommendations loaded:', allRecommendations);
    })
    .catch(error => {
      console.error('Error fetching travel data:', error);
      alert('Failed to load travel recommendations. Please try again.');
    });
}

// Setup search listeners
function setupSearchListeners() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const resetBtn = document.getElementById('resetBtn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetSearch);
  }
}

// Perform search
function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchQuery = searchInput.value.trim().toLowerCase();
  
  if (searchQuery === '') {
    alert('Please enter a destination or keyword to search');
    return;
  }
  
  // Define keyword variations for different categories
  const beachKeywords = ['beach', 'beaches', 'seaside', 'coast', 'coastal', 'shore', 'island', 'islands'];
  const templeKeywords = ['temple', 'temples', 'monument', 'monuments', 'shrine', 'shrines', 'historic', 'heritage', 'archaeological'];
  const countryKeywords = {
    'australia': ['australia', 'aussie', 'australian'],
    'japan': ['japan', 'japanese'],
    'brazil': ['brazil', 'brazilian'],
    'cambodia': ['cambodia', 'cambodian', 'angkor'],
    'india': ['india', 'indian'],
    'french polynesia': ['polynesia', 'french polynesia', 'bora bora', 'borabora']
  };
  
  let results = [];
  
  // Check if search query matches beach keywords
  const isBeachSearch = beachKeywords.some(keyword => searchQuery.includes(keyword));
  
  // Check if search query matches temple keywords
  const isTempleSearch = templeKeywords.some(keyword => searchQuery.includes(keyword));
  
  // Check if search query matches country keywords
  let matchedCountry = null;
  for (let country in countryKeywords) {
    if (countryKeywords[country].some(keyword => searchQuery.includes(keyword))) {
      matchedCountry = country;
      break;
    }
  }
  
  // Filter recommendations based on keyword categories
  results = allRecommendations.filter(recommendation => {
    const nameMatch = recommendation.name.toLowerCase().includes(searchQuery);
    const descriptionMatch = recommendation.description.toLowerCase().includes(searchQuery);
    const countryMatch = recommendation.country && recommendation.country.toLowerCase().includes(searchQuery);
    
    // Check for beach results
    if (isBeachSearch && recommendation.type === 'beach') {
      return true;
    }
    
    // Check for temple results
    if (isTempleSearch && recommendation.type === 'temple') {
      return true;
    }
    
    // Check for country results
    if (matchedCountry && recommendation.country && recommendation.country.toLowerCase() === matchedCountry) {
      return true;
    }
    
    // Direct name or description match
    if (nameMatch || descriptionMatch || countryMatch) {
      return true;
    }
    
    return false;
  });
  
  // Display results
  displaySearchResults(results, searchQuery);
}

// Display search results
function displaySearchResults(results, searchQuery) {
  // Create or get results container
  let resultsContainer = document.getElementById('searchResults');
  
  if (!resultsContainer) {
    resultsContainer = document.createElement('section');
    resultsContainer.id = 'searchResults';
    resultsContainer.className = 'search-results';
    document.body.appendChild(resultsContainer);
  }
  
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="results-container">
        <div class="no-results">
          <h2>No Results Found</h2>
          <p>No destinations found matching "${searchQuery}". Please try another search with keywords like: beach, temple, country names (Australia, Japan, Brazil), or specific destinations.</p>
        </div>
      </div>
    `;
  } else {
    // Sort results to show at least 2 of each type if available
    const beachResults = results.filter(r => r.type === 'beach').slice(0, 2);
    const templeResults = results.filter(r => r.type === 'temple').slice(0, 2);
    const cityResults = results.filter(r => r.type === 'city').slice(0, 2);
    
    let resultsHTML = `
      <div class="results-container">
        <h2>Search Results for "${searchQuery}"</h2>
        <p class="results-count">Found ${results.length} destination(s)</p>
        <div class="results-wrapper">
    `;
    
    // Display beach results
    if (beachResults.length > 0) {
      beachResults.forEach(result => {
        resultsHTML += createResultCard(result);
      });
    }
    
    // Display temple results
    if (templeResults.length > 0) {
      templeResults.forEach(result => {
        resultsHTML += createResultCard(result);
      });
    }
    
    // Display city results
    if (cityResults.length > 0) {
      cityResults.forEach(result => {
        resultsHTML += createResultCard(result);
      });
    }
    
    // If no specific category results but general search matches
    if (beachResults.length === 0 && templeResults.length === 0 && cityResults.length === 0) {
      results.slice(0, 6).forEach(result => {
        resultsHTML += createResultCard(result);
      });
    }
    
    resultsHTML += `
        </div>
      </div>
    `;
    
    resultsContainer.innerHTML = resultsHTML;
  }
  
  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Create a result card
function createResultCard(result) {
  return `
    <div class="result-card">
      <div class="result-image">
        <img src="${result.imageUrl}" alt="${result.name}" onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(result.name)}'">
      </div>
      <div class="result-content">
        <h3>${result.name}</h3>
        <p class="result-type">${result.type.charAt(0).toUpperCase() + result.type.slice(1)}${result.country ? ' • ' + result.country : ''}</p>
        <p class="result-description">${result.description}</p>
        <button class="visit-btn" onclick="alert('Explore ${result.name} - More details coming soon!')">Visit</button>
      </div>
    </div>
  `;
}

// Reset search
function resetSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  
  const resultsContainer = document.getElementById('searchResults');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
}


const styleSheet = document.createElement('style');
styleSheet.textContent = `
  #searchResults {
    padding: 4rem 2rem;
    background: linear-gradient(135deg, #f5f5f5 0%, #e8f4f8 100%);
    margin-top: 0;
  }
  
  .results-container {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .results-container h2 {
    font-size: 2rem;
    color: #1a5f6b;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  
  .results-count {
    font-size: 1rem;
    color: #666;
    margin-bottom: 2rem;
  }
  
  .no-results {
    text-align: center;
    padding: 3rem 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  
  .no-results h2 {
    color: #1a5f6b;
    margin-bottom: 1rem;
  }
  
  .no-results p {
    color: #666;
    font-size: 1.1rem;
    line-height: 1.6;
  }
  
  .results-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 2.5rem;
  }
  
  .result-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    display: flex;
    flex-direction: column;
  }
  
  .result-card:hover {
    transform: translateY(-12px);
    box-shadow: 0 12px 35px rgba(61, 217, 199, 0.25);
  }
  
  .result-image {
    width: 100%;
    height: 280px;
    overflow: hidden;
    background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
    position: relative;
  }
  
  .result-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  
  .result-card:hover .result-image img {
    transform: scale(1.08);
  }
  
  .result-content {
    padding: 2rem 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  
  .result-content h3 {
    font-size: 1.4rem;
    color: #1a5f6b;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  
  .result-type {
    font-size: 0.85rem;
    color: #3dd9c7;
    font-weight: 700;
    margin-bottom: 1rem;
    text-transform: capitalize;
    letter-spacing: 0.5px;
  }
  
  .result-description {
    font-size: 0.95rem;
    color: #666;
    line-height: 1.7;
    margin-bottom: 1.5rem;
    flex-grow: 1;
  }
  
  .visit-btn {
    background: linear-gradient(135deg, #1a5f6b 0%, #0d3d47 100%);
    color: white;
    border: none;
    padding: 0.8rem 1.8rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    align-self: flex-start;
  }
  
  .visit-btn:hover {
    background: linear-gradient(135deg, #3dd9c7 0%, #2bc1af 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(61, 217, 199, 0.4);
  }
  
  .visit-btn:active {
    transform: translateY(0);
  }
  
  @media (max-width: 1024px) {
    .results-wrapper {
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }
    
    .result-image {
      height: 240px;
    }
  }
  
  @media (max-width: 768px) {
    #searchResults {
      padding: 2rem 1rem;
    }
    
    .results-container h2 {
      font-size: 1.6rem;
    }
    
    .results-wrapper {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    
    .result-card {
      border-radius: 8px;
    }
    
    .result-image {
      height: 250px;
    }
    
    .result-content {
      padding: 1.5rem;
    }
    
    .result-content h3 {
      font-size: 1.2rem;
    }
  }
`;
document.head.appendChild(styleSheet);
