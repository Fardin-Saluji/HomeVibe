console.log("Listing data:", listingData);

// ❌ Do NOT try to load map if coordinates are missing
if (
  !listingData.geometry ||
  !listingData.geometry.coordinates ||
  listingData.geometry.coordinates.length === 0
) {
  console.log("❌ No coordinates found — map not rendered");
} else {
  mapboxgl.accessToken = mapToken;

  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v11",
    center: listingData.geometry.coordinates,
    zoom: 9,
  });

  new mapboxgl.Marker({ color: "red" })
    .setLngLat(listingData.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${listingData.title}</h4>
         <p>Exact location will be provided after booking</p>`
      )
    )
    .addTo(map);
}
  
