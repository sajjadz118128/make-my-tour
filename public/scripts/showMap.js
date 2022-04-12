mapboxgl.accessToken = token;
const workingCampground = JSON.parse(campground);
var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: workingCampground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9 // starting zoom
});
map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(workingCampground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${workingCampground.title}</h3>`
            )
    )
    .addTo(map);