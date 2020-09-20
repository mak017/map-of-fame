const getMapLocation = (zoom, center) => {
  let newZoom = zoom;
  let newCenter = center;

  if (window.location.hash !== "") {
    let hash = window.location.hash.replace("#", "");
    let parts = hash.split(",");
    if (parts.length === 3) {
      newCenter = {
        lat: parseFloat(parts[0]),
        lng: parseFloat(parts[1]),
      };
      newZoom = parseInt(parts[2].slice(0, -1), 10);
    }
  }
  return newZoom && newCenter ? { zoom: newZoom, center: newCenter } : null;
};
const setup = (map) => {
  let shouldUpdate = true;
  const updatePermalink = () => {
    if (!shouldUpdate) {
      // do not update the URL when the view was changed in the 'popstate' handler (browser history navigation)
      shouldUpdate = true;
      return;
    }

    let center = map.getCenter();
    let hash =
      "#" +
      Math.round(center.lat * 100000) / 100000 +
      "," +
      Math.round(center.lng * 100000) / 100000 +
      "," +
      map.getZoom() +
      "z";
    let state = {
      zoom: map.getZoom(),
      center: center,
    };
    window.history.pushState(state, "map", hash);
  };

  map.on("moveend", updatePermalink);

  // restore the view state when navigating through the history, see
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
  const popStateHandler = (event) => {
    if (event.state === null) {
      return;
    }
    map.setView(event.state.center, event.state.zoom);
    shouldUpdate = false;
  };
  window.addEventListener("popstate", popStateHandler);
};

export const permalink = {
  // gets the map center, zoom-level and rotation from the URL if present, else uses default values
  getMapLocation,

  setup,
};
