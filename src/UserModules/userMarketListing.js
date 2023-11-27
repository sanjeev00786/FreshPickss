import { auth, db, getDocs, collection } from '../../helperClasses/firestoreService.js';
import { filterMarketData } from './userSearchFilter.js';
import { displayCards } from './marketCardRender.js';
import { moveSliderValue, formatDate } from '../../helperClasses/FilterUtils.js';
const apiKey = "AIzaSyC78YWX15M8UW4ECURpuG-Ro9SVKllrhXY";
let currentOpenInfoWindow = null
const popSound = document.getElementById('popupSound')
let selectedDate = null;
let selectedCategories;
const distanceSelect = moveSliderValue();
let selectedOption = null; 
let selectedCheckboxLabels = []; 

// Default filters
const defaultFilters = {
    category: ["1"],
    distance: 5,
    date: ""
};

let userFilters;

function updateFilterCount(filterCount) {
    const filterCountElement = document.querySelector('.filter-count');
    filterCountElement.textContent = filterCount.toString();
    filterCountElement.classList.toggle('hide-count', filterCount === 0);
    sessionStorage.setItem('filterCount', filterCount.toString());
}


function getCurrentDate() {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
}


function applyStyleToSelectedOption(optionId) {
    if (selectedOption) {
        selectedOption.style.backgroundColor = '#FFFFFF';
        selectedOption.style.color = '';

        const svg = selectedOption.querySelector('.date-svg'); 
        svg.src = '../../assets/add.svg';
        svg.style.fill = 'inherit';
    }

    const newSelectedOption = document.getElementById(optionId);

    if (newSelectedOption) {
        newSelectedOption.style.backgroundColor = '#487556';
        newSelectedOption.style.color = 'white';

        const svg = newSelectedOption.querySelector('.date-svg'); 
        svg.src = '../../assets/added.svg';
        svg.style.fill = 'inherit';

        selectedOption = newSelectedOption; 
    }
}
function setupDateOptions() {
    const dateOptions = document.getElementById('dateOptions');
    const n = 4;


    for (let i = 0; i < n; i++) {
        const today = new Date();
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const formattedDate = formatDate(date);

        const dateLabel = document.createElement('label');
        dateLabel.classList.add('date-label');
        dateLabel.id = `dateOption${i + 1}`;
        dateLabel.innerHTML = `
        <input class="date-input" type="radio" name="date" value="${formattedDate}">
        ${formattedDate}
      `;

        const dateSvg = document.createElement("img");
        dateSvg.className = "date-svg";
        dateSvg.src = "../../assets/add.svg";
        dateSvg.alt = "Date SVG";

        dateLabel.appendChild(dateSvg);
        dateOptions.appendChild(dateLabel);

        dateLabel.addEventListener('click', () => {
            applyStyleToSelectedOption(dateLabel.id);
            selectedDate = formattedDate;
        });
    }
}

// Call the setupDateOptions function to set up the date options
setupDateOptions();



function displayNearbyLocations(filteredMarkets) {
    filteredMarkets.forEach((market) => {
        let marker = new google.maps.Marker({
            position: { lat: market.location.lat, lng: market.location.lng },
            map: map,
            title: market.marketName,
            icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        });

        const infoContent = document.createElement('div');
        infoContent.className = 'info-window-content';
        infoContent.style.maxWidth = '300px'; 
        let mymarketimage = market.media.find(item => item.type === "img").file;

        infoContent.innerHTML = `
        <div style="position: relative;">
          <img src="${mymarketimage}" alt="${market.location.name}" style="width: 300px; height: 150px; border-top-left-radius: 8px; border-top-right-radius: 8px;"/>
        </div>
        <div style="background: white; padding: 10px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          <div style="font-weight: bold; margin-bottom: 5px;">${market.marketName}</div>
          <span style="color: green;">${market.location.name}</span>
          <div style="margin-bottom: 5px;">
            <span style="color: #FFD700;">★</span> 4
          </div>
          <div style="display: flex; justify-content: space-between;">
            <button id="direction-${marketID}" class="get-directions" style="background-color: #E0E0E0; padding: 8px; border-radius: 4px; border: none; cursor: pointer;">
            <img src="../../assets/direction.png" alt="Share" style="width: 30px; height: 30px;">
            </button>
            <button id="share-${marketID}" class="share-location" style= "background-color: #E0E0E0; "padding: 8px; border-radius: 4px; border: none; cursor: pointer;">
            <img src="../../assets/share.png" alt="Share" style="width: 25px; height: 25px;">
            </button>
          </div>
        </div>`;

        const infoWindow = new google.maps.InfoWindow({
            content: infoContent
        });

        marker.addListener('click', () => {
            if (currentOpenInfoWindow) {
                currentOpenInfoWindow.close();
            }
            infoWindow.open(map, marker);
            currentOpenInfoWindow = infoWindow;
            popSound.play();
            setTimeout(() => addDirectionListener(marketID, market.location.lat, market.location.lng), 0);
            setTimeout(() => infoContent.classList.add('show'), 10);
        });


    });
}



function addDirectionListener(id, lat, lng) {
    const button = document.getElementById(`direction-${id}`);
    if (button) {
        button.addEventListener('click', () => {
            getDirections(lat, lng);
        });
    }
}

function getDirections(lat, lng) {
    const directionUrl = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${lat},${lng}`;
    window.open(directionUrl, '_blank');
}


window.initMap = function () {
    map = new google.maps.Map(document.getElementById("showMaps"), {
        zoom: 10,
        zoomControl: false,
        mapTypeControl: false, 
        streetViewControl: false,
        fullscreenControl: false, 
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                map.setCenter(userLocation);

                new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                });


                const filter = new filterMarketData(mymarketArr, userLocation, userFilters.category, userFilters.distance, userFilters.date);
                const filteredMarkets = filter.filterMarketsByCategory();


                displayCards(filteredMarkets, marketID);
                displayNearbyLocations(filteredMarkets);



            },
            (error) => {
                map.setCenter({ lat: 49.2827, lng: -123.1207 });
            }
        );
    } else {
        map.setCenter({ lat: 49.2827, lng: -123.1207 });
    }
}


const marketDataArray = [];
const collectionMarket = 'Markets';
const collectionCategories = 'Categories';
let CategoryList;
let map;
let marketID;

async function getMarketData() {
    try {
        const querySnapshot = await getDocs(collection(db, collectionMarket));
        querySnapshot.forEach((docSnapshot) => {
            const marketData = docSnapshot.data();
            marketID = docSnapshot.id;
            marketDataArray.push(marketData);

        });

    } catch (error) {
        console.error('Error retrieving market data:', error);
    }
};

function updateUserFilters() {
    let filterCount = 0

    if (selectedCategories.length != 0) {
        userFilters.category = selectedCategories.slice();;
        filterCount += 1;
    }

    if (distanceSelect.value != defaultFilters.distance) {
        userFilters.distance = parseInt(distanceSelect.value);
        filterCount += 1;
    }

    if (selectedDate !== null ) {
        filterCount += 1;
        userFilters.date = selectedDate;

    }

    updateFilterCount(filterCount);

    sessionStorage.setItem('userFilters', JSON.stringify(userFilters));
    loadGoogleMapsScript();

}



function applyStyleToSelectedCheckboxes() {
    // Clear background color for all checkboxes
    const categoryLabels = document.querySelectorAll('.category-label');
    categoryLabels.forEach(label => {
        label.style.backgroundColor = '#FFFFFF';
        label.style.color = '#487556';

        const svg = label.querySelector('.category-svg');
        svg.src = '../../assets/add.svg';
        svg.style.fill = 'inherit';
    });

    // Apply background color for selected checkboxes
    selectedCheckboxLabels.forEach(label => {
        label.style.backgroundColor = '#487556';
        label.style.color = '#FFFFFF';

        const svg = label.querySelector('.category-svg');
        svg.src = '../../assets/added.svg';
        svg.style.fill = 'inherit';

    });
}


async function populateMarketCategories(CategoryList) {
    const categoryOptions = document.getElementById("categoryOptions");

    // Clear any existing checkboxes
    categoryOptions.innerHTML = '';

    selectedCategories = [];

    CategoryList.forEach((category) => {
        const categoryCheckboxLabel = document.createElement("label");
        categoryCheckboxLabel.className = "category-label";
        categoryCheckboxLabel.id = category.name;
        categoryCheckboxLabel.innerHTML = `<input class="category-input" type="checkbox" name="category" value="${category.id}">
        ${category.name}
        `;

        const categorySvg = document.createElement("img");
        categorySvg.className = "category-svg";
        categorySvg.src = "../../assets/add.svg";
        categorySvg.alt = "Category SVG";

        categoryCheckboxLabel.appendChild(categorySvg);
        categoryOptions.appendChild(categoryCheckboxLabel);

        categoryCheckboxLabel.addEventListener('change', () => {
            const checkboxInput = categoryCheckboxLabel.querySelector('input');
            const categoryId = checkboxInput.value;

            const index = selectedCategories.indexOf(categoryId);

            if (checkboxInput.checked && index === -1) {
                selectedCategories.push(categoryId);
                selectedCheckboxLabels.push(categoryCheckboxLabel);
            } else if (!checkboxInput.checked && index !== -1) {
                selectedCategories.splice(index, 1);
                const labelIndex = selectedCheckboxLabels.indexOf(categoryCheckboxLabel);
                selectedCheckboxLabels.splice(labelIndex, 1);
            }

            applyStyleToSelectedCheckboxes();

        });
    });
}



async function getCategoriesData() {
    try {
        const queryCategoriesSnapshot = await getDocs(collection(db, collectionCategories));
        queryCategoriesSnapshot.forEach((docSnapshot) => {
            const CategoriesData = docSnapshot.data();
            CategoryList = CategoriesData.Category;

            populateMarketCategories(CategoryList);
        });

    } catch (error) {
        console.error('Error retrieving market data:', error);
    }
};


function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}


let isDataInitialized = false;

async function initializeData() {
    if (!isDataInitialized) {
        await getMarketData();
        await getCategoriesData();
        isDataInitialized = true;

        const storedFilterCount = sessionStorage.getItem('filterCount');
        const filterCount = storedFilterCount ? parseInt(storedFilterCount) : 0;

        updateFilterCount(filterCount);

        const storedFilters = sessionStorage.getItem('userFilters');
        userFilters = storedFilters ? JSON.parse(storedFilters) : { ...defaultFilters };
        
        if (!storedFilters) {
            userFilters = { ...defaultFilters };
            
            sessionStorage.setItem('userFilters', JSON.stringify(userFilters));
        }
    }
}


await initializeData();
let mymarketArr = [...marketDataArray];
loadGoogleMapsScript();


const applyFiltersButton = document.getElementById('applyFilters');
applyFiltersButton.addEventListener('click', function (event) {
    event.preventDefault();
    updateUserFilters();
});

function clearFilters() {
    userFilters = { ...defaultFilters };

    var categoryCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    categoryCheckboxes.forEach(function (checkbox) {
        checkbox.checked = false;
    });
    selectedCheckboxLabels.forEach(label => {
        label.style.backgroundColor = '#FFFFFF';
        label.style.color = '#487556';

        const svg = label.querySelector('.category-svg');
        svg.src = '../../assets/add.svg';
        svg.style.fill = 'inherit';
    });

    selectedCategories = [];
    selectedCheckboxLabels = []; 


    document.getElementById("filterDistance").value = userFilters.distance;
    document.getElementById("sliderValue").textContent = `${userFilters.distance}Km`;

    var dateOptions = document.getElementById("dateOptions");
    selectedDate = null;
    dateOptions.innerHTML = '';
    setupDateOptions();
    updateUserFilters();
}

// Assign the event listener to both clear buttons
document.getElementById("clearFiltersButton").addEventListener("click", clearFilters);
document.getElementById("clearBtn").addEventListener("click", clearFilters);

