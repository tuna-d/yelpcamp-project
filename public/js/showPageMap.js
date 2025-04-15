mapboxgl.accessToken = mapboxToken
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: campground.geometry.coordinates,
  zoom: 10,
})

const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
  `<h5>${campground.title}</h5><p>${campground.location}</p>`
)

const marker = new mapboxgl.Marker({
  color: "#de070a",
})
  .setLngLat(campground.geometry.coordinates)
  .setPopup(popup)
  .addTo(map)
