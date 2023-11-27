import { doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { db } from '../../../helperClasses/firestoreService.js';
import { MAP_KEY } from '/helperClasses/constants.js'


const collectionName = 'Markets';
const currentURL = window.location.href;

// Extract the documentId from the URL
const params = new URLSearchParams(new URL(currentURL).search);
const documentId = params.get("documentId");



const addGoogleMap = (latitude, longitude) => {
    const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
    };
    const map = new google.maps.Map(document.getElementById('showMaps'), mapOptions);


    const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: 'Market Location',
    });
};


function getDirections(lat, lng) {
    const directionUrl = `https://www.google.com/maps/dir/?api=1&origin=current+location&destination=${lat},${lng}`;
    window.open(directionUrl, '_blank');
}


let marketDetailsData;

$(document).ready(function () {
  $("#userRating").rating();
});


// Define the Market class
class Market {
    constructor(marketName, description, faq, media, categories, vendors, location, date, averageRating) {
        this.marketName = marketName;
        this.description = description;
        this.faq = faq;
        this.media = media;
        this.categories = categories;
        this.vendors = vendors;
        this.location = location;
        this.date = date;
        this.averageRating = averageRating;
    }
}


// Function to retrieve market data from a specific document
const getMarketDetails = async () => {
    try {
        const docRef = doc(db, collectionName, documentId); // Replace with the actual document ID


        const docSnapshot = await getDoc(docRef);


        if (docSnapshot.exists()) {
            const marketData = docSnapshot.data();
            const marketName = marketData.marketName;
            const description = marketData.description;
            const faq = marketData.faq;
            const media = marketData.media;
            const categories = marketData.categories;
            const vendors = marketData.vendors;
            const location = marketData.location
            const date = marketData.date
            let averageRating = 0;
            if(marketData.averageRating){
              averageRating = marketData.averageRating;
            }


            const market = new Market(marketName, description, faq, media, categories, vendors, location, date, averageRating);
            marketDetailsData = market;
            console.log(marketDetailsData)
            return market;
         } else {
            console.log('Document does not exist');
        }
    } catch (error) {
        console.error('Error retrieving market data:', error);
    }
};


function createStarRating(container, rating) {
  container.innerHTML = ''; // Clear existing content

  for (let i = 0; i < rating; i++) {
      const star = document.createElement('div');
      star.classList.add('review-star');
      star.style.color = 'gold'; // Fill the star
      container.appendChild(star);
  }
}

// Function to populate the page with market data
const populateMarketDetails = async(data) => {
    document.getElementById("marketName").textContent = data.marketName;

    const starContainer = document.getElementById('averageRating');
    createStarRating(starContainer, data.averageRating);

    document.getElementById('averageRatingText').textContent = `Overall Rating: ${Math.round(data.averageRating)}`;
    document.getElementById("description").textContent = data.description;
    document.getElementById("infobox-marketLocation").textContent = data.location.name;
    document.getElementById("infobox-marketDate").textContent = data.date.date;
    document.getElementById("infobox-marketTime").textContent = data.date.time;

    // Populate Images
    const imagesDiv = document.getElementById("images");

    data.media.forEach((media, index) => {
      if (media.type === "img") {
        const imgElement = document.createElement("img");
        imgElement.src = media.file;
        imgElement.classList.add("d-block", "w-100"); // Bootstrap class for image styling
        imgElement.alt = `Image ${index + 1}`;
        
        const slideDiv = document.createElement("div");
        slideDiv.appendChild(imgElement);
  
        imagesDiv.appendChild(slideDiv);
      }
    });
  
    // Initialize Tiny Carousel
    const slider = tns({
      container: "#images",
      items: 2, // Display 3 items at a time
      slideBy: "page",
      autoplay: false,
      mouseDrag: true,
      gutter: 10,
      controls: false,
      responsive: {
        768: {
          items: 1, // Display 1 item on smaller screens
        },
        992: {
          items: 2, // Display 3 items on medium-sized screens and larger
        },
      },
    });


    // Populate FAQ

    function createAccordionItem(faqItem, index) {
      const accordionItem = document.createElement('div');
      accordionItem.classList.add('accordion-item');

      const headerId = `flushHeading${index}`;
      const collapseId = `flushCollapse${index}`;

      accordionItem.innerHTML = `
      <div class="accordion-item">
      <h2 class="accordion-header">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
        ${faqItem.question}
        </button>
      </h2>
        <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#faq">
          <div class="accordion-body">${faqItem.answer}</div>
        </div>
      </div>
      `;

      return accordionItem;
    }

      // Populate the FAQ container with Bootstrap accordion items
    const faqContainer = document.getElementById('faq');
    data.faq.forEach((faqItem, index) => {
        const accordionItem = createAccordionItem(faqItem, index);
        faqContainer.appendChild(accordionItem);
    });


    // Populate Food Categories
    const categoriesList = document.getElementById("categories");

    const categoryData = {
      "1": "Vegetables",
      "2": "Fruits",
      "3":  "Dairy Products" 
      // Add more categories as needed
    };

    data.categories.forEach((category) => {
      const card = document.createElement("div");
      card.classList.add("col-lg-3", "mb-3","d-flex", "flex-column"); // Adjust the column size and margin as needed
  
      const cardContainer = document.createElement("div");
      cardContainer.classList.add("card", "h-100");
  
      const imgElement = document.createElement("img");
      imgElement.src = `../../../assets/${categoryData[category]}.jpg`; // Replace with the actual path to your images
      // imgElement.style.height = "150px"; // Set the width to 150 pixels
      imgElement.classList.add("card-img-top", "img-fluid");
      imgElement.alt = `${category} Image`;
  
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");
  
      const cardTitle = document.createElement("h5");
      cardTitle.classList.add("card-title");
      cardTitle.textContent = `${categoryData[category]}`;
  
      cardBody.appendChild(cardTitle);
      cardContainer.appendChild(imgElement);
      cardContainer.appendChild(cardBody);
      card.appendChild(cardContainer);
  
      categoriesList.appendChild(card);
    });


  // Populate Vendors
    const vendorsList = document.getElementById("vendors");

    data.vendors.forEach((vendor) => {
      const card = document.createElement("div");
      card.classList.add("card", "flex-row", "mb-4", "col-sm-12", "col-lg-6");

      // Card Image
      const imgElement = document.createElement("img");
      imgElement.src = vendor.profileImg;
      imgElement.style.maxWidth = "150px"; // Set the maximum width to 150 pixels
      imgElement.style.maxHeight = "150px"; // Set the maximum height to 150 pixels
      imgElement.style.objectFit = "cover"; // Maintain aspect ratio and cover container
      // imgElement.style.width = "150px"; // Set the width to 150 pixels
      imgElement.classList.add("card-img-left","img-fluid");
      imgElement.alt = `${vendor.name} Image`;

      card.appendChild(imgElement);

      // Card Body
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      const cardTitle = document.createElement("h4");
      cardTitle.classList.add("card-title", "h5", "h4-sm");
      cardTitle.textContent = vendor.name;

      const cardText = document.createElement("p");
      cardText.classList.add("card-text");
      cardText.textContent = vendor.description;

      cardBody.appendChild(cardTitle);
      cardBody.appendChild(cardText);
        cardBody.addEventListener('click', function() {
            console.log('test')
            updateModalContent(vendor)
            document.getElementById('vendorModal').style.display = 'flex';
        })
      card.appendChild(cardBody);
    
      vendorsList.appendChild(card);
    });


    addGoogleMap(data.location.lat, data.location.lng);


    const getDirectionsBtn = document.getElementById("getDirectionsBtn");
    const customButton = document.getElementById("customBtn")
    getDirectionsBtn.addEventListener("click", () => {
        getDirections(data.location.lat, data.location.lng)
    })

    customButton.addEventListener("click", () => {
      getDirections(data.location.lat, data.location.lng)
  })
}

function updateModalContent(data) {
    document.getElementById('vendorImage').innerHTML = `<img src="${data.profileImg}" alt="Vendor Image">`;
    document.getElementById('vendorName').innerText = data.name;
    var cat = []
    for (const i of data.categories) {
      if (i == "1") {
        cat.push("Vegetables")
      } else if (i == "2") {
        cat.push("Fruits")
      } else if (i == "3") {
        cat.push("Dairy Products")
      }
    }

    document.getElementById('vendorCategories').innerText = Array.isArray(cat)
    ? cat.join(', ') : cat
    document.getElementById('vendorDescription').innerText = data.description;
    const closeBtn = document.getElementById('closeBtn')
  closeBtn.addEventListener('click', () => {
    closeModal()
  })
  }

  function closeModal() {
    document.getElementById('vendorModal').style.display = 'none';
  }

const populateReviewDetails = async() =>  {

    const marketDocRef = doc(db, collectionName, documentId);

    try {
        const marketDoc = await getDoc(marketDocRef);
        if (marketDoc.exists()) {
          const marketData = marketDoc.data();
          const reviews = marketData.reviews || [];
  
          const reviewCards = document.getElementById("reviewCards");
  
          if (reviews.length === 0) {
            // If no reviews, display a message
            const message = `
              <div class="alert alert-info" role="alert">
                No reviews available for this market.
              </div>
            `;
  
            reviewCards.innerHTML += message;
          } else {
            reviews.forEach((review) => {
              const stars = generateStarRating(review.rating);

              const card = `
                  <div class="card mb-3">
                      <div class="card-body">
                          <h5 class="card-title">${review.user}</h5>
                          <h6 class="card-subtitle mb-2 text-muted">Rating: ${stars}</h6>
                          <p class="card-text">${review.comment}</p>
                          <p class="card-text">${review.date.toDate().toLocaleDateString()}</p>
                      </div>
                  </div>
              `;

              reviewCards.innerHTML += card;
          });
          }
        } else {
          console.log("Market document does not exist.");
        }
      } catch (error) {
        console.error("Error fetching review data: ", error);
      }

    };


// Function to generate star rating HTML based on a given rating for the populateReviewDetails function
function generateStarRating(rating) {
  const filledStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;

  let starsHtml = '';

  for (let i = 0; i < filledStars; i++) {
      starsHtml += '<span class="star">&#9733;</span>'; // Filled star
  }

  if (halfStar) {
      starsHtml += '<span class="star">&#9734;</span>'; // Half-filled star
  }

  const emptyStars = 5 - Math.ceil(rating);

  for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star">&#9734;</span>'; // Empty star
  }

  return starsHtml;
}

document.getElementById("saveReview").addEventListener("click", async function () {
  const userName = document.getElementById("userName").value;
  const userComment = document.getElementById("userComment").value;
  const userRating = parseFloat(document.getElementById("userRating").value);

  if (!userName || !userComment || isNaN(userRating) || userRating < 1 || userRating > 5) {
      alert("Please fill in all fields and provide a valid rating (1-5).");
      return;
  }

  const review = {
      user: userName,
      comment: userComment,
      rating: userRating,
      date: new Date(),
  };

  const marketDocRef = doc(db, collectionName, documentId);

  try {
      const marketDoc = await getDoc(marketDocRef);
      if (marketDoc.exists()) {
          const marketData = marketDoc.data();

          // Check if the "reviews" array exists, and create it if it doesn't
          if (!marketData.reviews) {
              marketData.reviews = [];
          }

          marketData.reviews.push(review);

          // Check if the "averageRating" field exists, and create it if it doesn't
          if (!marketData.averageRating) {
              marketData.averageRating = 0; // Set an initial value
          }

          // Calculate the average rating
          const totalRating = marketData.reviews.reduce((sum, review) => sum + review.rating, 0);
          marketData.averageRating = totalRating / marketData.reviews.length;

          // Update the "market" document with the new reviews array and average rating
          await updateDoc(marketDocRef, { reviews: marketData.reviews, averageRating: marketData.averageRating });

          console.log("Review added:", review);
      } else {
          console.log("Market document does not exist.");
      }
  } catch (error) {
      console.error("Error adding review: ", error);
  }

  // Close the modal
  let myModal = new bootstrap.Modal(document.getElementById("myModal"));
  myModal.hide();
});




function loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_KEY}&callback=initMap`;
    script.defer = true;
    script.async = true;
    document.head.appendChild(script);
}


loadGoogleMapsScript();

getMarketDetails().then((data) => populateMarketDetails(data).then(() => populateReviewDetails()) );