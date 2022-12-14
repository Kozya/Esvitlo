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
  var myOptions = {
    center: new google.maps.LatLng(userLatitude, userLongitude), // Координаты, какое место отображать на карте
    zoom: 9, // Уровень риближения карты
    mapTypeId: google.maps.MapTypeId.ROADMAP, // Тип карты
  }
  var map = new google.maps.Map(
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
    console.log(e)
    currentClickLocation = e
  }

  function closeModal() {
    document.querySelector('.confirm-modal').classList.remove('modal-is-open')
  }

  function confirmLight(confirmStatus) {
    var location = currentClickLocation.latLng
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
    var marker = new google.maps.Marker({
      position: location,
      map: map,
      animation: google.maps.Animation.DROP,
      icon: `${
        newMarker.anyLight ? './icons/lamp-on.png' : './icons/lamp-off.png'
      }`,
    })
    google.maps.event.addListener(marker, 'click', function (e) {
      console.log(marker)
      console.log(location)

      locations.forEach((loc) => {
        if (loc.lat == location.lat() && loc.lng == location.lng()) {
          temlateInfoWindow = `${loc.anyLight ? 'свет есть' : 'света нет'} <br/>
            отметка сделана : ${loc.date}
            `
        }
      })

      var infoWindow = new google.maps.InfoWindow({
        content: temlateInfoWindow,
      })
      console.log(temlateInfoWindow)
      infoWindow.open(map, marker)
    })
    closeModal()
  }
}

function setMarkers(map, locations) {
  var marker, i, mark_position
  for (i = 0; i < locations.length; i++) {
    // Проходимся по нашему массиву с марками

    // Тут вроде и так все понятно
    var anyLight = locations[i].anyLight
    var lat = locations[i].lat
    var long = locations[i].lng
    var date = locations[i].date

    mark_position = new google.maps.LatLng(lat, long) // Создаем позицию для отметки

    marker = new google.maps.Marker({
      // Что будет содержаться в отметке
      map: map, // К какой карте относиться отметка
      position: mark_position, // Позиция отметки
      animation: google.maps.Animation.DROP, // Анимация
      icon: `${anyLight ? './icons/lamp-on.png' : './icons/lamp-off.png'}`, // Можно поменять иконку, если оставить пустые скобки, то будет оригинальная иконка
    })

    // Дальше создаем контент для каждой отметки

    var content = `${anyLight ? 'свет есть' : 'света нет'} <br/>
    отметка сделана : ${date}
    `
    var infowindow = new google.maps.InfoWindow()

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
