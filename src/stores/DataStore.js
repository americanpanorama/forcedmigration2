import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import OceansJson from '../../data/oceans.json';
import DestinationsJson from '../../data/destinations.json';
import PresidentialTerms from '../../data/terms.json';
import SOSTerms from '../../data/termsSOS.json';
import Regions from '../../data/regions.json';
import RegionsMetadata from '../../data/regionsMetadata.json';

import d3 from 'd3';

const DataStore = {

  data: {
    firstYear: 1905,
    lastYear: 2015,
    startDate: '1905-04-03',
    endDate: '2015-12-12',
    years: [...Array(111).keys()].map(num => num+1905),
    tau: 2 * Math.PI,
    zoomFactor: 10,
    daysDuration: 40797, // this._dateDiff('1905-01-01', '2016-12-31'),
    selectedOffice: 'president',
    selectedId: 44,
    presidentialDestinationsByYear: [],
    sosDestinationsByYear: [],
    selectedLocationIds: [],
    inspectedLocationIds: [],
    detailText: null
  },

  _dateDiff: function (date1, date2) {
    date1 = (date1 < this.data.startDate) ? this.data.startDate : date1;
    let d1 = date1.split('-').map(num => parseInt(num)),
      d2 = date2.split('-').map(num => parseInt(num)),
      dO1 = new Date(d1[0], d1[1]-1, d1[2], 0, 0, 0, 0),
      dO2 = new Date(d2[0], d2[1]-1, d2[2]),
      timeDiff = Math.abs(dO2.getTime() - dO1.getTime()),
      diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return diffDays;
  },

  _parseDestinationsByLocation: function(destinations) {
    let theData = [];

    destinations.forEach(destination => {
      let lng = destination.geometry.coordinates[0],
        lat = destination.geometry.coordinates[1],
        cityId = destination.properties.city_id,
        dataForLocation = theData.filter(location => (lat == location.lat && lng == location.lng));

      if (dataForLocation.length == 0) {
        theData.push({
          lat: lat,
          lng: lng,
          cityId: cityId,
          regionClass: destination.properties.new_region.replace(/ /g,'').toLowerCase(),
          visits: [
            destination.properties
          ]
        });
      } else {
        dataForLocation[0].visits.push(destination.properties);
      }
    });

    return theData;
  },

  parseData: function () {
    this.data.presidentialDestinationsByYear = this._parseDestinationsByYear('president');
    this.data.sosDestinationsByYear = this._parseDestinationsByYear('sos');
    this.data.daysDuration = this._dateDiff(this.data.startDate, this.data.endDate);
    this.emit(AppActionTypes.storeChanged);
  },

  _parseDestinationsByYear: function(office) {
    let theData = [];
    DestinationsJson.features.filter(destination => destination.properties.position.toLowerCase() == office).forEach(destination => {
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
    // drop the US
    theData = theData.filter(regionData => regionData.key !== 'u.s');
    // sort by region 
    let theOrdering = ['canada', 'latinamerica', 'westerneurope', 'easterneuropeandcentralasia', 'middleeast', 'africa', 'southasia', 'eastasia', 'oceania'];
    theData.sort((a,b) => theOrdering.indexOf(a.key) - theOrdering.indexOf(b.key));

    return theData;
  },

  setSelected: function(id, office) {
    this.data.selectedId = id;
    this.data.selectedOffice = office;

    // if there are selected visits, see if the new selection visited the same place
    if (this.hasSelectedLocation()) {
      let city_id = this.getDestinationDetails(this.data.selectedLocationIds)[0].properties.city_id,
        theDestination = this.getDestinationsForSelected().filter(destination => destination.cityId == city_id),
        destinationIds = (theDestination.length > 0) ? theDestination[0].visits.map(visit => visit.cartodb_id) : [];

      this.setSelectedVisits(destinationIds);
    }

    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedVisits: function(ids) {
    this.data.inspectedLocationIds = [];
    this.data.selectedLocationIds = ids;
    this.emit(AppActionTypes.storeChanged);
  },

  setInspectingVisits: function(ids) {
    ids = ids.map(id => parseInt(id));
    this.data.inspectedLocationIds = ids;
    this.emit(AppActionTypes.storeChanged);
  },

  // GETS

  getSelectedId: function() { return this.data.selectedId; },

  getSelectedOffice: function() { return this.data.selectedOffice; },

  getInspectedLocationIds: function() { return this.data.inspectedLocationIds; },

  hasInspectedLocation: function() { return this.data.inspectedLocationIds.length > 0; },

  getSelectedLocationIds: function() { return this.data.selectedLocationIds; },

  hasSelectedLocation: function() { return this.data.selectedLocationIds.length > 0; },

  getVisibleLocationIds: function() { return (this.hasInspectedLocation()) ? this.getInspectedLocationIds() : (this.hasSelectedLocation()) ? this.getSelectedLocationIds() : []; },

  hasVisibleLocation: function() { return this.getVisibleLocationIds().length > 0; },

  isSelectedLocation: function() { return this.getVisibleLocationIds() == this.getSelectedLocationIds(); },
  
  getOceanPolygons: function() { return OceansJson.features; },

  getRegionsPolygons: function() { return Regions.features; },

  getDestinations: function() { return DestinationsJson.features; },

  getDestinationsByYear: function() { return (this.data.selectedOffice == 'president') ? this.data.presidentialDestinationsByYear : this.data.sosDestinationsByYear; },

  getDestinationDetails: function(ids) { return ids.map(id => this.getDestination(id)).sort((a,b) => (a.properties.date_convert < b.properties.date_convert) ? -1 : 1); },

  getDestination: function(id) { return DestinationsJson.features.filter(destination => destination.properties.cartodb_id == id)[0]; },

  getCityIdForSelected: function() { return (this.data.selectedLocationIds.length > 0) ? this.getDestinationDetails(this.data.selectedLocationIds)[0].properties.city_id : false; } ,

  getPresidentialTerms: function() {
    return PresidentialTerms.map((presidency, i) => {
      presidency.startAngle = this.getDateAngle(this._constrainedDate(presidency.took_office));
      presidency.endAngle = this.getDateAngle(this._constrainedDate(presidency.left_office));
      return presidency;
    });
  },

  getSOSTerms: function() { 
    return SOSTerms.map((sos, i) => {
      sos.startAngle = this.getDateAngle(this._constrainedDate(sos.took_office));
      sos.endAngle = this.getDateAngle(this._constrainedDate(sos.left_office));
      return sos;
    });
  },

  getDateAngle: function(date) {
    let adjustedDuration = this.data.daysDuration + (this.data.zoomFactor - 1) * this.getDuration(this.data.selectedId, this.data.selectedOffice),
      legendAngle = this.data.tau * 0.075,
      nonlegendAngle = this.data.tau - legendAngle;

    if (this.dateBeforeSelected(date)) {
      return legendAngle/2 + this._dateDiff(this.data.startDate, date) / adjustedDuration * nonlegendAngle;
    }
    // the selected 
    else if (this.dateDuringSelected(date)) {
      return legendAngle/2 + (this._dateDiff(this.data.startDate, this.getSelectedData().took_office) / adjustedDuration + this._dateDiff(this.getSelectedData().took_office, date) * this.data.zoomFactor / adjustedDuration) * nonlegendAngle;
    } else if (this.dateAfterSelected(date, this.data.selectedId, this.data.selectedOffice)) {
      return legendAngle/2 + (this._dateDiff(this.data.startDate, this.getSelectedData().took_office) / adjustedDuration + this._dateDiff(this.getSelectedData().took_office, this.getSelectedData().left_office) * this.data.zoomFactor / adjustedDuration + this._dateDiff(this.getSelectedData().left_office, date) / adjustedDuration) * nonlegendAngle;
    }
  },

  dateBeforeSelected: function(date) { return date < this.getSelectedData().took_office; },

  dateDuringSelected: function(date) { return date >= this.getSelectedData().took_office && date <= this.getSelectedData().left_office; },

  dateAfterSelected: function(date) { return date > this.getSelectedData().left_office;  },

  yearsForSelected: function() {
    let years = [];
    for(let year = parseInt(this.getSelectedData().took_office.substring(0,4)); year <= parseInt(this.getSelectedData().left_office.substring(0,4)); year++) {
      years.push(year);
    }
    return years;
  },

  monthsForSelected: function() {
    let months = [];
    for (let year = this.yearsForSelected()[0]; year <= this.yearsForSelected()[this.yearsForSelected().length - 1]; year++) {
      for (let monthNum=1; monthNum <= 12; monthNum++) {
        let month = ('0' + monthNum).slice(-2),
          firstDate = year + '-' + month + '-01',
          lastDate = year + '-' + month + '-' + (new Date(2015, monthNum - 1, 0)).getDate();
        if (this.dateDuringSelected(firstDate) || this.dateDuringSelected(lastDate)) {
          months.push(year + '-' + month);
        }
      }
    }
    return months;
  },

  isSelectedYear(year) { return this.yearsForSelected().indexOf(year) !== -1; },

  getDuration: function(id, office) {
    return this._dateDiff(...this.getTerm(id, office));
  },

  getTerm: function(id, office) {
    let terms = (office == 'president') ? PresidentialTerms : SOSTerms,
      officeholder = terms.filter(executive => executive.number == id)[0],
      took_office = (officeholder.took_office > this.data.startDate) ? officeholder.took_office : this.data.startDate,
      left_office = (officeholder.left_office < this.data.endDate) ? officeholder.left_office : this.data.endDate; 
    return [took_office, left_office];
  },

  getTermPercent: function(id, office) {
    let adjustedDuration = this.data.daysDuration + (this.data.zoomFactor - 1) * this.getDuration(this.data.selectedId, this.data.selectedOffice);
    return (id !== this.data.selectedId) ? this.getDurationofPresidency(id) / adjustedDuration : this.getDurationofPresidency(id) / adjustedDuration * this.data.zoomFactor;
  },

  getDaysDurationUnselected: function(selectedId) {
    return this.data.daysDuration - this.getDurationofPresidency(selectedId);
  },

  getDestinationsForSelected: function() { return this._parseDestinationsByLocation(this.getSimplifiedDestinationsForSelected()); },

  getSimplifiedDestinationsForSelected: function() { return DestinationsJson.features.filter(destination => this.dateDuringSelected(destination.properties.date_convert) && destination.properties.position.toLowerCase() == this.data.selectedOffice).sort((a,b) => (a.properties.date_convert < b.properties.date_convert) ? -1 : 1); },

  getSimplifiedDestinationsForOfficeholder: function(id, office) {
    let term = this.getTerm(id, office);
    return DestinationsJson.features.filter(destination => destination.properties.date_convert >= term[0] && destination.properties.date_convert <= term[1] && destination.properties.position.toLowerCase() == this.data.selectedOffice).sort((a,b) => (a.properties.date_convert < b.properties.date_convert) ? -1 : 1);
  },

  getNextDestinationIdSelected: function() {
    let destinations = this.getSimplifiedDestinationsForSelected(),
      nextId = destinations.findIndex(destination => destination.properties.cartodb_id == this.data.selectedLocationIds[0]) + 1;
    return (destinations[nextId]) ? destinations[nextId].properties.cartodb_id : null;
  },

  getPreviousDestinationIdSelected: function() {
    let destinations = this.getSimplifiedDestinationsForSelected(),
      previousId = destinations.findIndex(destination => destination.properties.cartodb_id == this.data.selectedLocationIds[0]) - 1;
    return (destinations[previousId]) ? destinations[previousId].properties.cartodb_id : null;
  },

  getOfficeholdersWhoVisited(cityId) {
    let visitors = [],
      visitsToCity = DestinationsJson.features.filter(destination => destination.properties.city_id == cityId);
    visitsToCity.forEach(destination => {
      let visitor = destination.properties.position.toLowerCase() + '-' + destination.properties.pres_id;
      if (visitors.indexOf(visitor) == -1) {
        visitors.push(visitor);
      }
    });
    return visitors;
  },

  getOfficeholdersWhoVisitedSelected() { return this.getOfficeholdersWhoVisited(this.getCityIdForSelected()); },

  getRegionsVisited() { 
    return this.getSimplifiedDestinationsForSelected().map(destination => destination.properties.new_region.replace(/ /g,'').toLowerCase()).filter((region, pos, self) => self.indexOf(region) == pos && region !== 'u.s'); 
  },

  getYearsWithAngles() {
    return this.data.years.map(year => {
      return {
        year: year,
        startAngle: this.getDateAngle(year + '-01-01'),
        endAngle: this.getDateAngle((year+1) + '-01-01')
      };
    });
  },

  getMonthsSelectedWithAngles() {
    return this.monthsForSelected().map(month => {
      return {
        year: parseInt(month.split('-')[0]),
        month: parseInt(month.split('-')[1]),
        monthName: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][parseInt(month.split('-')[1]) -1],
        startAngle: this.getDateAngle(month + '-01'),
        endAngle: this.getDateAngle(month + '-' + (new Date(2015, parseInt(month.split('-')[1]) - 1, 0)).getDate())
      };
    });
  },

  getMaxDistance() { return DestinationsJson.features.reduce((a,b) => Math.max(a,b.properties.distance), 0); },

  visitedRegionDuring(region, date1, date2) {
    DestinationsJson.features.forEach(destination => {
      if (destination.properties.new_region == region && destination.properties.date_convert >= date1 && destination.properties.date_convert <= date2) {
        return true;
      }      
    });
    return false;
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

  getMaxVisits: function() {
    let yearCounts = {};
    DestinationsJson.features.filter(destination => destination.properties.position.toLowerCase() == 'sos' ).forEach(destination => {
      let year = parseInt(destination.properties.date_convert.substring(0,4));
      yearCounts[year] = (yearCounts[year]) ? yearCounts[year] + 1 : 1;
    });

    return Object.keys(yearCounts).reduce((max, year) => Math.max(yearCounts[year], max), 0);
  },

  getPresidencyArcRadians: function(id, selectedId) {
    let unselectedPercent = this.getDurationofPresidency(id) / this.getDaysDurationUnselected(selectedId);
    return unselectedPercent * Math.PI;
  },

  getOfficeholderData(id, office) { 
    let terms = (office == 'president') ? PresidentialTerms : SOSTerms;
    return terms.filter(officeholder => officeholder.number == id)[0];
  },

  getSelectedData() { return this.getOfficeholderData(this.data.selectedId, this.data.selectedOffice); },

  getOfficeholderStartAngle(id, office) { return this.getDateAngle(this._constrainedDate(this.getOfficeholderData(id, office).took_office)); },

  getOfficeholderEndAngle(id, office) { return this.getDateAngle(this._constrainedDate(this.getOfficeholderData(id, office).left_office)); },

  _constrainedDate(date) {
    date = (date > this.data.startDate) ? date : this.data.startDate;
    date = (date < this.data.endDate) ? date : this.data.endDate;
    return date;
  },

  getDateRotationSelected: function(date, selectedId) {
    let lastSelectedDate = PresidentialTerms.filter(presidency => presidency.number == selectedId)[0].left_office;
    lastSelectedDate = (lastSelectedDate < this.data.endDate) ? lastSelectedDate : this.data.endDate;
    if (date >= lastSelectedDate) {
      return 90 + this._dateDiff(lastSelectedDate, date) / this.getDaysDurationUnselected(selectedId) * 180;
    } else {
      return this.getDateRotationSelected(this.data.endDate, selectedId) + this._dateDiff(this.data.startDate, date) / this.getDaysDurationUnselected(selectedId) * 180;
    }
  },


  getDateAngleDegrees: function(date, selectedId) { return this.getDateAngle(date, selectedId) / this.data.tau * 360; },

  getRegionMetadata(slug) { return RegionsMetadata.filter(region => region.slug == slug)[0]; },

  getTimelineRotation: function() { return 360 - (this.getOfficeholderEndAngle(this.getSelectedId(), this.getSelectedOffice()) + this.getOfficeholderStartAngle(this.getSelectedId(), this.getSelectedOffice())) / 2 / Math.PI * 180; }, 

  getTimelineRotationRadians: function() { return Math.PI * 2 - (this.getOfficeholderEndAngle(this.getSelectedId(), this.getSelectedOffice()) + this.getOfficeholderStartAngle(this.getSelectedId(), this.getSelectedOffice())) / 2; }, 
};

// Mixin EventEmitter functionality
Object.assign(DataStore, EventEmitter.prototype);

// Register callback to handle all updates
DataStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
  case AppActionTypes.parseData:
    DataStore.parseData();
    DataStore.setSelected(action.id, action.office);
    DataStore.setSelectedVisits(action.visits);
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

export default DataStore;
