import L from "leaflet";

export const newMarkerIcon = L.icon({
  iconUrl: "./images/new-marker.svg",
  iconSize: [44, 60],
  iconAnchor: [22, 60],
});

export const markerWithPhoto = (src, id) =>
  L.icon({
    iconUrl: src,
    iconSize: [56, 56],
    className: `map-marker-with-photo marker-id-${id}`,
  });

export const clusterIcon = (cluster) => {
  const markers = cluster.getAllChildMarkers();
  let count = 0;
  const hasAdditionalCategory = markers.some(
    (marker) => typeof marker.isAdditionalCategory === "boolean"
  );
  if (markers[0].count) {
    markers.forEach((m) => {
      count += m.count ?? 0;
    });
  }
  if (hasAdditionalCategory) {
    markers.forEach((m) => {
      if (!m.isAdditionalCategory) {
        count += 1;
      }
    });
  }
  if (Number.isNaN(count) || (count === 0 && !hasAdditionalCategory)) {
    count = cluster.getChildCount();
  }
  if (count !== 0) {
    return L.divIcon({
      html: count < 1000 ? count : `${Math.floor(count / 1000)}K`,
      className: "map-marker-cluster",
      iconSize: [56, 56],
    });
  }
  return L.divIcon({
    html: "",
    iconSize: [0, 0],
  });
};

export const markerClusterIcon = (count) =>
  L.divIcon({
    html: count < 1000 ? count : `${Math.floor(count / 1000)}K`,
    className: "map-marker-cluster",
    iconSize: [56, 56],
  });
