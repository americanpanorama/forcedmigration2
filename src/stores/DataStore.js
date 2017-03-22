import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import OceansJson from '../../data/oceans.json';
import DestinationsJson from '../../data/destinations.json';
import PresidentialTerms from '../../data/terms.json';
import Regions from '../../data/regions.json';
import * as topojson from 'topojson';

const DataStore = {

  data: {
    firstYear: 1905,
    startDate: '1905-01-01',
    endDate: '2016-12-12',
    years: [...Array(112).keys()].map(num => num+1905),
    tau: 2 * Math.PI,
    zoomFactor: 3,
    daysDuration: 40907 // this._dateDiff('1905-01-01', '2016-12-31'),
  },


  getOceanPolygons: function() {
    return OceansJson.features;
  },

  getRegionsPolygons: function() {
    return Regions.features;
  },

  getPresidentialTerms: function() {
    return PresidentialTerms;
  },

  getDestinations: function() {
    return DestinationsJson.features;
  },

  getTerm: function(id) {

    let took_office = (PresidentialTerms.filter(presidency => presidency.number == id)[0].took_office > this.data.startDate) ? PresidentialTerms.filter(presidency => presidency.number == id)[0].took_office : this.data.startDate,
      left_office = (PresidentialTerms.filter(presidency => presidency.number == id)[0].left_office < this.data.endDate) ? PresidentialTerms.filter(presidency => presidency.number == id)[0].left_office : this.data.endDate; 
    return [took_office, left_office];
  },

  getDaysDurationUnselected: function(selectedId) {
    return this.data.daysDuration - this.getDurationofPresidency(selectedId);
  },

  getDestinationsForPresidency: function(id) {
    let term = this.getTerm(id);
    return DestinationsJson.features.filter(destination => destination.properties.date_convert >= term[0] && destination.properties.date_convert <= term[1]);
  },

  getDurationofPresidency: function(id) {
    return this._dateDiff(...this.getTerm(id));
  },

  getPresidencyPercent: function(id) {
    return this.getDurationofPresidency(id) / this.data.daysDuration;
  },

  getPresidencyPercentWithSelected: function(id, selectedId) {
    let adjustedDuration = this.data.daysDuration + (this.data.zoomFactor - 1) * this.getDurationofPresidency(selectedId);
    return (id !== parseInt(selectedId)) ? this.getDurationofPresidency(id) / adjustedDuration : this.getDurationofPresidency(id) / adjustedDuration * this.data.zoomFactor;
  },

  getDestinationsByRegion: function() {
    let theData = {};
    DestinationsJson.features.forEach(destination => {
      let year = destination.properties.date_convert.substring(0,4),
        region = destination.properties.new_region.replace(/ /g,'').toLowerCase();
      theData[year] = (theData[year]) ? theData[year] : {
        canada: 0,
        westerneurope: 0,
        easterneuropeandcentralasia: 0,
        latinamerica: 0,
        middleeast: 0,
        eastasia: 0,
        africa: 0,
        southasia: 0,
        oceania: 0
      };
      theData[year][region] += 1;
    });

    return theData;
  },

  getDestinationsByYear: function() {
    let theData = [];
    DestinationsJson.features.forEach(destination => {
      let year = parseInt(destination.properties.date_convert.substring(0,4)),
        region = destination.properties.new_region.replace(/ /g,'').toLowerCase(),
        continentData = theData.filter(continent => continent.key == region);
      if (continentData.length == 0) {
        theData.push({
          key: region,
          values: [ { 
            region: destination.properties.new_region,
            year: year,
            visits: 1
          } ]
        });
      } else {
        let continentYearData = continentData[0].values.filter(yearData => yearData.year == year);
        if (continentYearData.length == 0) {
          continentData[0].values.push({ 
            region: destination.properties.new_region,
            year: year,
            visits: 1
          });
        } else {
          continentYearData[0].visits += 1;
        }
        
      }
    });

    // add missing dates
    theData.forEach(regionData => {
      let region = regionData.values[0].region;
      this.data.years.forEach(year => {
        let regionYearData = regionData.values.filter(yearData => yearData.year == year);
        if (regionYearData.length == 0) {
          regionData.values.push({ 
            region: region,
            year: year,
            visits: 0
          });
        }
      });

      // sort
      regionData.values.sort((a,b) => a.year - b.year);      
    });



    return theData;
  },

  getPresidencyArcRadians: function(id, selectedId) {
    let unselectedPercent = this.getDurationofPresidency(id) / this.getDaysDurationUnselected(selectedId);
    return unselectedPercent * Math.PI;
  },

  getDateRotation: function(date) {
    date = (date > this.data.startDate) ? date : this.data.startDate;
    return this._dateDiff(this.data.startDate, date) / this.data.daysDuration * 360;
  },

  getPresidentialData(id) {
    return PresidentialTerms.filter(presidency => presidency.number == id)[0];
  },

  getDateRotationSelected: function(date, selectedId) {
    let lastSelectedDate = PresidentialTerms.filter(presidency => presidency.number == selectedId)[0].left_office;
    if (date >= lastSelectedDate) {
      return 90 + this._dateDiff(lastSelectedDate, date) / this.getDaysDurationUnselected(selectedId) * 180;
    } else {
      return this.getDateRotationSelected(this.data.endDate, selectedId) + this._dateDiff(this.data.startDate, date) / this.getDaysDurationUnselected(selectedId) * 180;
    }
  },

  dateBeforePresidency: function(date, id) { return date < this.getPresidentialData(id).took_office; },

  dateDuringPresidency: function(date, id) { return date >= this.getPresidentialData(id).took_office && date <= this.getPresidentialData(id).left_office; },

  dateAfterPresidency: function(date, id) { return date > this.getPresidentialData(id).left_office;  },

  getDateAngle: function(date, selectedId) {
    // the selected presidency should expand by 3 times
    date = (date < this.data.startDate) ? this.data.startDate : date;
    let adjustedDuration = this.data.daysDuration + (this.data.zoomFactor - 1) * this.getDurationofPresidency(selectedId);
    if (this.dateBeforePresidency(date, selectedId)) {
      return this._dateDiff(this.data.startDate, date) / adjustedDuration * this.data.tau;
    }
    // the selected 
    else if (this.dateDuringPresidency(date, selectedId)) {
      return (this._dateDiff(this.data.startDate, this.getPresidentialData(selectedId).took_office) / adjustedDuration + this._dateDiff(this.getPresidentialData(selectedId).took_office, date) * this.data.zoomFactor / adjustedDuration) * this.data.tau;
    } else if (this.dateAfterPresidency(date, selectedId)) {
      return (this._dateDiff(this.data.startDate, this.getPresidentialData(selectedId).took_office) / adjustedDuration + this._dateDiff(this.getPresidentialData(selectedId).took_office, this.getPresidentialData(selectedId).left_office) * this.data.zoomFactor / adjustedDuration + this._dateDiff(this.getPresidentialData(selectedId).left_office, date) / adjustedDuration) * this.data.tau;
    }
  },

  getDateAngleDegrees: function(date, selectedId) { return this.getDateAngle(date, selectedId) / this.data.tau * 360; },

  _dateDiff: function (date1, date2) {
    date1 = (date1 < this.data.startDate) ? this.data.startDate : date1;
    let d1 = date1.split('-').map(num => parseInt(num)),
      d2 = date2.split('-').map(num => parseInt(num)),
      dO1 = new Date(d1[0], d1[1]-1, d1[2], 0, 0, 0, 0),
      dO2 = new Date(d2[0], d2[1]-1, d2[2]),
      timeDiff = Math.abs(dO2.getTime() - dO1.getTime()),
      diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return diffDays;
  }

};

// Mixin EventEmitter functionality
Object.assign(DataStore, EventEmitter.prototype);

// Register callback to handle all updates
DataStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case AppActionTypes.loadInitialData:
    DataStore.loadInitialData(action.state);
    break;
  }
  return true;
});

export default DataStore;
