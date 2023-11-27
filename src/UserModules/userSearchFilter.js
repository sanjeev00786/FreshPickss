export class filterMarketData {
    constructor(marketDataArray, userLocation, filterCategory, filterDistance, filterDate) {
        this.marketDataArray = marketDataArray;
        this.userLocation = userLocation;
        this.filterDistance = filterDistance;
        this.filterCategory = filterCategory;
        this.filterDate = filterDate;
    }




    calculateDistance(lat1, lon1, lat2, lon2) {
        const earthRadius = 6371;


        const radlat1 = Math.PI * lat1 / 180;
        const radlat2 = Math.PI * lat2 / 180;


        const lonDiff = Math.abs(lon1 - lon2);


        const radLonDiff = Math.PI * lonDiff / 180;


        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radLonDiff);
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        dist = dist * 1.609344;

        return dist;
    }



    filterMarketsByCategory() {
        let filteredMarkets = [];


        // First, populate filteredMarkets with all markets
        // (Assuming you have an array of markets, e.g., this.allMarkets)
        filteredMarkets = this.marketDataArray;


        if (!isNaN(this.filterDistance)) {
            // Filter based on distance
            filteredMarkets = this.marketDataArray.filter(market => {
                const marketDistance = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lng,
                    market.location.lat,
                    market.location.lng
                );
                return marketDistance <= this.filterDistance;
            });
        }
        if (Array.isArray(this.filterCategory) && this.filterCategory.length > 0) {
            // Filter based on category
            filteredMarkets = filteredMarkets.filter((market) => {
                if (Array.isArray(market.categories) && market.categories.length > 0) {
                    return this.filterCategory.every((filterItem) => market.categories.includes(filterItem));
                } else {
                    return false;
                }
            });
        }

        if (this.filterDate && this.filterDate !== "" && filteredMarkets.length > 0) {

            // If the selected date is not in the past, filter the markets
            filteredMarkets = filteredMarkets.filter(market => {
                // Compare market date with the selected date
                if (market.date.date === this.filterDate) {
                    return true; // Keep the date in filteredMarkets
                } else {
                    return false; // Exclude the date from filteredMarkets
                }
            });

        }


        // Sort the filtered markets by distance in increasing order if distance filter is applied
        if (!isNaN(this.filterDistance) && filteredMarkets.length > 0) {
            filteredMarkets.sort((a, b) => {
                const distanceA = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lng,
                    a.location.lat,
                    a.location.lng
                );
                const distanceB = this.calculateDistance(
                    this.userLocation.lat,
                    this.userLocation.lng,
                    b.location.lat,
                    b.location.lng
                );
                return distanceA - distanceB;
            });
        }


        return filteredMarkets;
    }


}