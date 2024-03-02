
// Create a Leaflet map instance
const map = L.map('map').setView([52.0411, -2.3784], 16);

// Add a tile layer to the map
new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);

// Fetch the data from data.json
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {icon: new L.DivIcon({html: feature.properties.name})});
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error('Error:', error);
    });