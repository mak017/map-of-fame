import L from "leaflet";

import { isActiveSearchControl } from "../../store";

export const useObserver = () => {
  const geoSearch = document.querySelector(".geosearch");
  const { body } = document;
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const classes = record?.target?.classList;
      if (classes.contains("geosearch")) {
        if (classes.contains("active")) {
          isActiveSearchControl.set(true);
          body.classList.add("geo-search-active");
          const artistSearchInput = document.getElementById(
            "artist-search-input"
          );
          artistSearchInput?.focus();
        } else {
          isActiveSearchControl.set(false);
          body.classList.remove("geo-search-active");
        }
      }

      if (classes.contains("results")) {
        if (classes.contains("active")) {
          body.classList.add("geo-search-overlay");
          L.DomEvent.disableScrollPropagation(
            document.querySelector(".geosearch .results")
          );
        } else {
          body.classList.remove("geo-search-overlay");
        }
      }
    }
  });

  observer.observe(geoSearch, { attributes: true, subtree: true });
};
