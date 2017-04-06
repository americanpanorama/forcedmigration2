import AppDispatcher from './AppDispatcher';

export const AppActionTypes = {

  parseData: 'parseData',
  storeChanged: 'storeChanged',
  officeholderSelected: 'officeholderSelected',
  visitsSelected: 'visitsSelected',
  visitsInspected: 'visitsInspected',
  windowResized: 'windowResized'

};

export const AppActions = {

  parseData: (id, office, visits) => {
    AppDispatcher.dispatch({
      type: AppActionTypes.parseData,
      id: id,
      office: office,
      visits: visits
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
  }

};
