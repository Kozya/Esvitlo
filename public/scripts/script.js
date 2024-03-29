let userIp;

let userLatitude;
let userLongitude;



function getLocation() {
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

function successCallback(position) {
  userLatitude = position.coords.latitude;
  userLongitude = position.coords.longitude;

  getUserData(userLatitude, userLongitude);
}

function errorCallback(error) {
  console.log(error);
}

let closeModalBtn = document.querySelector('.close-modal-btn');
let lightBtn = document.querySelector('.light-btn');
let noLightBtn = document.querySelector('.no-light-btn');
let currentClickLocation;
let temlateInfoWindow;
let map;
let markers = [];
moment.locale('ua');

let locations = [];

function addMarker(marker) {
  fetch('/add-marker', {
    method: 'POST',
    body: JSON.stringify(marker),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.json())
    .then((data) => {
      locations[locations.length - 1]._id = data._id;
    })
}

function getAllMarkers() {
  fetch('/get-all-markers', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((data) => {
      locations = data;
      getUserData(userLatitude, userLongitude);
    })
}

function getUserData(userLatitude, userLongitude) {
  fetch('https://ipapi.co/json/')
    .then((data) => data.json())
    .then((data) => {
      userIp = data.ip;

      if (!userLatitude) {
        userLatitude = data.latitude
        userLongitude = data.longitude
      }
      init(userLatitude, userLongitude);
    })
}

function changeMarkerStatus(index, locations, marker, location, changed) {

  let markerId = locations[index]._id;

  for (i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];

  let changedMarker = {};
  changedMarker.anyLight = !locations[index].anyLight;
  if (changed) {
    changedMarker.lat = location.lat;
    changedMarker.lng = location.lng;
  } else {
    changedMarker.lat = location.lat();
    changedMarker.lng = location.lng();
  }

  changedMarker.date = moment().format('DD.MM.YY, HH:mm');
  changedMarker._id = markerId;

  marker.setMap(null);
  locations[index] = changedMarker;
  setMarkers(map, locations);

  fetch(`/change-marker-status/${markerId}`, {
    method: 'PUT',
    body: JSON.stringify(changedMarker),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((res) => res.json())
    .then((data) => {

    })
}

function closeModal() {
  document.querySelector('.confirm-modal').classList.remove('modal-is-open');
}

function confirmLight(confirmStatus) {
  let location = currentClickLocation.latLng;
  let newMarker;
  if (confirmStatus === 'lightOn') {
    newMarker = {
      anyLight: true,
      lat: location.lat(),
      lng: location.lng(),
      date: moment().format('DD.MM.YY, HH:mm'),
    }
  } else {
    newMarker = {
      anyLight: false,
      lat: location.lat(),
      lng: location.lng(),
      date: moment().format('DD.MM.YY, HH:mm'),
    }
  }

  locations.push(newMarker);

  mark_position = new google.maps.LatLng(newMarker.lat, newMarker.lng);

  let marker = new google.maps.Marker({
    position: mark_position,
    map: map,
    icon: `${newMarker.anyLight ? '../public/icons/lamp-on.png' : '../public/icons/lamp-off.png'
      }`,
  })
  markers.push(marker)

  google.maps.event.addListener(marker, 'click', function (e) {
    locations.forEach((loc, i) => {
      if (loc.lat == location.lat() && loc.lng == location.lng()) {
        temlateInfoWindow = `<p class='info-window-title'>${loc.anyLight ? 'Світло є !' : 'Світла нема :('}</p>
         <p class='info-window-date'> Відмітка зроблена : ${loc.date} </p>
          <button class='change-satus-btn' data-index='${i}'>Змінити відмітку</button>`;
        setTimeout(() => {
          let index = document.querySelector('.change-satus-btn').getAttribute('data-index')
          document.querySelector('.change-satus-btn').addEventListener('click', () => changeMarkerStatus(index, locations, marker, location, false));
        }, 1);
      }
    })

    let infoWindow = new google.maps.InfoWindow({
      content: temlateInfoWindow,
    })
    infoWindow.open(map, marker);
  })
  addMarker(newMarker);
  closeModal();
}
function initAutocomplete(map) {
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });
    let markers = [];

    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();

      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }

        const icon = {
          url: place.icon,
          size: new google.maps.Size(25, 25),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };

        // Create a marker for each place.
        markers.push(
          new google.maps.Marker({
            map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        );
        let marker = markers[0];
         google.maps.event.addListener(marker,'click', function (e) {
            document.querySelector('.confirm-modal').classList.add('modal-is-open');
            currentClickLocation = e;
            markers.forEach((marker) => {
              marker.setMap(null);
            });
            markers = [];
        })

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
    setTimeout(() => {
      input.style.display='block';
    }, 500);
    
    
}

function init(userLatitude, userLongitude) {

  let myOptions = {
    center: new google.maps.LatLng(userLatitude, userLongitude),
    zoom: 14,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  }
  map = new google.maps.Map(
    document.getElementById('map'),
    myOptions,
  )
  setMarkers(map, locations);

  google.maps.event.addListener(map, 'click', function (e) {
    openModal(e);
  })

  closeModalBtn.addEventListener('click', closeModal);
  // lightBtn.addEventListener('click', () => confirmLight('lightOn'));
  // noLightBtn.addEventListener('click', () => confirmLight('lightOff'));

  function openModal(e) {
    document.querySelector('.confirm-modal').classList.add('modal-is-open');
    currentClickLocation = e;
  }

  function closeModal() {
    document.querySelector('.confirm-modal').classList.remove('modal-is-open');
  }
  setTimeout(() => {
    initAutocomplete(map) 
  }, 1000);

   
}

function setMarkers(map, locations) {

  let marker, i, mark_position
  for (i = 0; i < locations.length; i++) {
    let anyLight = locations[i].anyLight;
    let lat = locations[i].lat;
    let long = locations[i].lng;
    let date = locations[i].date;

    mark_position = new google.maps.LatLng(lat, long);
    marker = new google.maps.Marker({
      map: map,
      position: mark_position,
      icon: `${anyLight ? '../public/icons/lamp-on.png' : '../public/icons/lamp-off.png'}`,
    });
    markers.push(marker)

    let content = `<p class='info-window-title'>${anyLight ? 'Світло є !' : 'Світла нема :('}</p>
           <p class='info-window-date'> Відмітка зроблена : ${date} </p>
            <button class='change-satus-btn' data-index='${i}'>Змінити відмітку</button>`;
    let infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(
      marker,
      'click',
      (function (marker, content, infowindow) {
        return function () {
          infowindow.setContent(content)
          infowindow.open(map, marker)
          setTimeout(() => {
            let index = document.querySelector('.change-satus-btn').getAttribute('data-index')
            document.querySelector('.change-satus-btn').addEventListener('click', () => changeMarkerStatus(index, locations, marker, locations[index], true))
          }, 100);
        }
      })(marker, content, infowindow),
    )
  }
}

getAllMarkers();