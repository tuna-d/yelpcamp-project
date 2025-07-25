mapboxgl.accessToken = mapboxToken
const settings = {
  mobileView: {
    center: [-103.5917, 40.6699],
    zoom: 2,
  },
  desktopView: {
    center: [-103.5917, 40.6699],
    zoom: 3,
  },
}

const isMobileView = window.innerWidth <= 767
const mapSettings = isMobileView ? settings.mobileView : settings.desktopView

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v11",
  center: mapSettings.center,
  zoom: mapSettings.zoom,
})

map.on("load", () => {
  map.addSource("campgrounds", {
    type: "geojson",
    data: campgrounds,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50,
  })

  map.addLayer({
    id: "clusters",
    type: "circle",
    source: "campgrounds",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#00B4D8",
        10,
        "#0077B6",
        30,
        "#03045E",
      ],
      "circle-radius": ["step", ["get", "point_count"], 20, 10, 26, 30, 32],
    },
  })

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    source: "campgrounds",
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#FFFFFF",
    },
  })

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    source: "campgrounds",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#11b4da",
      "circle-radius": 8,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  })

  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    })
    const clusterId = features[0].properties.cluster_id
    map
      .getSource("campgrounds")
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        })
      })
  })

  map.on("click", "unclustered-point", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice()
    const { popUpMark } = e.features[0].properties
    if (["mercator", "equirectangular"].includes(map.getProjection().name)) {
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }
    }

    new mapboxgl.Popup().setLngLat(coordinates).setHTML(popUpMark).addTo(map)
  })

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer"
  })
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = ""
  })
})

map.addControl(new mapboxgl.NavigationControl())
