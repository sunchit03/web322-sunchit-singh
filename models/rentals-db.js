var rentals = [
    {
        headline: "Charming Cottage in Fabulous Location in Niagara on the Lake",
        numSleeps: 5,
        numBedrooms: 3,
        numBathrooms: 2,
        pricePerNight: 198,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "house1.jpg",
        rating: 4.6,
        reviews: 239,
        featuredRental: true
    },
    {
        headline: "Lux Lake House on Private Beach + Peloton",
        numSleeps: 4,
        numBedrooms: 2,
        numBathrooms: 2,
        pricePerNight: 123,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "house2.jpg",
        rating: 3.5,
        reviews: 285,
        featuredRental: false
    },
    {
        headline: "Luxury Home, SKI IN/OUT Access, Media Room, Private Hot Tub & Garage",
        numSleeps: 9,
        numBedrooms: 5,
        numBathrooms: 4,
        pricePerNight: 279,
        city: "North York",
        province: "Ontario",
        imageUrl: "house3.jpg",
        rating: 4.3,
        reviews: 158,
        featuredRental: true
    },
    {
        headline: "Quiet 1 Bedroom Condo in a Popular Mountain Resort",
        numSleeps: 2,
        numBedrooms: 1,
        numBathrooms: 1,
        pricePerNight: 113,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "house4.jpg",
        rating: 4.9,
        reviews: 223,
        featuredRental: true
    },
    {
        headline: "Deluxe, Modern Whistler Village Condo. BBQ and Pool & Hot Tub Access. WiFi",
        numSleeps: 7,
        numBedrooms: 3,
        numBathrooms: 3,
        pricePerNight: 202,
        city: "North York",
        province: "Ontario",
        imageUrl: "house5.jpg",
        rating: 3.9,
        reviews: 378,
        featuredRental: false
    },
    {
        headline: "The Alpine Rooms, Ski-in/Out, 2Bd, Private hot tub",
        numSleeps: 4,
        numBedrooms: 2,
        numBathrooms: 2,
        pricePerNight: 159,
        city: "Toronto",
        province: "Ontario",
        imageUrl: "house6.jpg",
        rating: 4.0,
        reviews: 118,
        featuredRental: true
    },
    {
        headline: "Mountain Modern Ski-in/Walkout Condo with Private Hot Tub hosted by Whistler Ideal",
        numSleeps: 6,
        numBedrooms: 4,
        numBathrooms: 3,
        pricePerNight: 246,
        city: "North York",
        province: "Ontario",
        imageUrl: "house7.jpg",
        rating: 4.2,
        reviews: 276,
        featuredRental: true
    }
]

module.exports.getFeaturedRentals = function() {
    return rentals.filter(rental => rental.featuredRental);
}

module.exports.getRentalsByCityAndProvince = function(rentals) {
    const rentalGroups = {};
    for (const rental of rentals) {
        const cityProvince = `${rental.city}, ${rental.province}`;
        if (!rentalGroups[cityProvince]) {
        rentalGroups[cityProvince] = [];
        }
        rentalGroups[cityProvince].push(rental);
    }
    return Object.entries(rentalGroups).map(([cityProvince, rentals]) => ({
        cityProvince,
        rentals
  }));

}

module.exports.getAllRentals = function() {
    return rentals.sort((a, b) => {
        const nameA = a.headline.toUpperCase(); // ignore upper and lowercase
        const nameB = b.headline.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
      
        // names must be equal
        return 0;
      });
}