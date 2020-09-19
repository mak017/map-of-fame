import { addRandomMarkers } from "../stubs/randomMarkersStub";

const getLocationByIp = () =>
  fetch("https://ipinfo.io/json?token=c97eec3767f442")
    .then((response) => response.json())
    .then((data) => {
      const { loc } = data;
      return loc.split(",").map((item) => +item);
    });

const getLocation = async () => {
  if (navigator.geolocation) {
    try {
      const position = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
      });
      const { latitude, longitude } = position.coords;
      return [+latitude, +longitude];
    } catch (e) {
      const location = await getLocationByIp();
      return location;
    }
  }
  return getLocationByIp();
};

export const setLocation = (map) => {
  getLocation().then((response) => {
    map.setView(response, 13);
    addRandomMarkers(map);
  });
};
