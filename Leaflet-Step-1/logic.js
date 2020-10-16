// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.info(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

let domainMin = -10;
let domainMax = 40;
let scale = chroma.scale(['limegreen','yellow','red']).domain([domainMin, domainMax]);


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake 
  function onEachFeature2(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "</h3><hr><p>Magnitude: " + feature.properties.mag + "</p>" +
      "</h3><hr><p>Depth:" + feature.geometry.coordinates[2] + "</p>");
  }
 
  function makeCircle(geoJsonPoint, latlng) {
    let radius = geoJsonPoint.properties.mag * 4;
    let fill = scale(latlng.alt).hex();
    let opts = {
      radius: radius,
      opacity: 1,
      fillOpacity: 1,
      color: "#000000",
      fillColor: fill,
      weight: 1,
    };
    let marker = L.circleMarker(latlng, opts);
    return marker;
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature2,
    pointToLayer: makeCircle,
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("mapid", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
  });

  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }).addTo(myMap);

myMap.addLayer(earthquakes)
var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'legend');
      var legendInfo = "<h3>Depth</h3>";

      div.innerHTML = legendInfo;
      var labels = [];

      for(var i = domainMin; i <= domainMax; i += 10) {
        labels.push(`<li style="background-color: ${scale(i).hex()}">${i}</li>`);

      }
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";

    return div;
};
legend.addTo(myMap);

}

