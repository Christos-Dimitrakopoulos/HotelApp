$(document).ready(function () {
    //All ids
    const searchField = $("#search-TextField");
    const submitBtn = $("#submit-reset");
    const checkInDate = $("#checkInDate");
    const checkOutDate = $("#checkOutDate");
    const roomsDrop = $("#rooms-DropDown");
    const maxPriceText = $("#maxPrice");
    const priceRange = $("#price-Range");
    const propertyTypeDrop = $("#Property-Type-DropDown");
    const guestRatingDrop = $("#Guest-Rating-DropDown");
    const hotelLocationDrop = $("#Hotel-Location-DropDown");
    const moreFiltersDrop = $("#More-Filters-DropDown");
    const sortByDropDown = $("#Sort-By-DropDown");
    const hotelsSection = $("#listing-hotels-section");
    const hotelsAuto = $("#hotelsAuto");

    //Populate Data
    var roomtypes = [];
    var hotels = [];
    var filteredhotels = [];
    var autocompleteNames = [];
    var MaxPrice;
    var PropertyTypes = [];
    var GuestRatings = [];
    var Locations = [];
    var Filters = [];

    //Search and Sort
    var cityName;
    var price;
    var propertyType;
    var guestRating;
    var hotelLocation;
    var filters;
    var sortBy;

    $.ajax({
        type: "GET",
        url: "json/data.json",
        dataType: "json"
    }).done((data) => StartApplication(data)).fail((errorObject) => ShowErrorPage(errorObject));

    
    function StartApplication(data) {
        //1 Get Room Types
        roomtypes = data[0].roomtypes.map(x => x.name);
        roomtypes.sort();

        //2 Get All Hotels
        hotels = data[1].entries;

        //3 Get All Hotel Names For Autocomplete
        let hotelNames = hotels.map(x => x.hotelName);
        autocompleteNames = [...new Set(hotelNames)];

        //4 Get Max Price Range
        MaxPrice = hotels.reduce((max, hotel) => (max.price > hotel.price) ? max : hotel).price;

        //5 Get Available Property types
        let hotelTypes = hotels.map(x => x.rating);
        PropertyType = [...new Set(hotelTypes)]
        PropertyType.sort();

        //6 Get Guest Ratings
        let HotelGuestratings = hotels.map(x => x.ratings.text);
        GuestRatings = [...new Set(HotelGuestratings)]

        //7 Get Hotel Locations
        let HotelLocations = hotels.map(x => x.city);
        Locations = [...new Set(HotelLocations)]
        Locations.sort();

        //8 Get Hotel Filters
        let HotelFilters = hotels.map(x => x.filters);
        let CombinedFilters = [];
        for (let i = 0; i < HotelFilters.length; i++) {
            for (let j = 0; j < HotelFilters[i].length; j++) {
                CombinedFilters.push(HotelFilters[i][j].name)
            }
        }
        CombinedFilters.sort();
        Filters = [...new Set(CombinedFilters)]

        //DOM
        //A1 Populate Data for Search Autocomplete
        let autoCompleteElements = autocompleteNames.map(x => `<option value="${x}">`);
        hotelsAuto.append(autoCompleteElements);

        //A2 Populate Data for Roomtypes Dropdown
        let roomTypesElements = roomtypes.map(x => `<option value="${x}">${x}</option>`);
        roomsDrop.append(roomTypesElements);

        //A3 Populate Max Price Field
        maxPriceText.html(`<span>max. ${MaxPrice}€</span>`);

        //A4 Populate Max Attribute Price in Input Range and Change Max Price To Input Event
        priceRange.attr("max", MaxPrice);
        priceRange.val(MaxPrice);
        priceRange.on("input", function () {
            maxPriceText.html(`<span>max. ${$(this).val()}€</span>`);
        });

        //A5 Populate Property Types
        propertyTypeDrop.prepend("<option selected value=''>All</option>");
        for (var i = 0; i < PropertyTypes.length; i++) {
            switch (PropertyTypes[i]) {
                case 5: propertyTypeDrop.append(` <option value = "${PropertyTypes[i]}" >&#11088&#11088&#11088&#11088&#11088</option>`); break;
                case 4: propertyTypeDrop.append(` <option value = "${PropertyTypes[i]}" >&#11088&#11088&#11088&#11088</option>`); break;
                case 3: propertyTypeDrop.append(` <option value = "${PropertyTypes[i]}" >&#11088&#11088&#11088</option>`); break;
                case 2: propertyTypeDrop.append(` <option value = "${PropertyTypes[i]}" >&#11088&#11088</option>`); break;
                case 1: propertyTypeDrop.append(` <option value = "${PropertyTypes[i]}" >&#11088</option>`); break;
                default: break;
            }
        }

        //A6 - Populate Guest Ratings
        guestRatingDrop.prepend("<option value=''>All</option>");
        for (var guestRating of GuestRatings) {
            if (guestRating == "Okay") guestRatingDrop.append(`<option value='${guestRating}'>Okay 0 - 2</option>`)
            if (guestRating == "Fair") guestRatingDrop.append(`<option value='${guestRating}'>Fair 2 - 6</option>`)
            if (guestRating == "Good") guestRatingDrop.append(`<option value='${guestRating}'>Good 6 - 7</option>`)
            if (guestRating == "Very Good") guestRatingDrop.append(`<option value='${guestRating}'>Very Good 7 - 8.5</option>`)
            if (guestRating == "Excellent") guestRatingDrop.append(`<option value='${guestRating}'>Excellent 8.5 - 10</option>`)
        }

        //A7 Populate Hotel Locations
        hotelLocationDrop.prepend("<option value=''>All</option>")
        var locationElements = Locations.map(x => `<option value="${x}">${x}</option>`);
        hotelLocationDrop.append(locationElements);

        //A8 Populate Filters
        moreFiltersDrop.prepend("<option value=''>All</option>")
        var FiltersElements = Filters.map(x => `<option value="${x}">${x}</option>`);
        moreFiltersDrop.append(FiltersElements);

        //Event Listeners
        searchField.on('input', function () {
            cityName = $(this).val();
            Controller();
        });

        priceRange.on('input', function () {
            price = $(this).val();
            Controller();
        });

        propertyTypeDrop.on('input', function () {
            propertyType = $(this).val();
            Controller();
        });

        guestRatingDrop.on('input', function () {
            guestRating = $(this).val();
            Controller();
        });

        hotelLocationDrop.on('input', function () {
            hotelLocation = $(this).val();
            Controller();
        });

        moreFiltersDrop.on('input', function () {
            filters = $(this).val();
            Controller();
        });

        sortByDropDown.on('input', function () {
            sortBy = $(this).val();
            Controller();
        });

        submitBtn.on('click', function () {
            Controller();
        });

        //Controller
        cityName = searchField.val();
        price = priceRange.val();
        propertyType = propertyTypeDrop.val();
        guestRating = guestRatingDrop.val();
        hotelLocation = hotelLocationDrop.val();
        filters = moreFiltersDrop.val();
        sortBy = sortByDropDown.val();

        Controller();
        function Controller() {
            filteredhotels = hotels;
            //Filtering
            if (cityName) {
                filteredhotels = filteredhotels.filter(x => x.hotelName.toUpperCase().includes(cityName).toUpperCase());
            }
            if (price) {
                filteredhotels = filteredhotels.filter(x => x.price <= price);
            }
            if (propertyType) {
                filteredhotels = filteredhotels.filter(x => x.rating == propertyType);
            }
            if (guestRating) {
                filteredhotels = filteredhotels.filter(x => x.ratings.text == guestRating);
            }
            if (hotelLocation) {
                filteredhotels = filteredhotels.filter(x => x.city == hotelLocation);
            }
            if (filters) {
                filteredhotels = filteredhotels.filter(x => x.filters.some(y => y.name == filters));
            }

            //Sorting
            if (sortBy) {
                switch (sortBy) {
                    case "cityAsc": filteredhotels.sort((a, b) => a.city < b.city ? -1 : 1); break;
                    case "cityDesc": filteredhotels.sort((a, b) => a.city > b.city ? -1 : 1); break;
                    case "nameAsc": filteredhotels.sort((a, b) => a.hotelName < b.hotelName ? -1 : 1); break;
                    case "nameDesc": filteredhotels.sort((a, b) => a.hotelName > b.hotelName ? -1 : 1); break;
                    case "priceAsc": filteredhotels.sort((a, b) => a.price - b.hotelName ? -1 : 1); break;
                    case "priceDesc": filteredhotels.sort((a, b) => b.hotelName - a.hotelName ? -1 : 1); break;
                    default: filteredhotels.sort((a, b) => a.city < b.city ? -1 : 1); break;
                }
            }

            //View
            hotelsSection.empty();
            if (filteredhotels.length > 0) {
                filteredhotels.forEach(ViewHotels);
            }
            else {
                ViewNoMoreHotels();
            }
        }

        function ViewHotels(hotel) {
            let element = `
                          <div class="hotel-card">
                               <div class="photo" style="background: url('${hotel.thumbnail}'); background-position: center">
                                   <i id="a" class="fa fa-heart"></i>
                                   <span>1/30</span>
                               </div>
                               <div class="details">
                               <h3><strong>${hotel.hotelName}</strong></h3>
                               <div class="rating">
                                   <div>
                                       ${RatingsStars(hotel.rating)}
                                       <span class="hotel">Hotel</span>
                                   </div>
                               </div>
                               <div class="location">
                                   ${hotel.city}, 0.2 Miles to Champs
                               </div>
                               <div class="reviews">
                                <span class="total">${hotel.ratings.no.toFixed(1)}</span>
                                <b>${hotel.ratings.text}</b>
                                <small>(${hotel.guestrating} reviews)</small>
                            </div>
                            <div class="location-reviews">
                                Excellent location <small>(9.2/10)</small>
                            </div>
                        </div>
                        <div class="third-party-prices">
                            <div class="sites-and-prices">
                                <div class="highlighted">
                                    Hotel WebSite
                                    <strong>${(hotel.price * 1.1).toFixed(0)}€</strong>
                                </div>
                                <div>
                                    Agoda
                                    <strong>800€</strong>
                                </div>
                                <div>
                                    Travelocity
                                        <strong>${hotel.price}€</strong>
                                    </div>
                                </div>
                                <div class="more-deals">
                                    <strong>More deals from</strong>
                                    <strong>775€ <i class="fa fa-angle-down p-0" style="color:black"></i></strong>
                                </div>
                            </div>
                            <div class="call-to-action col col-sm-3">
                                <div class="price">
                                    <div class="before-discount">
                                        HotelPower.com
                                        <strong><s>${(hotel.price * 1.1).toFixed(0)}€</s></strong>
                                    </div>
                                    <div class="after-discount">
                                        Travelocity
                                        <strong>${hotel.price}</strong>
                                        <div class="total">
                                            3 night for <strong>${(hotel.price * 2.9).toFixed(0)}€</strong>
                                        </div>
                                        <div class="usp">
                                            ${hotel.filters.map(x => `<span>${x.name + " "}</span>`)}
                                        </div>
                                    </div>
                                    <div class="btn">
                                        <a href="#">View Deal</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                       `;
            hotelsSection.append(element);
        };

        function RatingsStars(rating) {
            let ele = "";
            for (let i = 0; i < rating; i++) {
                ele += `<span>&#11088</span>`;
            }
            return ele;
        }

        function ViewNoMoreHotels() {
            let noMoreHotelsElement = "<br/><h1> No hotels were found with these search criteria</h1><br/>";
            hotelsSection.append(noMoreHotelsElement);
        }
    }

    function ShowErrorPage(errorObject) {
        if (errorObject.status == 200) {
            var IS_JSON = true;
            try {
                var json = $.parseJSON(errorObject.responseText);
            } catch (error) {
                IS_JSON = false;
                var noMoreHotelsElement = `<br/><h1>Not Valid JSON Format</h1><br/>`;
            }
        }
        else {
            var noMoreHotelsElement = `<br/><h1>${errorObject.status} -- ${errorObject.statusText}</h1><br/>`;
        }
        hotelsSection.append(noMoreHotelsElement);
    }
});