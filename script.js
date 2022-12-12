let userIp
let userLatitude = 50.4019514
let userLongitude = 30.3926091
let closeModalBtn = document.querySelector('.close-modal-btn')
let lightBtn = document.querySelector('.light-btn')
let noLightBtn = document.querySelector('.no-light-btn')
let currentClickLocation

let locations = [
  ['Kyjow', 50.4019514, 30.3926091, 'start'],
  ['esvitlo', 50.4019514, 32.3926091, '1'],
  ['nema', 50.4019514, 31.4926091, '2'],
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
  lightBtn.addEventListener('click', () => confirmLight('confirm'))

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

    let newMarker = ['nema', location.lat(), location.lng(), '88']
    locations.push(newMarker)
    var marker = new google.maps.Marker({
      position: location,
      map: map,
    })
    google.maps.event.addListener(marker, 'click', function (e) {
      var infoWindow = new google.maps.InfoWindow({
        content:
          'Latitude: ' + location.lat() + '<br />Longitude: ' + location.lng(),
      })
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
    var title = locations[i][0]
    var lat = locations[i][1]
    var long = locations[i][2]
    var text = locations[i][3]

    mark_position = new google.maps.LatLng(lat, long) // Создаем позицию для отметки

    marker = new google.maps.Marker({
      // Что будет содержаться в отметке
      map: map, // К какой карте относиться отметка
      title: title, // Заголовок отметки
      position: mark_position, // Позиция отметки
      animation: google.maps.Animation.DROP, // Анимация
      icon: '', // Можно поменять иконку, если оставить пустые скобки, то будет оригинальная иконка
    })

    // Дальше создаем контент для каждой отметки

    var content =
      '<div class="info-block"><h3>' +
      title +
      '</h3><b>' +
      'Address: </b>' +
      text +
      '</div>'
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
