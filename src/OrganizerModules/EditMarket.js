import { MAP_KEY } from '/helperClasses/constants.js'
import { DragAndDropHandler, previewImage, previewVideo } from '../../helperClasses/DragAndDropHandler.js'
import { getDataFromFirestore, uploadFileToStorage, getDownloadURLForFile, setDataToCollection } from '../../helperClasses/firestoreService.js'
import { showCustomToast } from '/helperClasses/Alert.js'

// MARK:- Variables
const imageDragAndDrop = new DragAndDropHandler('imageDropZone', 'imagePreview', 'image', previewImage)
const videoDragAndDrop = new DragAndDropHandler('videoDropZone', 'videoPreview', 'video', previewVideo)

const location = document.getElementById('location')
const adddFaq = document.getElementById('addFaq')
const publishBtn = document.getElementById('publishBtn')
const vendorDialog = document.getElementById("vendorDialog")
const addVendorsBlock = document.getElementById("addVendorsBlock")
const locationInput = document.getElementById("location")

const modal = document.getElementById("myModal")
const closeModalButton = document.getElementById("closeModal")
const saveButton = document.getElementById("saveButton")
const cancelButton = document.getElementById("cancelButton")
const modalCategories = document.getElementById('modalCategories')
const profileInput = document.getElementById("profileInput")
const profilePreview = document.getElementById("profilePreview")
const vendorProfile = document.getElementById("vendorProfile")

const slider = document.querySelector('.slider')

const userNameInput = document.getElementById('userName')
const modalCategoriesSelect = document.getElementById('modalCategories')
const additionalInfoTextarea = document.getElementById('additionalInfo')
const profileImageInput = document.getElementById('profileInput')
const profileImagePreview = document.getElementById('profilePreview')
const dateTimeInput = document.getElementById("dateTime")

const finishModal = document.getElementById("finishModal")
const finishBtn = document.getElementById("finishBtn")

//MARK:- VARIABLES
let categoryArr = []
let faqArray = []
let vendorArr = []
let profileImageFile
let locationObj
let dateObj

// MARK:- Fetch particular market data 
async function fetchData() {
  const url = new URL(window.location.href)
  const params = new URLSearchParams(url.search)
  const docId = params.get('data')
  
  console.log(docId)

  const data = await getDataFromFirestore('Markets', docId)
  console.log(data)
  vendorArr = data.vendors
  loadData(data)
  setVendorData()
}

fetchData()

function loadData(data) {
  marketName.value = data.marketName
  locationInput.value = data.location.name
  setDate(data)
  initMap(data.location)
  for (const i of data.media) {
    if (i.type == "img") {
      // imageDragAndDrop.displayMediaFromResponse("img", i.file)
    }
  }
  getCategories(data.categories)
  console.log(data.description, data.date.time)
  description.value = data.description
  populateFaqs(data.faq)
  locationObj = {
    "name": data.location.name,
    "lat": data.location.lat,
    "lng": data.location.lng
  }
  dateObj = {
    "date": data.date.date,
    "time": data.date.time
  }
  document.body.classList.add("loaded");

}

function setDate(data) {
  const dateFromBackend = data.date.date
  const timeFromBackend = data.date.time

  const [day, month, year] = dateFromBackend.split('/')
  const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
  // `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

  const datetimeValue = `${formattedDate}, ${timeFromBackend.slice(0, 5)}`

  console.log("DATE**", datetimeValue)
  const dateTimeInput = document.getElementById('dateTime')
  dateTimeInput.value = datetimeValue
}

// MARK:- Initialize the Map
function initMap(responseLocation) {
  var options = {
    center: new google.maps.LatLng(responseLocation.lat, responseLocation.lng),
    zoom: 17,
  }

  // New map
  let map = new google.maps.Map(document.getElementById('googleMap'), options)

  // Create a marker at the response location
  let marker = new google.maps.Marker({
    position: new google.maps.LatLng(responseLocation.lat, responseLocation.lng),
    map: map,
    title: responseLocation.name,
    draggable: true
  })

  // Address input autocomplete setup
  const locationInput = document.getElementById('locationInput')
  const autocomplete = new google.maps.places.Autocomplete(locationInput)
  autocomplete.setTypes(['geocode'])

  // Autocomplete listener
  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace()
    if (!place.geometry || !place.geometry.location) {
      console.error('No details available for input:', place.name)
      return
    }

    // Set marker to the selected location from autocomplete
    marker.setPosition(place.geometry.location)

    // Pan the map to the selected location
    map.panTo(place.geometry.location)

    // Update the location object
    locationObj = {
      "name": place.formatted_address,
      "lat": place.geometry.location.lat(),
      "lng": place.geometry.location.lng()
    }
    console.log(locationObj)
  })

  // Marker drag listener
  marker.addListener('dragend', () => {
    const position = marker.getPosition()
    reverseGeocode(position.lat(), position.lng(), (place) => {
      if (place) {
        locationObj = {
          "name": place.formatted_address,
          "lat": position.lat(),
          "lng": position.lng()
        }
        console.log(locationObj)
      }
    })
  })
}

function updateAddress(marker, autocomplete) {
  const geocoder = new google.maps.Geocoder()

  geocoder.geocode({ location: marker.getPosition() }, (results, status) => {
    if (status === "OK" && results.length > 0) {
      const address = results[0].formatted_address
      location["name"] = address
      autocomplete.value = address
    }
  })
}

//MARK:- reverse geocode a location using Google Maps Geocoding API
function reverseGeocode(lat, lng, callback) {
  const geocoder = new google.maps.Geocoder()
  const latlng = new google.maps.LatLng(lat, lng)

  geocoder.geocode({ 'latLng': latlng }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK && results[0]) {
      callback(results[0])
    } else {
      console.error('Geocoder failed due to: ' + status)
      callback(null)
    }
  })
}

// MARK:- Get Categories from DB
async function getCategories(category) {
  const data = await getDataFromFirestore('Categories', 'Zfw6U0kZ7BNgMkbC4ouQ')
  if (data) {
    console.log('Data from Firestore:', data)
    const categories = data.Category
    for (var i of categories) {
      var isCategorySelected = false
      for (const v of category) {
        if (v === i.id) {
          isCategorySelected = true
        }
      }
      const obj = {
        name: i.name,
        id: i.id,
        isSelected: isCategorySelected
      }
      categoryArr.push(obj)
      console.log(categoryArr)
    }
    showCategories()
  } else {
    console.log('Data retrieval failed.')
  }
}

// MARK:- Show Category data
function showCategories() {
  const categoryContainer = document.getElementById("category-container")

  categoryArr.forEach((category, index) => {
    const button = document.createElement("button")
    button.className = "category-button"
    button.dataset.index = index

    // Create the text span
    const textSpan = document.createElement("span")
    textSpan.textContent = category.name

    // Create the image
    const image = document.createElement("img")
    image.alt = "SVG Image"
    image.className = "svg-image"

    if (categoryArr[index].isSelected) {
      button.classList.add("clicked-button")
      image.src = '/assets/Success.svg'
    } else {
      button.classList.remove("clicked-button")
      image.src = '/assets/plus-icon.svg'
    }
    
    button.addEventListener("click", (e) => {
      e.preventDefault()
      const clickedIndex = button.dataset.index
      categoryArr[clickedIndex].isSelected = !categoryArr[clickedIndex].isSelected

      if (categoryArr[clickedIndex].isSelected) {
        button.classList.add("clicked-button")
        image.src = '/assets/Success.svg'
      } else {
        button.classList.remove("clicked-button")
        image.src = '/assets/plus-icon.svg'
      }

    })
    button.appendChild(textSpan)
    button.appendChild(image)
    categoryContainer.appendChild(button)
  })
}

function addFaqItem(faqData) {
  const faqContainer = document.getElementById('faqContainer');
  const faq = document.createElement('div');
  faq.className = 'faq';
  faq.innerHTML = `
    <input type="text" name="question" placeholder="Question" value="${faqData.question}">
    <input type="text" name="answer" placeholder="Answer" value="${faqData.answer}">
  `;
  faqContainer.appendChild(faq);
}

// Function to add all FAQs from the response
function populateFaqs(faqsFromResponse) {
  // Clear existing FAQs
  const faqContainer = document.getElementById('faqContainer');
  faqContainer.innerHTML = '';

  // Add each FAQ from the response
  faqsFromResponse.forEach(faqData => {
    addFaqItem(faqData);
  });
  // addEmptyFaq()
}

// MARK:- Fetching faq data
function getFaq() {
  const faqElements = document.querySelectorAll('.faq')
  const collectedFAQs = []
  faqElements.forEach((faqElement) => {
    const questionInput = faqElement.querySelector('input[name="question"]')
    const answerInput = faqElement.querySelector('input[name="answer"]')

    const question = questionInput.value
    const answer = answerInput.value

    if (question && answer) {
      // Check if both question and answer are non-empty
      collectedFAQs.push({ question, answer })
    }
  })

  faqArray.push(...collectedFAQs)
  return faqArray

}

// MARK:-  Add FAQ
adddFaq.addEventListener('click', function () {
  addEmptyFaq()
})

function addEmptyFaq() {
  const faqContainer = document.getElementById('faqContainer')
  const faq = document.createElement('div')
  faq.className = 'faq'
  faq.innerHTML = `
            <input type="text" name="question" placeholder="Question">
            <input type="text" name "answer" placeholder="Answer">`
  faqContainer.appendChild(faq)
}

// MARK: - Upload Market Data to Firestore
async function setData() {
  document.body.classList.remove("loaded");
  // Get the user's email
  const collectionName = 'Markets'
  const categories = categoryArr.filter(item => item.isSelected === true).map(item => item.id)
  const vendors = await uploadVendorMedia()
  const downloadURLs = await uploadMedia()
  console.log(categories)
  const data = {
    "userId": "QuvoAepbjRVWyWcPvHaqWMREy712", //Pass the login user-id 
    "marketName": marketName.value,
    "location": locationObj,
    "date": dateObj,
    "categories": categories,
    "media": downloadURLs,
    "description": "this is our First Market",
    "faq": getFaq(),
    "vendors": vendors
  }

  const emptyKeys = checkEmptyValues(data)
  if (emptyKeys.length > 0) {
    document.body.classList.add("loaded");
    showCustomToast(`The following empty values: ${emptyKeys.join(', ')}`)
  } else {
    const a = setDataToCollection(collectionName, data)
    if (a) {
      document.body.classList.add("loaded");
      openFinishModal()
    } else {
      document.body.classList.add("loaded");
      console.log('fail')
      showCustomToast(`Something went wrong`)
    }
  }

}

function checkEmptyValues(data) {
  const emptyKeys = []

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key]
      if (isNullOrEmpty(value)) {
        emptyKeys.push(key)
      }
    }
  }

  return emptyKeys
}

function isNullOrEmpty(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0)
}

// MARK:- Uploading media files to db
async function uploadMedia() {
  const files = []
  const downloadURLs = []

  const imageFiles = imageDragAndDrop.getUploadedFiles()
  const videoFiles = videoDragAndDrop.getUploadedFiles()

  if (imageFiles.length !== 0) {
    files.push(...imageFiles)
  }

  if (videoFiles.length !== 0) {
    files.push(...videoFiles)
  }

  console.log("******",files.length, files)

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      const currentTime = new Date().getTime()
      const storagePath = `image/${file.name}/${currentTime}`

      const result = await uploadFileToStorage(file, storagePath)

      if (result) {
        const downloadURL = await getDownloadURLForFile(storagePath)
        console.log(downloadURL)
        console.log(`Image file ${file.name} uploaded successfully.`)
        const obj = { "type": "img", "file": downloadURL }
        downloadURLs.push(obj)
      } else {
        console.error(`Failed to upload image file ${file.name}.`)
      }
    } else if (file.type.startsWith('video/')) {
      const currentTime = new Date().getTime()
      const storagePath = `video/${file.name}/${currentTime}`

      const result = await uploadFileToStorage(file, storagePath)

      if (result) {
        const downloadURL = await getDownloadURLForFile(storagePath)
        console.log(downloadURL)
        const obj = { "type": "video", "file": downloadURL }
        downloadURLs.push(obj)
        console.log(`Video file ${file.name} uploaded successfully.`)
      } else {
        console.error(`Failed to upload video file ${file.name}.`)
      }
    }
  }
  return downloadURLs
}

async function uploadVendorMedia() {
  var arr = []

  for (const data of vendorArr) {
    const currentTime = new Date().getTime()
    if (data.profileImg) {
      let obj = {
        "name": data.name,
        "categories": data.categories,
        "profileImg": data.profileImg,
        "description": data.description
      }
      arr.push(obj)
    } else {
    const storagePath = `image/${data.file.name}/${currentTime}`
    const result = await uploadFileToStorage(data.file, storagePath)
    if (result) {
      const downloadURL = await getDownloadURLForFile(storagePath)
      console.log(downloadURL)
      data["url"] = downloadURL
      console.log(vendorArr)
      let obj = {
        "name": data.name,
        "categories": data.category,
        "profileImg": downloadURL,
        "description": data.additionalInfo
      }
      arr.push(obj)
    } else {
      // Handle error
    }
  }
  }
  if (arr.length == vendorArr.length) {
    return arr
  }

}

function openGallery() {
  const profileImageInput = document.getElementById("profileImage")
  profileImageInput.click()
}

function handleImageSelection() {
  const selectedFile = profileInput.files[0]

  if (selectedFile) {
    const imageURL = URL.createObjectURL(selectedFile)
    profilePreview.src = imageURL
  }
}

// MARK: - Create Cards for vendor
function createVendorCard(data) {
  const card = document.createElement('div')
  card.classList.add('card')

  const img = document.createElement('img')
  img.src = data.profileImg
  img.className = 'cardImg'

  const p = document.createElement('p')
  p.textContent = data.name
  p.style.paddingLeft = '10px'

  card.appendChild(img)
  card.appendChild(p)

  const nameWidth = data.name.length * 20 + 100
  card.style.width = `${nameWidth}px`

  return card
}

function setVendorData() {
  slider.innerHTML = ''
  vendorArr.forEach((data) => {
    const card = createVendorCard(data)
    slider.appendChild(card)
  })
}

function openFinishModal() {
  finishModal.style.display = "block"
}

// Function to close the modal
function closeFinishModal() {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = '../../html/OrganizerPages/Dashboard.html'
  }
}

// Events Listener
addVendorsBlock.addEventListener('click', function (e) {
  e.preventDefault()
  categoryArr.forEach(category => {
    const option = document.createElement("option")
    option.value = category.id
    option.text = category.name
    modalCategories.appendChild(option)
  })
  modal.style.display = "block"
})

publishBtn.addEventListener('click', async function (e) {
  e.preventDefault()
  setData()
})

closeModalButton.addEventListener("click", () => {
  modal.style.display = "none"
})

saveButton.addEventListener("click", () => {
  const data = {
    "name": userNameInput.value,
    "category": modalCategoriesSelect.value,
    "additionalInfo": additionalInfoTextarea.value,
    "profileImg": profileImagePreview.src,
    "file": profileImageFile
  }

  vendorArr.push(data)
  modal.style.display = "none"
  console.log(vendorArr)
  setVendorData()

})

cancelButton.addEventListener("click", () => {
  modal.style.display = "none"
})

function openFileSelection() {
  profileInput.click()
}

vendorProfile.addEventListener("click", openFileSelection)
profileInput.addEventListener("change", handleImageSelection)

profileImageInput.addEventListener('change', function (event) {
  const file = event.target.files[0]
  const reader = new FileReader()

  reader.onload = function () {
    profileImageFile = file
    profileImagePreview.src = reader.result
  }

  if (file) {
    reader.readAsDataURL(file)
  } else {
    profileImagePreview.src = '/assets/Frame 37344.svg'
  }
})

dateTimeInput.addEventListener("change", function () {
  const dateTimeValue = dateTimeInput.value
  const selectedDateTime = new Date(dateTimeValue)

  // Format the date and time as a string
  const formattedDate = selectedDateTime.toLocaleDateString()
  const formattedTime = selectedDateTime.toLocaleTimeString()

  dateObj = {
    "date": formattedDate,
    "time": formattedTime
  }
})

finishBtn.addEventListener("click", function () {
  closeFinishModal()
})
