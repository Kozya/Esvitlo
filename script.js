let userIp
let userLatitude = 50.4019514
let userLongitude = 30.3926091
let closeModalBtn = document.querySelector('.close-modal-btn')
let lightBtn = document.querySelector('.light-btn')
let noLightBtn = document.querySelector('.no-light-btn')
let currentClickLocation
let temlateInfoWindow

let locations = [
  {
    anyLight: true,
    lat: 50.4019514,
    lng: 30.3926091,
    date: moment().format('MMMM Do YYYY, h:mm:ss a'),
  },
  {
    anyLight: false,
    lat: 50.6019514,
    lng: 30.6926091,
    date: moment().format('MMMM Do YYYY, h:mm:ss a'),
  },
]

fetch('https://ipapi.co/json/')
  .then((data) => data.json())
  .then((data) => {
    console.log(data)
    userIp = data.ip
    userLatitude = data.latitude
    userLongitude = data.longitude
  })

google.maps.event.addDomListener(window, 'load', init)

function init() {
  let myOptions = {
    center: new google.maps.LatLng(userLatitude, userLongitude), // Координаты, какое место отображать на карте
    zoom: 9, // Уровень риближения карты
    mapTypeId: google.maps.MapTypeId.ROADMAP, // Тип карты
  }
  let map = new google.maps.Map(
    document.getElementById('map'), // В каком блоке будет отображаться карта
    myOptions,
  )
  setMarkers(map, locations)

  //Добавить новый маркер
  google.maps.event.addListener(map, 'click', function (e) {
    openModal(e)
  })

  closeModalBtn.addEventListener('click', closeModal)
  lightBtn.addEventListener('click', () => confirmLight('lightOn'))
  noLightBtn.addEventListener('click', () => confirmLight('lightOff'))

  function openModal(e) {
    document.querySelector('.confirm-modal').classList.add('modal-is-open')
    currentClickLocation = e
  }

  function closeModal() {
    document.querySelector('.confirm-modal').classList.remove('modal-is-open')
  }

  function changeMarkerStatus(index, locations, marker, location) {
    let changedMarker = {};
    changedMarker.anyLight = !locations[index].anyLight;
    changedMarker.lat = location.lat();
    changedMarker.lng = location.lng();
    changedMarker.date = moment().format('MMMM Do YYYY, h:mm:ss a');
    marker.setMap(null);
    locations[index] = changedMarker;
    setMarkers(map, locations)
  }

  function confirmLight(confirmStatus) {
    let location = currentClickLocation.latLng
    let newMarker
    if (confirmStatus === 'lightOn') {
      newMarker = {
        anyLight: true,
        lat: location.lat(),
        lng: location.lng(),
        date: moment().format('MMMM Do YYYY, h:mm:ss a'),
      }
    } else {
      newMarker = {
        anyLight: false,
        lat: location.lat(),
        lng: location.lng(),
        date: moment().format('MMMM Do YYYY, h:mm:ss a'),
      }
    }

    locations.push(newMarker)
    let marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: `${newMarker.anyLight ? './icons/lamp-on.png' : './icons/lamp-off.png'
        }`,
    })
    google.maps.event.addListener(marker, 'click', function (e) {
      console.log(marker)
      console.log(location)

      locations.forEach((loc, i) => {
        if (loc.lat == location.lat() && loc.lng == location.lng()) {
          temlateInfoWindow = `${loc.anyLight ? 'свет есть' : 'света нет'} <br/>
            отметка сделана : ${loc.date} <br/>
            <button class='change-satus-btn' data-index='${i}'>Изменить</button>`;

          setTimeout(() => {
            document.querySelector('.change-satus-btn').addEventListener('click', () => changeMarkerStatus(i, locations, marker, location))
          }, 1);
        }
      })

      let infoWindow = new google.maps.InfoWindow({
        content: temlateInfoWindow,
      })
      console.log(temlateInfoWindow)
      infoWindow.open(map, marker)
    })
    closeModal();
  }
}


function setMarkers(map, locations) {
  let marker, i, mark_position
  for (i = 0; i < locations.length; i++) {
    // Проходимся по нашему массиву с марками
    let anyLight = locations[i].anyLight
    let lat = locations[i].lat
    let long = locations[i].lng
    let date = locations[i].date

    mark_position = new google.maps.LatLng(lat, long) // Создаем позицию для отметки

    marker = new google.maps.Marker({
      // Что будет содержаться в отметке
      map: map, // К какой карте относиться отметка
      position: mark_position, // Позиция отметки
      icon: `${anyLight ? './icons/lamp-on.png' : './icons/lamp-off.png'}`, // Можно поменять иконку, если оставить пустые скобки, то будет оригинальная иконка
    })

    // Дальше создаем контент для каждой отметки

    let content = `${anyLight ? 'свет есть' : 'света нет'} <br/>
    отметка сделана : ${date} <br/>
    <button class='change-marker-satus-btn' data-index='${i}'>Изменить</button>
    `;
    let infowindow = new google.maps.InfoWindow();

    // При нажатии на марку, будет отображаться контент

    google.maps.event.addListener(
      marker,
      'click',
      (function (marker, content, infowindow) {
        return function () {
          infowindow.setContent(content)
          infowindow.open(map, marker)
        }
      })(marker, content, infowindow),
    )
  }
}
