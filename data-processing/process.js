// sql statement for carto: 
//SELECT pt.pres_id, pt.cartodb_id, pt.city_id, substring(pt.date from 1 for 4)::int as year, pt.date_convert, ct.city, ct.the_geom, ct.country, ct.the_geom_webmercator, pst.pres_sos, pst.position, r.new_region, remarks, num, st_distance_Sphere (st_point(-77.1546508,38.899265), st_point(ct.long, ct.lat)) as distance FROM president_sos_travel_data pt Join city_table ct ON pt.city_id = ct.city_id and substring(pt.date_convert from 1 for 4) <= '2016'Join presidents_sos_table pst ON pt.pres_id = pst.pres_id join world_regions r on st_contains(r.the_geom, ct.the_geom) Order By date desc
const util = require('util');

var DestinationsJson  = require('./destinations.json');
var PresidentialTerms  = require('./terms.json');
var SOSTerms  = require('./termsSOS.json');

var startDate= '1905-04-03',
   endDate= '2017-01-20';

var dateDiff = function (date1, date2) {
    var d1 = date1.split('-').map(num => parseInt(num)),
      d2 = date2.split('-').map(num => parseInt(num)),
      dO1 = new Date(d1[0], d1[1]-1, d1[2], 0, 0, 0, 0),
      dO2 = new Date(d2[0], d2[1]-1, d2[2]),
      timeDiff = Math.abs(dO2.getTime() - dO1.getTime()),
      diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return diffDays;
  };

var parseRawData = function() {
    var pres = PresidentialTerms
      .map(p => {
        p.start_date = getAdjustedTerm(p.number, 'president')[0];
        p.end_date = getAdjustedTerm(p.number, 'president')[1];
        p.office = 'p';
        delete p.birth_year;
        delete p.death_year;
        delete p.party;
        return p;
      });

    var sos = SOSTerms.map(p => {
      p.start_date = getAdjustedTerm(p.number, 'sos')[0];
      p.end_date = getAdjustedTerm(p.number, 'sos')[1];
      p.office = 's';
      return p;
    });
    pres = pres.map(p => {
      p.visits = cleanupDestinations(p.number, 'president');
      return p;
    });
    sos = sos.map(p => {
      p.visits = cleanupDestinations(p.number, 'sos');
      return p;
    });
    return pres.concat(sos);
  };

var getSimplifiedDestinationsForOfficeholder = function(id, office) {
    return  DestinationsJson.features
      .filter(destination => destination.properties.num == id && destination.properties.position.toLowerCase() == office)
      .sort((a,b) => (a.properties.date_convert < b.properties.date_convert) ? -1 : 1);
  };

var cleanupDestinations = function(id, office) {
    return  getSimplifiedDestinationsForOfficeholder(id,office).map(visit => {
      delete visit.properties.city_id;
      delete visit.properties.num;
      delete visit.properties.pres_id;
      delete visit.properties.pres_sos;
      visit.properties.distance = Math.round(visit.properties.distance);

      visit.geometry.coordinates = visit.geometry.coordinates.map(c => Math.round(c * 100)/100);

      var dates = visit.properties.date_convert.replace(/ /g,'').split(',');
      // dates.forEach(date => {
      // 	date = date.replace(/ /g,'');
      //   if (date !== '' && !isValidDate(date)) {
      //     console.log(visit.properties.cartodb_id, date);
      //   }
      // });

      visit.properties.start_date = dates[0];
      if (dates[1] && dates[1] !== '') {
      	visit.properties.end_date = dates[1];
      	visit.properties.length = dateDiff(dates[0], dates[1]);
      }
      delete visit.properties.date_convert;
      return visit;
    });
  };

var getTerm = function(id, office) {
    var terms = (office == 'president') ? PresidentialTerms : SOSTerms,
      officeholder = terms.filter(executive => executive.number == id)[0],
      took_office = (officeholder.took_office > startDate) ? officeholder.took_office : startDate,
      left_office = (officeholder.left_office < endDate) ? officeholder.left_office : endDate; 
    return [took_office, left_office];
  };

var getAdjustedTerm = function(id, office) {
    var term = getTerm(id,office),
      visits = getSimplifiedDestinationsForOfficeholder(id, office),
      firstDate = (visits.length > 0 && visits[0].properties.date_convert < term[0]) ? visits[0].properties.date_convert.substring(0,10) : term[0],
      lastDate = (visits.length > 0 && visits[visits.length - 1].properties.date_convert > term[1]) ? visits[visits.length - 1].properties.date_convert.substring(0,10) : term[1];

    return [firstDate, lastDate];
  };

 // Validates that the input string is a valid date formatted as "mm/dd/yyyy"
var isValidDate = function (dateString) {
    // First check for the pattern
    if(!/^\d{4}\-\d{2}\-\d{2}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("-");
    var day = parseInt(parts[2], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if(year < 1904 || year > 2016|| month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

//parseRawData();
console.log(util.inspect(parseRawData(), false, null));