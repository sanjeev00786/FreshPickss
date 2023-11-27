export function moveSliderValue() {
    const filterDistance = document.getElementById("filterDistance");
    const sliderValue = document.getElementById("sliderValue");

    filterDistance.addEventListener("input", () => {
        sliderValue.textContent = filterDistance.value+"Km";
    });

    return filterDistance;
}

export function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}


export function extractCityProvinceNames(location) {
    const regex = /,\s*([^,]+),\s*([^,]+)(?:,|$)/;
    const match = location.match(regex);
    if (match) {
        const city = match[1].trim();
        const province = match[2].trim();
        return `${city}, ${province}`;
    } else {
        return "Unknown Location";
    }
}

export function extractRatings(market) {
    const ratings = [];

    if (market.hasOwnProperty('reviews') && Array.isArray(market.reviews)) {
        market.reviews.forEach(review => {
            if (review.hasOwnProperty('rating')) {
                ratings.push(review.rating);
            }
        });
    }

    if (ratings.length === 0) {
        return 0;
    }

    const sum = ratings.reduce((total, rating) => total + rating, 0);
    const average = sum / ratings.length;

    const roundedAverage = Math.round(average);

    return roundedAverage;
}


  