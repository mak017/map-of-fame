import { derived, writable } from "svelte/store";

import { getCurrentYear } from "./utils/commonUtils";

import { DEFAULT_ZOOM } from "./constants";

export const isInitialized = writable(false);
export const isPermalinkReady = writable(false);
export const isUserVerifyProgress = writable(false);
export const isLoggedIn = writable(false);
export const globalGoto = writable(null);
export const map = writable(null);
export const currentZoom = writable(DEFAULT_ZOOM);
export const selectedYear = writable(`${getCurrentYear()}`);
export const selectedArtist = writable("");
export const selectedCrew = writable("");
export const openedMarkerData = writable(null);
export const editSpotData = writable({});
export const markersStore = writable({});
export const userData = writable({});
export const countriesList = writable([]);
export const settings = writable({});
export const categoriesList = writable([]);
export const firms = writable([]);
export const userCategories = writable([]);
export const isLoading = writable(false);
export const mapBounds = writable([]);
export const areaSelection = writable(null);
export const areaSpots = writable(null);
export const areaCoords = writable([]);
export const clusterSpots = writable(null);
export const selectedUserProfileData = writable({});
export const searchControl = writable(null);
export const isActiveSearchControl = writable(false);
export const isShowOnMapMode = writable(false);
export const isAreaSelectionActive = writable(false);
export const isSpotsFromAreaLoading = writable(false);
export const isFirstTimeVisit = writable(false);
export const shouldShowAddSpot = writable(null);
export const shouldShowResetPassword = writable(false);
export const resetPasswordToken = writable(null);

export const defaultUserTypeFilters = derived(userData, ($userData) => ({
  withHunters: true,
  withNewbies: $userData.isNewbie,
}));

const createProfileState = () => {
  const initialState = {
    offset: 0,
    scrollOffset: 0,
    spotsList: [],
    currentYear: undefined,
    sortBy: "created_at",
    yearsToApply: [],
    invites: [],
    user: {},
    isInitialized: false,
    isLoading: true,
    isShowSpinner: true,
    hasMore: false,
  };
  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setOffset: (offset) => update((state) => ({ ...state, offset })),
    setScrollOffset: (offset) =>
      update((state) => ({ ...state, scrollOffset: offset })),
    setSpotsList: (spotsList) => update((state) => ({ ...state, spotsList })),
    setCurrentYear: (currentYear) =>
      update((state) => ({ ...state, currentYear })),
    setYearsToApply: (yearsToApply) =>
      update((state) => ({ ...state, yearsToApply })),
    setInvites: (invites) => update((state) => ({ ...state, invites })),
    setUser: (user) => update((state) => ({ ...state, user })),
    setSorting: (sortBy) => update((state) => ({ ...state, sortBy })),
    setIsInitialized: (value) =>
      update((state) => ({ ...state, isInitialized: value })),
    setIsLoading: (value) =>
      update((state) => ({ ...state, isLoading: value })),
    setIsShowSpinner: (value) =>
      update((state) => ({ ...state, isShowSpinner: value })),
    setHasMore: (value) => update((state) => ({ ...state, hasMore: value })),
    reset: () => set(initialState),
  };
};

const createSearchState = () => {
  const initialState = {
    offset: 0,
    scrollOffset: 0,
    list: [],
    grid: [],
    gridTotal: 0,
    currentView: "list",
    isFetched: false,
    isLoading: true,
    isShowSpinner: true,
    hasMore: false,
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    setOffset: (offset) => update((state) => ({ ...state, offset })),
    setScrollOffset: (offset) =>
      update((state) => ({ ...state, scrollOffset: offset })),
    setList: (list) => update((state) => ({ ...state, list })),
    setGrid: (grid) => update((state) => ({ ...state, grid })),
    setGridTotal: (gridTotal) => update((state) => ({ ...state, gridTotal })),
    setCurrentView: (currentView) =>
      update((state) => ({ ...state, currentView })),
    setIsFetched: (isFetched) => update((state) => ({ ...state, isFetched })),
    setIsLoading: (value) =>
      update((state) => ({ ...state, isLoading: value })),
    setIsShowSpinner: (value) =>
      update((state) => ({ ...state, isShowSpinner: value })),
    setHasMore: (value) => update((state) => ({ ...state, hasMore: value })),
    reset: () => set(initialState),
  };
};

export const profileState = createProfileState();
export const searchState = createSearchState();
