import L from "leaflet";

export const newMarkerIcon = L.icon({
  iconUrl: "./images/new-marker.svg",
  iconSize: [44, 60],
  iconAnchor: [22, 60],
});

export const markerWithPhoto = (src) =>
  L.icon({
    iconUrl: src,
    iconSize: [56, 56],
    className: "map-marker-with-photo",
  });

export const clusterIcon = (cluster) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: count < 1000 ? count : `${Math.floor(count / 1000)}K`,
    className: "map-marker-cluster",
    iconSize: [56, 56],
  });
};
