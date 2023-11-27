import { getCollectionData } from '/helperClasses/firestoreService.js'
import { showCustomToast } from '/helperClasses/Alert.js'

const cardContainer = document.querySelector('.event')
const popSound = document.getElementById('popupSound')
const addMarketBtn = document.getElementById('addMarketBtn')
const manageMarketBtn = document.getElementById('manageMarketBtn')
const searchInput = document.getElementById('searchInput')

// Mark:- Variables
let marketArr = []
const marketCollectionName = 'Markets'
let userId = "QuvoAepbjRVWyWcPvHaqWMREy712"
let currentOpenInfoWindow = null

// MARK:- Initialize map
function initMap(arr) {
    var lat = 49.2827
    var lng = 123.1207
    var options = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 10,
        styles: [
          {
            "featureType": "poi",
            elementType: "labels",
            stylers: [
              {
                visibility: "off",
              },
            ],
          },
        ]
      }
    let map = new google.maps.Map(document.getElementById('googleMap'), options)

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const userLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
            map.setCenter(userLocation)
            // MARK:- Hide Loader
            document.body.classList.add("loaded")
            arr.forEach((data) => {
                createMarketMarker(data, map)
            })
        }, function () {
            // Handle error or user denial for location
            console.warn("Geolocation failed or permission denied.")
        })

        google.maps.event.addListener(map, 'closeclick', function () {
            if (currentOpenInfoWindow) {
                currentOpenInfoWindow.close()
                infoContent.classList.remove('show')
            }
        })

    } else {

    }
}

function createMarketMarker(data, map) {
    const customIconUrl = '../../assets/Location_Marker.png'

    const marker = new google.maps.Marker({
        position: { lat: data.location.lat, lng: data.location.lng },
        map: map,
        title: data.location.name,
        icon: {
            url: customIconUrl,
            size: new google.maps.Size(100, 100),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(20, 20),
        }
    })
    const image = data.media.find(item => item.type === "img")

    const infoContent = document.createElement('div')
    infoContent.className = 'info-window-content'
    infoContent.style.maxWidth = '300px'

    infoContent.innerHTML = `
      <div style="position: relative">
        <img src="${image.file}" alt="${data.location.name}" style="width: 300px height: 150px border-top-left-radius: 8px border-top-right-radius: 8px"/>
      </div>
      <div style="background: white padding: 10px border-bottom-left-radius: 8px border-bottom-right-radius: 8px box-shadow: 0 2px 4px rgba(0,0,0,0.2)">
        <div style="font-weight: bold margin-bottom: 5px">${data.marketName}</div>
        <span style="color: green">${data.location.name}</span>
        <div style="margin-bottom: 5px">
          <span style="color: #FFD700">★</span> 4
        </div>
        <div style="display: flex justify-content: space-between">
          <button id="direction-${data.id}" class="get-directions" style="background-color: #E0E0E0 padding: 8px border-radius: 4px border: none cursor: pointer">
          <img id="infoImage" src="../../assets/direction.png" alt="Share" style="width: 30px height: 30px">
          </button>
          <button id="share-${data.id}" class="share-location" style= "background-color: #E0E0E0 "padding: 8px border-radius: 4px border: none cursor: pointer">
          <img id="shareImage" src="../../assets/share.png" alt="Share" style="width: 25px height: 25px">
          </button>
        </div>
      </div>`

    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    })

    marker.addListener('click', () => {
        if (currentOpenInfoWindow) {
            currentOpenInfoWindow.close()
        }
        infoWindow.open(map, marker)
        currentOpenInfoWindow = infoWindow
        popSound.play()
        setTimeout(() => addDirectionListener(data.id, data.location.lat, data.location.lng, image), 0)
        setTimeout(() => infoContent.classList.add('show'), 10)
    })
}

function addDirectionListener(id, lat, lng, img) {
    const button = document.getElementById(`direction-${id}`)
    const shareBtn = document.getElementById(`share-${id}`)

    if (button) {
        button.addEventListener('click', () => {
            getDirections(lat, lng)
        })
    }

    shareBtn.addEventListener('click', () => {
        shareData(img, 'www.google.com')
    })
}

function getDirections(lat, lng) {
    const directionUrl = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${lat},${lng}`
    window.open(directionUrl, '_blank')
}

// Mark:- Fetch Market Data
async function getMarketsData() {
    try {
        const data = await getCollectionData(marketCollectionName)
        for (const i of data) {
            console.log(i)
            if (i.userId === userId) {
                marketArr.push(i)
            }
        }
        loadData(marketArr)
    } catch (error) {
        console.error("Error:", error)
    }
}

getMarketsData()

function loadData(arr) {
    cardContainer.innerHTML = ``
    for (const market of arr) {
        const card = createCard(market)
        cardContainer.appendChild(card)
    }
    initMap(arr)
}

async function shareData(imageFile, url) {
    if (navigator.share) {
        try {
            await navigator.share({
                files: [imageFile],
                url: url,
                title: 'Check this out!',
                text: 'I wanted to share this with you.'
            })
            console.log('Data was shared successfully')
        } catch (err) {
            console.error('Share failed:', err.message)
        }
    } else {
        // Fallback for browsers that don't support the Web Share API
        console.log('Web Share API is not supported in this browser.')
    }
}

// MARK:- Create Cards
function createCard(data) {

    const image = data.media.find(item => item.type === "img")

    const card = document.createElement('div')
    card.className = 'card'

    const img = document.createElement('img')
    img.src = image.file
    card.appendChild(img)

    const content = document.createElement('div')
    content.className = 'card-content'
    card.appendChild(content)

    const title = document.createElement('h2')
    title.className = 'card-title'
    title.textContent = data.marketName
    content.appendChild(title)

    const date = document.createElement('p')
    date.textContent = `${data.date.date} | ${data.date.time}`
    content.appendChild(date)

    const location = document.createElement('p')
    location.textContent = data.location.name
    content.appendChild(location)

    const rating = document.createElement('p')
    rating.className = 'card-rating'

    const maxStars = 5
    var yellowStars = 0

    if (!isNaN(data.averageRating)) {
        yellowStars = Math.floor(data.averageRating)
    }

    var greyStars = maxStars - yellowStars

    for (let i = 0; i < yellowStars; i++) {
        const yellowStar = document.createElement('span')
        yellowStar.textContent = '★'
        yellowStar.style.color = 'gold'
        yellowStar.style.padding = '2px';
        yellowStar.style.width = '12px'
        yellowStar.style.height = '12px'
        rating.appendChild(yellowStar)
    }

    console.log(greyStars)
    for (let i = 0; i < greyStars; i++) {
        const greyStar = document.createElement('span')
        greyStar.textContent = '★'
        greyStar.style.color = 'grey' 
        greyStar.style.padding = '2px';
        greyStar.style.width = '12px'
        greyStar.style.height = '12px'
        rating.appendChild(greyStar)
    }

    content.appendChild(rating)

    const footer = document.createElement('div')
    footer.className = 'card-footer'

    const detailsLink = document.createElement('a')
    detailsLink.textContent = 'View Details'
    const itemId = data.id
    footer.appendChild(detailsLink)
    content.appendChild(footer)

    detailsLink.addEventListener('click', function (event) {
        event.preventDefault()
        openDetailPage(itemId)
    })
    return card
}

function openDetailPage(id) {
    window.location.href = `/html/User/MarketDetails.html?documentId=${id}`
}

function filterData(text) {
    if (text == "") {
        loadData(marketArr)
    } else {
        var arr = []
        for (const market of marketArr) {
            if (market.marketName.includes(text)) {
                console.log(market.marketName)
                arr.push(market)
            }
        }
        loadData(arr)
    }
}

// MARK:- Add Event Listeners

addMarketBtn.addEventListener('click', function () {
    document.body.classList.add('slide-out')
    setTimeout(function () {
        window.location.href = '/html/OrganizerPages/AddMarket.html'
    }, 500)
})

manageMarketBtn.addEventListener('click', function () {
    document.body.classList.add('slide-out')

    setTimeout(function () {
        window.location.href = '/html/OrganizerPages/ManageMarket.html'
    }, 500)
})

searchInput.addEventListener('input', function () {
    filterData(searchInput.value)
})

const navMenuBtn = document.getElementById('navMenuBtn');
const navMenu = document.getElementById('navMenu');

navMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// document.addEventListener('DOMContentLoaded', function () {
//     const offlinePage = document.getElementById('offlinePage')
//     handleNetworkChange(offlinePage)

//     // Event listener for online/offline events
//     window.addEventListener('online', function() {
//         console.log('online')
//         handleNetworkChange(offlinePage)
//     })
//     window.addEventListener('offline', function() {
//         console.log('online')
//         handleNetworkChange(offlinePage)
//     })
// })