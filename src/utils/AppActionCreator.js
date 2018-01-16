import AppDispatcher from './AppDispatcher';

export const AppActionTypes = {

  parseData: 'parseData',
  loadInitialData: 'loadInitialData',
  storeChanged: 'storeChanged',
  officeholderSelected: 'officeholderSelected',
  visitsSelected: 'visitsSelected',
  visitsInspected: 'visitsInspected',
  windowResized: 'windowResized',
  mapMoved: 'mapMoved',

};

export const AppActions = {

  parseData: (id, office, visits, lat, lng) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.parseData,
      id: id,
      office: office,
      visits: visits,
      lat: lat,
      lng: lng
    });
  },

  loadInitialData: (state, hashState) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.loadInitialData,
      state: state,
      hashState: hashState
    });
  },

  officeholderSelected: (id, office) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.officeholderSelected,
      id: id,
      office: office
    });
  },

  visitsSelected: (ids) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.visitsSelected,
      ids: ids
    });
  },

  visitsInspected: (ids) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.visitsInspected,
      ids: ids
    });
  },

  windowResized: () => {
    AppDispatcher.dispatch({
      type: AppActionTypes.windowResized
    });
  },

  /**
   * Dispatch action when map is zoomed or panned.
   * @param {Object} mapState   { zoom, center: { lat, lng } }
   */
  mapMoved: (x,y,z) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.mapMoved,
      x: x,
      y: y,
      z: z
    });
  },

};
