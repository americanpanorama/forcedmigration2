import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

import Inmigrations from '../../data/inmigrations.json';
import HexesProjected from '../../data/hexesProjected.json';
import States from '../../data/states.json';

import DimensionsStore from './DimensionsStore';


const PlacesStore = {

  data: {
    hexesProjected: HexesProjected,
    states: States,
    inmigrations: Inmigrations.rows,
    stateTotals: {},

    hexesParsed: false,
    stateTotalsParsed: false,
  },

  parseHexesProjected() {
    this.data.hexesProjected = this.data.hexesProjected.map(hex => {
      hex.cx = hex.cx * DimensionsStore.getMapScale() + DimensionsStore.getMapWidth() / 2;
      hex.cy = hex.cy * DimensionsStore.getMapScale() + DimensionsStore.getMapHeight() / 2;
      return hex;
    });

    this.data.hexesParsed = true;
  },

  parseStateTotals() {
    let organized = {};

    this.data.inmigrations.forEach(countyInmigrations => {
      organized[countyInmigrations.year] = organized[countyInmigrations.year] || {};
      organized[countyInmigrations.year][countyInmigrations.state] = organized[countyInmigrations.year][countyInmigrations.state] || { inmigrations: 0, outmigrations: 0, net: 0 };
      organized[countyInmigrations.year][countyInmigrations.state].net += countyInmigrations.inmigrations;
      if (countyInmigrations.inmigrations > 0) {
        organized[countyInmigrations.year][countyInmigrations.state].inmigrations += countyInmigrations.inmigrations;
      } else {
        organized[countyInmigrations.year][countyInmigrations.state].outmigrations -= countyInmigrations.inmigrations;
      }
    });

    // now reorganize as list
    Object.keys(organized).forEach(year => {
      this.data.stateTotals[year] = [];
      Object.keys(organized[year]).forEach(state => {
        this.data.stateTotals[year].push({
          state: state,
          inmigrations: organized[year][state].inmigrations,
          outmigrations: organized[year][state].outmigrations,
          net: organized[year][state].net
        });
      });

    });

    this.data.stateTotalsParsed = true;
  },

  getHexesProjected() { return this.data.hexesProjected; },

  getStateBoundariesForDecade(decade) {
    return {
      type: "FeatureCollection",
      features: this.data.states.features.filter(s => parseInt(s.properties.year) == parseInt(decade))
    };
  },

  getStateTotals() { return this.data.stateTotals; },

  getStateTotalsForDecade(decade) { 

    const labelHeight = 22,
      rowHeight = 20,
      theMax = 125000;

    var runningOffset = 0;

    let statesData = this.data.stateTotals[decade]
      .filter(sd => sd.inmigrations + sd.outmigrations >= 600)
      .sort((a,b) => b.net - a.net)
      .map((sd, i) => {
        sd.y = rowHeight * i;
        sd.widthInmigrations = DimensionsStore.getBarChartBarWidth() * sd.inmigrations/theMax;
        sd.widthOutmigrations = DimensionsStore.getBarChartBarWidth() * sd.outmigrations/theMax;
        sd.xOutmigrations = DimensionsStore.getBarChartDividerX() - sd.widthOutmigrations;
        sd.xInmigrations = DimensionsStore.getBarChartDividerX();
        
        return sd;
      });

    return statesData;

        
      

      
  },

  hexesParsed() { return this.data.hexesParsed; },

  stateTotalsParsed() { return this.data.hexesParsed; },


};

// Mixin EventEmitter functionality
Object.assign(PlacesStore, EventEmitter.prototype);

// Register callback to handle all updates
PlacesStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case AppActionTypes.parseData:
    DataStore.setSelected(action.id, action.office, action.visits, action.lat, action.lng);
    break;
  case AppActionTypes.officeholderSelected:
    DataStore.setSelected(action.id, action.office);
    break;
  case AppActionTypes.visitsSelected:
    DataStore.setSelectedVisits(action.ids);
    break;
  case AppActionTypes.visitsInspected:
    DataStore.setInspectingVisits(action.ids);
    break;
  }
  return true;
});

export default PlacesStore;