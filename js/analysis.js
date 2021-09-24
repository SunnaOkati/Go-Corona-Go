                
let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;

function initMap() {
  // Initialize variables
  bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  
  // Try HTML5 geolocation
  //Uses maps.api
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      //Creates the map and centers it wrt user's location.
      map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 15
      });
      bounds.extend(pos);

      //Sets the position and content of the information window.
      infoWindow.setPosition(pos);
      infoWindow.setContent('Current Location.');
      infoWindow.open(map);
      map.setCenter(pos);

      // Get nearby hospitals based on user's current location.
      getNearbyPlaces(pos);

      //get country Name
      getLocationDetails(pos);
    }, () => {
      // Browser supports geolocation, but user has denied permission
      handleLocationError(true, infoWindow);
    });
  } else {
    // Browser doesn't support geolocation
    handleLocationError(false, infoWindow);
  }
}

// Handle a geolocation error
function handleLocationError(browserHasGeolocation, infoWindow) {
  
  // Set default location to ACT, Australia
  pos = { lat: -35.2809, lng: 149.1300 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 15
  });

  // Display an InfoWindow at the map center
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Geolocation permissions denied. Using default location.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
  currentInfoWindow = infoWindow;

  //get country Name for default lat and long
  getLocationDetails(pos);
}

// Perform a Places Nearby Search Request
// Uses places.api
function getNearbyPlaces(position) {
  let request = {
    location: position,
    rankBy: google.maps.places.RankBy.DISTANCE,
    types: ['hospital']
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, nearbyCallback);
}

// Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results);
  }
}

// Set markers at the location of each place result
function createMarkers(places) {
  places.forEach(place => {
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name
    });

    // Adjust the map bounds to include the location of this marker
    bounds.extend(place.geometry.location);
  });
  /* Once all the markers have been placed, adjust the bounds of the map to
   * show all the markers within the visible area. */
  map.fitBounds(bounds);
}

//Gets the address of the current location and updates them in HTML.
function getLocationDetails(pos){
    const KEY = "AIzaSyChrtMJGjvKuvKbA110I95MJLVM7ZgF1cA";
    const LAT = pos['lat'];
    const LNG = pos['lng'];
    let url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${LAT},${LNG}&key=${KEY}`;
    
    //Fetches the json data returned for the url.
    //Uses geocode.api
    fetch(url)
        .then(response => response.json())
        .then(data => {
        console.log(data);
        let loc = document.getElementById("location-country");
        let parts = data.results[0].address_components;
        let country;
        let state;

        document.getElementById("location-address").innerHTML +="<b>Address:</b> " + data.results[0].formatted_address;
        
        parts.forEach(part => {
            if (part.types.includes("country")) {
                //we found "country" inside the data.results[0].address_components[x].types array
                country = part.long_name;
                document.getElementById("location-country").innerHTML +="<b>Country:</b> " + country;
                
            }
            if (part.types.includes("administrative_area_level_1")) {
                //we found "state" inside the data.results[0].address_components[x].types array
                state = part.long_name;
                document.getElementById("location-state").innerHTML +="<b>State:</b> " +  state;
            }
        });

        //A call to get and update the details on the virus.
        getCasesInfo(country);
        })
        .catch(err => console.warn(err.message));
}

//The country's name is passed as input.
//Updates the HTML list items.
//Uses api
function getCasesInfo(country){

  //Building the url
    fetch("https://covid-19-data.p.rapidapi.com/country?format=json&name=" + country, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "covid-19-data.p.rapidapi.com",
            "x-rapidapi-key": "ab9724a533msh57546099ab91321p11f51fjsn699668c28c27"
        }
    })
    //Reading it in json format. 
    .then(response => response.json())
    .then(data => {
        let confirmed = data[0].confirmed;
        let recovered = data[0].recovered;
        let deaths = data[0].deaths; 
        
        //Updating the list item fields appropriately.
        document.getElementById("cases-confirmed").innerHTML += "<b>Confirmed: </b>" + confirmed;
        document.getElementById("cases-recovered").innerHTML += "<b>Recovered: </b>" + recovered;
        document.getElementById("cases-deaths").innerHTML += "<b>Deceased: </b>" + deaths;
    })
    .catch(err => {
        console.log(err);
    });
}