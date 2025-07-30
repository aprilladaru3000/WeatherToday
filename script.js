/*SEARCH BY USING A CITY NAME (e.g. athens) OR A COMMA-SEPARATED CITY NAME ALONG WITH THE COUNTRY CODE (e.g. athens,gr)*/
const form = document.querySelector("form");
const input = document.querySelector("#searchInput");
const msg = document.querySelector(".msg");
const list = document.querySelector("#citiesList");
const clearBtn = document.getElementById("clearBtn");
const suggestions = document.getElementById("suggestions");
const favoritesContainer = document.getElementById("favorites");
const body = document.getElementById("body");

/*SUBSCRIBE HERE FOR API KEY: https://home.openweathermap.org/users/sign_up*/
const apiKey = "9cf5a2cda588279529a36d4d6df4a2ff";

// Popular cities for search suggestions
const popularCities = [
    "London,UK", "New York,US", "Tokyo,JP", "Paris,FR", "Sydney,AU",
    "Berlin,DE", "Rome,IT", "Madrid,ES", "Amsterdam,NL", "Vienna,AT",
    "Bangkok,TH", "Singapore,SG", "Dubai,AE", "Mumbai,IN", "Beijing,CN",
    "Seoul,KR", "Mexico City,MX", "São Paulo,BR", "Cairo,EG", "Istanbul,TR"
];

// Favorites management
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];

// Initialize the app
function init() {
    loadFavorites();
    setupDragAndDrop();
    setupSearchSuggestions();
}

// Favorites functionality
function loadFavorites() {
    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<div class="text-white/70 text-center w-full">No favorite cities yet. Search for a city and click the star to add it to favorites!</div>';
        return;
    }
    
    favoritesContainer.innerHTML = '';
    favorites.forEach(city => {
        const favoriteBtn = document.createElement('button');
        favoriteBtn.className = 'bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-white hover:bg-white/30 transition-all duration-300 flex items-center gap-2';
        favoriteBtn.innerHTML = `
            <span>⭐</span>
            <span>${city}</span>
            <button class="ml-2 text-red-300 hover:text-red-100" onclick="removeFavorite('${city}')">×</button>
        `;
        favoriteBtn.onclick = () => searchCity(city);
        favoritesContainer.appendChild(favoriteBtn);
    });
}

function addToFavorites(cityName) {
    if (!favorites.includes(cityName)) {
        favorites.push(cityName);
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        loadFavorites();
    }
}

function removeFavorite(cityName) {
    favorites = favorites.filter(city => city !== cityName);
    localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
    loadFavorites();
}

// Dynamic backgrounds based on weather
function updateBackground(weatherMain) {
    const weatherMap = {
        'Clear': 'bg-clear',
        'Clouds': 'bg-cloudy',
        'Rain': 'bg-rainy',
        'Drizzle': 'bg-rainy',
        'Thunderstorm': 'bg-rainy',
        'Snow': 'bg-snowy',
        'Mist': 'bg-cloudy',
        'Smoke': 'bg-cloudy',
        'Haze': 'bg-cloudy',
        'Dust': 'bg-cloudy',
        'Fog': 'bg-cloudy',
        'Sand': 'bg-cloudy',
        'Ash': 'bg-cloudy',
        'Squall': 'bg-rainy',
        'Tornado': 'bg-rainy'
    };
    
    const bgClass = weatherMap[weatherMain] || 'bg-clear';
    body.className = `min-h-screen ${bgClass} relative overflow-hidden transition-all duration-1000`;
}

// Search suggestions
function setupSearchSuggestions() {
    input.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        if (value.length < 2) {
            suggestions.classList.add('hidden');
            return;
        }
        
        const filtered = popularCities.filter(city => 
            city.toLowerCase().includes(value)
        );
        
        if (filtered.length > 0) {
            suggestions.innerHTML = filtered.map(city => 
                `<div class="suggestion-item" onclick="selectSuggestion('${city}')">${city}</div>`
            ).join('');
            suggestions.classList.remove('hidden');
        } else {
            suggestions.classList.add('hidden');
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.classList.add('hidden');
        }
    });
}

function selectSuggestion(city) {
    input.value = city;
    suggestions.classList.add('hidden');
    searchCity(city);
}

// Drag and drop functionality
function setupDragAndDrop() {
    let draggedElement = null;
    
    list.addEventListener('dragstart', (e) => {
        if (e.target.closest('.city-card')) {
            draggedElement = e.target.closest('.city-card');
            e.target.closest('.city-card').classList.add('dragging');
        }
    });
    
    list.addEventListener('dragend', (e) => {
        if (e.target.closest('.city-card')) {
            e.target.closest('.city-card').classList.remove('dragging');
        }
    });
    
    list.addEventListener('dragover', (e) => {
        e.preventDefault();
        const card = e.target.closest('.city-card');
        if (card && draggedElement && card !== draggedElement) {
            const rect = card.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            
            if (e.clientY < midY) {
                card.parentNode.insertBefore(draggedElement, card);
            } else {
                card.parentNode.insertBefore(draggedElement, card.nextSibling);
            }
        }
    });
}

// Clear button functionality
clearBtn.addEventListener("click", () => {
    list.innerHTML = "";
    msg.textContent = "";
    input.focus();
    body.className = "min-h-screen bg-gradient-to-br from-sky-400 via-blue-400 to-sky-500 relative overflow-hidden transition-all duration-1000";
});

// Search city function
function searchCity(inputVal) {
    //check if there's already a city
    const listItems = list.querySelectorAll(".city");
    const listItemsArray = Array.from(listItems);

    if (listItemsArray.length > 0) {
        const filteredArray = listItemsArray.filter(el => {
            let content = "";
            //athens,gr
            if (inputVal.includes(",")) {
                //athens,grrrrrr->invalid country code, so we keep only the first part of inputVal
                if (inputVal.split(",")[1].length > 2) {
                    inputVal = inputVal.split(",")[0];
                    content = el
                        .querySelector(".city-name span")
                        .textContent.toLowerCase();
                } else {
                    content = el.querySelector(".city-name").dataset.name.toLowerCase();
                }
            } else {
                //athens
                content = el.querySelector(".city-name span").textContent.toLowerCase();
            }
            return content == inputVal.toLowerCase();
        });

        if (filteredArray.length > 0) {
            msg.textContent = `You already know the weather for ${
                filteredArray[0].querySelector(".city-name span").textContent
            } ...otherwise be more specific by providing the country code as well 😉`;
            form.reset();
            input.focus();
            return;
        }
    }

    //ajax here
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const { main, name, sys, weather } = data;
            const icon = `https://openweathermap.org/img/wn/${
                weather[0]["icon"]
            }@2x.png`;

            const li = document.createElement("li");
            li.classList.add("city", "city-card");
            li.draggable = true;
            
            const isFavorite = favorites.includes(`${name},${sys.country}`);
            
            const markup = `
                <div class="bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 transform hover:scale-105 transition-all duration-300">
                    <div class="text-center">
                        <div class="flex justify-between items-start mb-2">
                            <h2 class="city-name text-2xl font-bold text-white" data-name="${name},${sys.country}">
                                <span>${name}</span>
                                <sup class="bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-2 py-1 rounded-full text-xs ml-2">${sys.country}</sup>
                            </h2>
                            <button 
                                class="favorite-btn text-2xl ${isFavorite ? 'text-yellow-400' : 'text-white/50'} hover:text-yellow-300 transition-colors"
                                onclick="toggleFavorite('${name},${sys.country}')"
                            >
                                ${isFavorite ? '⭐' : '☆'}
                            </button>
                        </div>
                        <div class="city-temp text-5xl font-bold text-white mb-4">
                            ${Math.round(main.temp)}<sup class="text-2xl">°C</sup>
                        </div>
                        <figure class="flex flex-col items-center">
                            <img class="city-icon w-20 h-20 mb-2" src="${icon}" alt="${
                weather[0]["description"]
            }">
                            <figcaption class="text-white/90 font-medium text-sm uppercase tracking-wider">${weather[0]["description"]}</figcaption>
                        </figure>
                    </div>
                </div>
            `;
            li.innerHTML = markup;
            list.appendChild(li);
            
            // Update background based on weather
            updateBackground(weather[0].main);
        })
        .catch(() => {
            msg.textContent = "Please search for a valid city 😩";
        });

    msg.textContent = "";
    form.reset();
    input.focus();
}

// Toggle favorite
function toggleFavorite(cityName) {
    if (favorites.includes(cityName)) {
        removeFavorite(cityName);
    } else {
        addToFavorites(cityName);
    }
    
    // Update the star in the card
    const cards = list.querySelectorAll('.city-card');
    cards.forEach(card => {
        const cityData = card.querySelector('.city-name').dataset.name;
        const starBtn = card.querySelector('.favorite-btn');
        if (cityData === cityName) {
            const isFavorite = favorites.includes(cityName);
            starBtn.innerHTML = isFavorite ? '⭐' : '☆';
            starBtn.className = `favorite-btn text-2xl ${isFavorite ? 'text-yellow-400' : 'text-white/50'} hover:text-yellow-300 transition-colors`;
        }
    });
}

form.addEventListener("submit", e => {
    e.preventDefault();
    searchCity(input.value);
});

// Initialize the app
init();
