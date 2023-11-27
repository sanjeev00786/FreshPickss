import { extractCityProvinceNames, extractRatings } from '../../helperClasses/FilterUtils.js';


export function displayCards(filteredMarkets, marketID) {

  const container = document.getElementById("cardsListing");
  container.innerHTML = "";

  const heading = document.createElement("h2");
  heading.textContent = "Current Events";
  heading.classList.add("CurrentMarketsHeading")
  container.appendChild(heading);


  if (filteredMarkets.length == 0) {

    const card = document.createElement("div");
    card.classList.add("card");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const nameElement = document.createElement("h3");
    nameElement.textContent = `Markets Unavailable`;

    cardBody.appendChild(nameElement);
    card.appendChild(cardBody);
    container.appendChild(card);


  }

  // Iterate through the array and generate HTML for each card
  filteredMarkets.forEach(data => {



    const card = document.createElement("div");
    card.classList.add("card");

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    // Image container
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("image-container");

    const imageElement = document.createElement("img");
    imageElement.src = data.media.find(item => item.type === "img").file

    imageContainer.appendChild(imageElement);

    // Details container
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("details-container");

    const nameElement = document.createElement("h4");
    nameElement.classList.add("class-heading-4")
    nameElement.textContent = data.marketName;

    const dateElement = document.createElement("p");
    dateElement.classList.add("class-font-medium");
    dateElement.classList.add("class-listing-date");
    dateElement.textContent = `${data.date.date} | ${data.date.time.split(':').slice(0, -1).join(':')}`;

    const locationElement = document.createElement("p");
    locationElement.classList.add("class-font-medium")
    locationElement.textContent = `${extractCityProvinceNames(data.location.name)}`;

    let averageRating = extractRatings(data)

    const filledStar = '<object class="starfilled" type="image/svg+xml" data="../../assets/starfilled.svg" width="12" height="12"> Your browser does not support SVG. </object>'

    const unfilledStar = '<object class="staroutlined" type="image/svg+xml" data="../../assets/staroutlined.svg" width="12" height="12"> Your browser does not support SVG. </object>'


    const ratingContainer = document.createElement("div");
    ratingContainer.classList.add("rating-container");

    for (let i = 1; i <= 5; i++) {
        const starSvg = i <= averageRating ? filledStar : unfilledStar;
        ratingContainer.innerHTML += starSvg;
    }


    // Create a "See Details" button
    const seeDetailsButton = document.createElement("a");
    seeDetailsButton.textContent = "View Details";
    seeDetailsButton.classList.add("btn", "btn-primary", "class-see-details"); 
    seeDetailsButton.href = `/html/User/MarketDetails.html?documentId=${marketID}`; 

    // Appending elements to details container
    detailsContainer.appendChild(nameElement);
    detailsContainer.appendChild(dateElement);
    detailsContainer.appendChild(locationElement);
    detailsContainer.appendChild(ratingContainer);
    detailsContainer.appendChild(seeDetailsButton);


    cardBody.appendChild(imageContainer);
    cardBody.appendChild(detailsContainer);
    card.appendChild(cardBody);
    container.appendChild(card);


  });


}