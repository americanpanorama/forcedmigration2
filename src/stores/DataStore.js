import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';
import OceansJson from '../../data/oceans.json';
import DestinationsJson from '../../data/destinations.json';
//import PresidentialTerms from '../../data/terms.json';
import travels from '../../data/presTerms.json';
//import SOSTerms from '../../data/termsSOS.json';
import RegionsMetadata from '../../data/regionsMetadata.json';
import PresYearData from '../../data/presYearData.json';
import SOSYearData from '../../data/sosYearData.json';

import d3 from 'd3';

const DataStore = {

  data: {
    firstYear: 1905,
    lastYear: 2017,
    startDate: '1905-04-03',
    endDate: '2016-12-31',
    years: [...Array(112).keys()].map(num => num+1905),
    tau: 2 * Math.PI,
    zoomFactor: 10,
    daysDuration: 40837, // this._dateDiff('1905-01-01', '2016-12-31'),
    selectedOffice: 'president',
    selectedId: null,
    presidentialDestinationsByYear: PresYearData,
    sosDestinationsByYear: SOSYearData,
    selectedLocationIds: [],
    inspectedLocationIds: [],
    detailText: null,
    maxDistance: 18607474, // DestinationsJson.features.reduce((a,b) => Math.max(a,b.properties.distance), 0);
    maxVisits: 94,
    maxVisitsPresidents: 41
  },

  _dateDiff: function (date1, date2) {
    let d1 = date1.split('-').map(num => parseInt(num)),
      d2 = date2.split('-').map(num => parseInt(num)),
      dO1 = new Date(d1[0], d1[1]-1, d1[2], 0, 0, 0, 0),
      dO2 = new Date(d2[0], d2[1]-1, d2[2]),
      timeDiff = Math.abs(dO2.getTime() - dO1.getTime()),
      diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return diffDays;
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

  _getMaxVisits: function() {
    let yearCounts = [],
      max;
    travels
      .filter(o => o.office == 'p')
      .forEach(o => {
        o.visits.forEach(v => {
          let year = parseInt(v.properties.start_date.substring(0,4));
          yearCounts[year] = (yearCounts[year]) ? yearCounts[year] + 1 : 1;
        });
      });
    let counts = Object.keys(yearCounts).map(year => yearCounts[year]);
    return Math.max(...counts);
  },



  _parseDestinationsByLocation: function() {
    let destinations = (this.data.selectedId) ? this.getSimplifiedDestinationsForSelected() : this.getAllDestinations(),
      theData = [];

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
          displayName: destination.properties.city + ', ' + destination.properties.country,
          searchName: [destination.properties.city, destination.properties.country, destination.properties.new_region].join(' '),
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

  _constrainedDate(date) {
    date = (date.substring(0,10) > this.data.startDate) ? date.substring(0,10) : this.data.startDate;
    date = (date.substring(0,10) < this.data.endDate) ? date.substring(0,10) : this.data.endDate;
    return date;
  },

  setSelected: function(id, office, visits, lat, lng) {
    if (this.hasSelectedLocation()) {
      [lng, lat] = this.getLatLng([this.data.selectedLocationIds[0]]);
    }

    this.data.selectedId = id;
    this.data.selectedOffice = office;

    // if there are selected visits, see if the new selection visited the same place
    if (this.hasSelectedLocation()) {
      this.setSelectedVisitsFromLatLng(lat, lng);
    }

    // set selected visits if specified
    if (lat && lng) {
      this.setSelectedVisitsFromLatLng(lat, lng);
    } else if (visits) {
      this.setSelectedVisits(visits);
    }

    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedVisits: function(ids) {
    ids = ids.map(id => parseInt(id));
    this.data.inspectedLocationIds = [];
    this.data.selectedLocationIds = ids;
    this.emit(AppActionTypes.storeChanged);
  },

  setInspectingVisits: function(ids) {
    ids = ids.map(id => parseInt(id));
    this.data.inspectedLocationIds = ids;
    this.emit(AppActionTypes.storeChanged);
  },

  setSelectedVisitsFromLatLng: function(lat, lng) {
    let destinationIds = this.getSimplifiedDestinationsForSelected()
      .filter(v => v.geometry.coordinates[0] == lng && v.geometry.coordinates[1] == lat)
      .map(v => v.properties.cartodb_id);
    this.setSelectedVisits(destinationIds);
  },

  // GETS

  allPresidentsShown: function() { return !this.data.selectedId && this.data.selectedOffice == 'president'; },

  allSOSsShown: function() { return !this.data.selectedId && this.data.selectedOffice == 'sos'; },

  getSelectedId: function() { return this.data.selectedId; },

  getSelectedOffice: function() { return this.data.selectedOffice; },

  getInspectedLocationIds: function() { return this.data.inspectedLocationIds; },

  hasInspectedLocation: function() { return this.data.inspectedLocationIds.length > 0; },

  getSelectedLocationIds: function() { return this.data.selectedLocationIds; },

  hasSelectedLocation: function() { return this.data.selectedLocationIds.length > 0; },

  getVisibleLocationIds: function() { return (this.hasInspectedLocation()) ? this.getInspectedLocationIds() : (this.hasSelectedLocation()) ? this.getSelectedLocationIds() : []; },

  hasVisibleLocation: function() { return this.getVisibleLocationIds().length > 0; },

  isSelectedLocation: function() { return this.getVisibleLocationIds() == this.getSelectedLocationIds(); },

  isAVisibleLocation: function(id) { return DataStore.getVisibleLocationIds().indexOf(id) !== -1; },
  
  getOceanPolygons: function() { return OceansJson.features; },

  getDestinationsByYear: function() { return (this.data.selectedOffice == 'president') ? this.data.presidentialDestinationsByYear : this.data.sosDestinationsByYear; },

  getDestinationDetails: function(ids) { return (!ids) ? [] : ids.map(id => this.getSelectedData().visits.filter(v => v.properties.cartodb_id == parseInt(id))[0]).sort((a,b) => (a.properties.start_date < b.properties.start_date) ? -1 : 1); },

  getPresidentialTerms: function() { return this.getTermsForOffice('p'); },

  getSOSTerms: function() { return this.getTermsForOffice('s'); },

  getTermsForOffice: function(office) {
    return travels
      .filter(officeholder => officeholder.office == office)
      .map((officeholder, i) => {
        officeholder.startAngle = this.getDateAngle(this._constrainedDate(officeholder.took_office));
        officeholder.endAngle = this.getDateAngle(this._constrainedDate(officeholder.left_office));
        return officeholder;
      });
  },

  getDateAngle: function(date) {
    date = this._constrainedDate(date);
    let adjustedDuration = this.data.daysDuration + (this.data.zoomFactor - 1) * this.getDuration(this.data.selectedId, this.data.selectedOffice),
      legendAngle = this.data.tau * 0.075,
      nonlegendAngle = this.data.tau - legendAngle;

    if (this.dateBeforeSelected(date)) {
      return legendAngle/2 + this._dateDiff(this.data.startDate, date) / adjustedDuration * nonlegendAngle;
    }
    // the selected 
    else if (this.dateDuringSelected(date)) {
      return legendAngle/2 + (this._dateDiff(this.data.startDate, this._constrainedDate(this.getSelectedData().took_office)) / adjustedDuration + this._dateDiff(this._constrainedDate(this.getSelectedData().took_office), date) * this.data.zoomFactor / adjustedDuration) * nonlegendAngle;
    } else if (this.dateAfterSelected(date, this.data.selectedId, this.data.selectedOffice)) {
      return legendAngle/2 + (this._dateDiff(this.data.startDate, this._constrainedDate(this.getSelectedData().took_office)) / adjustedDuration + this._dateDiff(this._constrainedDate(this.getSelectedData().took_office), this.getSelectedData().left_office) * this.data.zoomFactor / adjustedDuration + this._dateDiff(this.getSelectedData().left_office, date) / adjustedDuration) * nonlegendAngle;
    }
  },

  getTermsRingAngles: function() { return [this.data.tau * 0.075, this.data.tau - this.data.tau * 0.075]; },

  dateBeforeSelected: function(date) { return (!this.data.selectedId) ? true : date.substring(0,10) <= this._constrainedDate(this.getOfficeholderData(this.data.selectedId, this.data.selectedOffice).took_office); },

  dateDuringSelected: function(date) { return (!this.data.selectedId) ? false : date > this._constrainedDate(this.getOfficeholderData(this.data.selectedId, this.data.selectedOffice).took_office) && date <= this._constrainedDate(this.getOfficeholderData(this.data.selectedId, this.data.selectedOffice).left_office); },

  dateAfterSelected: function(date) { return (!this.data.selectedId) ? false : date > this._constrainedDate(this.getOfficeholderData(this.data.selectedId, this.data.selectedOffice).left_office);  },

  yearsForSelected: function() {
    if (!this.data.selectedId) return [];
    let years = [];
    for(let year = parseInt(this.getOfficeholderData(this.data.selectedId, this.data.selectedOffice).took_office.substring(0,4)); year <= parseInt(this.getOfficeholderData(this.data.selectedId, this.data.selectedOffice).left_office.substring(0,4)); year++) {
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
          lastDate = year + '-' + month + '-' + (new Date(2016, monthNum - 1, 0)).getDate();
        if (this.dateDuringSelected(firstDate) || this.dateDuringSelected(lastDate)) {
          months.push(year + '-' + month);
        }
      }
    }
    return months;
  },

  isSelectedYear(year) { return this.yearsForSelected().indexOf(year) !== -1; },

  getDuration: function(id, office) { return (!id) ? 0 : this._dateDiff(...this.getTerm(id, office)); },

  getTerm: function(id, office) { return [this._constrainedDate(this.getOfficeholderData(id,office).took_office), this._constrainedDate(this.getOfficeholderData(id,office).left_office)]; },

  getDestinationsForSelected: function() { return this._parseDestinationsByLocation(); },

  getSimplifiedDestinationsForSelected: function() { return this.getSimplifiedDestinationsForOfficeholder(this.data.selectedId, this.data.selectedOffice); },

  getAllDestinations: function() { 
    let visits=[];
    travels
      .filter(o => o.office == this.data.selectedOffice.substring(0,1))
      .forEach(o => {
        visits = visits.concat(o.visits.map(v => {
          v.properties.pres_sos = o.name;
          return v;
        }));
      });
    return visits;
  },

  getSimplifiedDestinationsForOfficeholder: function(id, office) {
    return (!id) ? this.getAllDestinations() :
      travels
        .filter(officeholder => officeholder.number == id && officeholder.office == office.substring(0,1))[0]
        .visits;
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

  getRegionsVisited() { return this.getSimplifiedDestinationsForSelected().map(destination => destination.properties.new_region.replace(/ /g,'').toLowerCase()).filter((region, pos, self) => self.indexOf(region) == pos && region !== 'u.s'); },

  getYearsWithAngles() {
    return this.data.years.map(year => {
      return {
        year: year,
        startAngle: this.getDateAngle(year + '-01-01'),
        endAngle: this.getDateAngle((year+1) + '-01-01')
      };
    });
  },

  // getVisitsWithAngles() {
  //   return this.getDestinationDetails(this.getVisibleLocationIds()).map(d=> {
  //     return {        startDate: d.properties.start_date,
  //       angle: d.properties.start_date),
  //       endAngle: this.getDateAngle(d.properties.start_date)
  //     }
  //   });
  // },

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

  getMaxDistance() { return this.data.maxDistance; },

  getMaxVisits: function() { return (this.data.selectedOffice == 'president') ? this.data.maxVisitsPresidents : this.data.maxVisits; },

  getOfficeholderData(id, office) { return travels.filter(officeholder => officeholder.number == id && officeholder.office == office.substring(0,1))[0]; },

  getSelectedData() { 
    if (this.data.selectedId) {
      return this.getOfficeholderData(this.data.selectedId, this.data.selectedOffice); 
    }
    else {
      return { visits: this.getAllDestinations() };
    }
  },

  getOfficeholderStartAngle(id, office) { return (!id) ? 0 : this.getDateAngle(this._constrainedDate(this.getOfficeholderData(id, office).took_office)); },

  getOfficeholderEndAngle(id, office) { return (!id) ? 0 : this.getDateAngle(this._constrainedDate(this.getOfficeholderData(id, office).left_office)); },

  getOfficeholderAdjustedStartAngle(id, office) { return (!id) ? 0 :this.getDateAngle(this._constrainedDate(this.getOfficeholderData(id, office).start_date)); },

  getOfficeholderAdjustedEndAngle(id, office) { return (!id) ? 0 : this.getDateAngle(this._constrainedDate(this.getOfficeholderData(id, office).end_date)); },

  getRegionMetadata(slug) { return RegionsMetadata.filter(region => region.slug == slug)[0]; },

  getTimelineRotation: function() { return 360 - (this.getOfficeholderEndAngle(this.getSelectedId(), this.getSelectedOffice()) + this.getOfficeholderStartAngle(this.getSelectedId(), this.getSelectedOffice())) / 2 / Math.PI * 180; }, 

  getTimelineRotationRadians: function() { return Math.PI * 2 - (this.getOfficeholderEndAngle(this.getSelectedId(), this.getSelectedOffice()) + this.getOfficeholderStartAngle(this.getSelectedId(), this.getSelectedOffice())) / 2; }, 

  getVisitsTicks: function() { return (this.data.selectedOffice == 'president') ? [10,20,30,41] : [30,60,91]; },

  visitedLocation: function(id, office) {
    let destinationIds = [];
    if (this.hasVisibleLocation()) {
      var [lat, lng] = this.getDestinationDetails([this.getVisibleLocationIds()[0]])[0].geometry.coordinates;
      destinationIds = this.getSimplifiedDestinationsForOfficeholder(id, office)
        .filter(v => v.geometry.coordinates[0] == lat && v.geometry.coordinates[1] == lng);
    }
    return destinationIds.length > 0;
  },

  getLatLng: function(id) { return this.getDestinationDetails([id])[0].geometry.coordinates; },

/* 
  OLDgetPresidentialTerms: function() {
    return PresidentialTerms.map((presidency, i) => {
      presidency.startAngle = this.getDateAngle(this._constrainedDate(presidency.took_office));
      presidency.endAngle = this.getDateAngle(this._constrainedDate(presidency.left_office));
      return presidency;
    });
  },

  OLDdateBeforeSelected: function(date) { return date < this.getAdjustedTerm(this.data.selectedId, this.data.selectedOffice)[0]; },

  OLDdateDuringSelected: function(date) { return date >= this.getAdjustedTerm(this.data.selectedId, this.data.selectedOffice)[0] && date <= this.getAdjustedTerm(this.data.selectedId, this.data.selectedOffice)[1]; },

  OLDdateAfterSelected: function(date) { return date > this.getAdjustedTerm(this.data.selectedId, this.data.selectedOffice)[1];  },

  OLDgetTerm: function(id, office) {
    let terms = (office == 'president') ? PresidentialTerms : SOSTerms,
      officeholder = terms.filter(executive => executive.number == id)[0],
      took_office = (officeholder.took_office > this.data.startDate) ? officeholder.took_office : this.data.startDate,
      left_office = (officeholder.left_office < this.data.endDate) ? officeholder.left_office : this.data.endDate; 
    return [took_office, left_office];
  },

  OLDgetTerm: function(id, office) {
    let terms = (office == 'president') ? PresidentialTerms : SOSTerms,
      officeholder = terms.filter(executive => executive.number == id)[0],
      took_office = (officeholder.took_office > this.data.startDate) ? officeholder.took_office : this.data.startDate,
      left_office = (officeholder.left_office < this.data.endDate) ? officeholder.left_office : this.data.endDate; 
    return [took_office, left_office];
  },

  OLDgetOfficeholderData(id, office) { 
    let terms = (office == 'president') ? PresidentialTerms : SOSTerms;
    return terms.filter(officeholder => officeholder.number == id)[0];
  },

  OLDgetOfficeholdersWhoVisited(cityId) {
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

  OLDgetMaxVisits: function() {
    let yearCounts = {};
    DestinationsJson.features.filter(destination => destination.properties.position.toLowerCase() == 'sos' ).forEach(destination => {
      let year = parseInt(destination.properties.date_convert.substring(0,4));
      yearCounts[year] = (yearCounts[year]) ? yearCounts[year] + 1 : 1;
    });

    return Object.keys(yearCounts).reduce((max, year) => Math.max(yearCounts[year], max), 0);
  },

  OLDgetSOSTerms: function() { 
    return SOSTerms.map((sos, i) => {
      sos.startAngle = this.getDateAngle(this._constrainedDate(sos.took_office));
      sos.endAngle = this.getDateAngle(this._constrainedDate(sos.left_office));
      return sos;
    });
  },
*/

};

// Mixin EventEmitter functionality
Object.assign(DataStore, EventEmitter.prototype);

// Register callback to handle all updates
DataStore.dispatchToken = AppDispatcher.register((action) => {
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

export default DataStore;