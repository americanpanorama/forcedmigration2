import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

import d3 from 'd3';

import DataStore from './DataStore.js';

const DimensionsStore = {

  data: {
    mapProportion: 2/3,
    ringProportion: 1/3,
    termsProportion: 3/54,
    graphProportion: 3/18,
    yearProportion: 2/18,
    titleOffset: 1/9,
    pointPercentOfRadius: .01
  },

  calculate: function(dimension) { 
    this.data.widthHeight = dimension; 
    this.emit(AppActionTypes.storeChanged);
  },

  getWidthHeight: function() { return this.data.widthHeight; },

  getRadius: function() { return this.data.widthHeight * this.data.mapProportion / 2; },

  getTimelineWidth: function() { return this.data.widthHeight / 2 - this.getRadius(); },

  getSOSInnerRadius: function() { return this.getRadius(); },

  getSOSOuterRadius: function() { return this.getRadius() + this.getTermWidth(); },

  getPresInnerRadius: function() { return this.getRadius() + this.getTermWidth(); },

  getPresOuterRadius: function() { return this.getRadius() + this.getTermWidth() * 2; },

  getTimelineTickInnerX: function(angle) { return this.getRadius() + this.getPresOuterRadius() * Math.sin(angle); },

  getTimelineTickInnerY: function(angle) { return this.getRadius() - this.getPresOuterRadius() * Math.cos(angle); },

  getTimelineTickOuterX: function(angle) { return this.getRadius() + this.getTimelineTickOuterRadius() * Math.sin(angle); },

  getTimelineTickOuterY: function(angle) { return this.getRadius() - this.getTimelineTickOuterRadius() * Math.cos(angle); },

  getTimelineLabelX: function(angle) { return this.getRadius() + this.getTimelineLabelRadius() * Math.sin(angle); },

  getTimelineLabelY: function(angle) { return this.getRadius() - this.getTimelineLabelRadius() * Math.cos(angle); },

  getTimelineDestinationX: function(angle, distance) { return this.getRadius() + this.getDestinationDistance(distance) * Math.sin(angle); },

  getTimelineDestinationY: function(angle, distance) { return this.getRadius() - this.getDestinationDistance(distance) * Math.cos(angle); },

  getSteamgraphLabelX: function(angle, visits) { return this.getRadius() + this.getSteamgraphYAxisDistance(visits) * Math.sin(angle); },

  getSteamgraphLabelY: function(angle, visits) { return this.getRadius() - this.getSteamgraphYAxisDistance(visits) * Math.cos(angle); },

  getTimelineTickOuterRadius: function() { return this.getRadius() + this.getTermWidth() * 2 + this.getGraphWidth(); },

  getTimelineLabelRadius: function() { return this.getRadius() + this.getTermWidth() * 2.5 + this.getGraphWidth(); },

  getGraphInnerRadius: function() { return this.getPresOuterRadius(); },

  getGraphOuterRadius: function() { return this.getRadius() + this.getTermWidth() * 2 + this.getGraphWidth(); },

  getTermWidth: function() { return (this.data.widthHeight * this.data.termsProportion) / 2; },

  getGraphWidth: function() { return (this.data.widthHeight * this.data.graphProportion) / 2; },

  getTermsLabelSize: function() { return this.getTermWidth() / 1.8; },

  getSVGArc(padding, radius, sweepFlag) {
    sweepFlag = (sweepFlag) ? sweepFlag : 1; 
    return 'M ' + padding + ',' + radius + ' A ' + (radius-padding) + ',' + (radius-padding) + ' 0 0, ' + sweepFlag + ' ' + (radius*2 - padding) + ',' + radius; 
  },

  getSOSLabelArc() { return this.getSVGArc(this.getTermWidth() / -4, this.getRadius()); },

  getPresLabelArc() { return this.getSVGArc(this.getTermWidth() * -1.25, this.getRadius()); },

  getTitleLabelArc() { return this.getSVGArc(-1 * (this.getTermWidth() * 2 + this.getGraphWidth() + this.data.titleOffset * this.data.widthHeight / 2), this.getRadius()); },

  getTitleSize: function() { return this.getTermWidth(); },

  getSubtitleSize: function() { return this.getTermWidth() * 0.75; },

  getAboutMapLinkArc: function() { return this.getSVGArc(-1 * (this.getTermWidth() * 2 + this.getGraphWidth() + this.data.titleOffset * this.data.widthHeight / 2), this.getRadius(), '0'); },

  getDorlingLegendValuesArc: function() { return this.getSVGArc(-1 * (this.getTermWidth() * 2 + this.getGraphWidth() + this.data.titleOffset * this.data.widthHeight / 2 + this.getPointRadius((DataStore.getSelectedId()) ? 10 : 100) * 3), this.getRadius(), '0'); },

  getDorlingLegendArc: function() { return this.getSVGArc(-1 * (this.getTermWidth() * 2 + this.getGraphWidth() + this.data.titleOffset * this.data.widthHeight / 2 + this.getPointRadius((DataStore.getSelectedId()) ? 10 : 100) * 5), this.getRadius(), '0'); },

  getAboutMapLinkSize: function() { return this.getTermWidth() * 0.75; },

  getTimelineLabelSize: function() { return this.getTermWidth() / 2; },

  getRegionLabelSize: function() { return this.getTermWidth() / 2; },

  getMaskRectHeight: function() { return window.innerHeight - (this.getWidthHeight() / 2 + this.getRadius()); },

  getPointRadius: function(num) { 
    num = (num) ? num : 1;
    if (!DataStore.getSelectedId()) num = num / 10;
    let radius = Math.sqrt(num * this.data.pointPercentOfRadius * this.getRadius() * this.data.pointPercentOfRadius * this.getRadius());
    return radius; 
  },

  getSearchStyle: function() {
    return {
      top: this.getTimelineWidth() + this.getRadius() * 0.6,
      left: window.innerWidth / 2 - this.getRadius() *  0.6,
      width: this.getRadius() * 0.4,
      maxHeight: this.getRadius() * 1.4 - this.getTermWidth(),
      fontSize: this.getTermWidth() / 2,
      paddingBottom: this.getTermWidth() * 3
    };
  },

  getSearchInnerStyle: function() {
    return {
      width: this.getRadius() * 0.4 - 200,
    };
  },



  getDetailsControlStyle: function() {
    return {
      top: this.getTimelineWidth() + this.getRadius() * 0.6,
      left: window.innerWidth / 2 - this.getRadius() *  0.6,
      width: this.getRadius() * 0.4,
      height: this.getTermWidth(),
      fontSize: this.getTermWidth() / 2
    };
  },


  getDetailsStyle: function() {
    return {
      top: this.getTimelineWidth() + this.getRadius() * 0.6 + this.getTermWidth(),
      left: window.innerWidth / 2 - this.getRadius() *  0.6,
    };
  },

  getDetailsInnerStyle: function() {
    return {
      width: this.getRadius() * 0.4 + 20,
      maxHeight: this.getRadius() * 1.4 - this.getTermWidth(),
      fontSize: this.getTermWidth() / 2,
      paddingBottom: this.getTermWidth() * 3
    };
  },

  getAboutStyle: function() { return { top: this.getWidthHeight() / 2 }; },

  getAboutContentStyle: function() {
    return {
      marginTop: this.getRadius() * Math.sin(Math.PI/-4),
      marginLeft: this.getRadius() * Math.sin(Math.PI/-4),
      marginBottom: this.getRadius(),
      width: 2 *  this.getRadius() * Math.sin(Math.PI/4) - this.getTermWidth() * 2,
      height: this.getRadius() * Math.sin(Math.PI/4) + this.getRadius() - this.getTermWidth() * 2,
      paddingTop: this.getTermWidth() * 2,
      paddingLeft: this.getTermWidth(),
      paddingRight: this.getTermWidth(),
      fontSize: (this.getTermWidth() / 2 > 14) ? this.getTermWidth() / 2 : 14
    };
  },

  getAboutCloseStyle: function() {
    return {
      marginTop: this.getRadius() * Math.sin(Math.PI/-4),
      marginLeft: this.getRadius() * Math.sin(Math.PI/4),
      paddingTop: this.getTermWidth() * 2,
      fontSize: (this.getTermWidth() / 2 > 14) ? this.getTermWidth() / 2 : 14
    };
  },

  getDetailsDestinationStyle: function() {
    return {
      fontSize: this.getTermWidth() / 1.5,
      width: this.getRadius() * 0.4
    };
  },

  getDetailsOfficeholderStyle: function() {
    return {
      fontSize: this.getTermWidth() / 2,
    };
  },

  getTermsArc: function() { 
    return d3.svg.arc()
      .innerRadius(this.getSOSInnerRadius())
      .outerRadius(this.getPresOuterRadius())
      .startAngle(Math.PI * 2 * 0.075/2)
      .endAngle(Math.PI * 2 - Math.PI * 2 * 0.075/2)();
  },

  getPresidentLabelBg: function() { 
    return d3.svg.arc()
      .innerRadius(this.getPresInnerRadius())
      .outerRadius(this.getPresOuterRadius())
      .startAngle(Math.PI * 2 - Math.PI * 0.075)
      .endAngle(Math.PI * 2 + Math.PI * 0.075)();
  },

  getSOSLabelBg: function() { 
    return d3.svg.arc()
      .innerRadius(this.getSOSInnerRadius())
      .outerRadius(this.getSOSOuterRadius())
      .startAngle(Math.PI * 2 - Math.PI * 0.075)
      .endAngle(Math.PI * 2 + Math.PI * 0.075)();
  },


  getSOSArc: function () {
    return d3.svg.arc()
      .innerRadius(this.getSOSInnerRadius())
      .outerRadius(this.getSOSOuterRadius());
  },

  getPresArc: function () {
    return d3.svg.arc()
      .innerRadius(this.getPresInnerRadius())
      .outerRadius(this.getPresOuterRadius());
  },

  getMaskArc: function() {
    return d3.svg.arc()
      .innerRadius(this.getPresOuterRadius())
      .outerRadius(this.getGraphOuterRadius());
  },

  getVisitArc: function(distance, startAngle, endAngle) {
    let radius = this.getDestinationDistance(distance);
    return d3.svg.arc()
      .innerRadius(radius - this.getPointRadius())
      .outerRadius(radius + this.getPointRadius())
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(this.getPointRadius())();
  },

  getDestinationDistance(distance) {
    let distanceScale = d3.scale.linear()
      .domain([0, DataStore.getMaxDistance()])
      .range([this.getGraphInnerRadius(), this.getGraphOuterRadius()]);
    return distanceScale(distance);
  },

  getSteamgraphYAxisDistance(visits) {
    let distanceScale = d3.scale.linear()
      .domain([0, DataStore.getMaxVisits()])
      .range([this.getGraphInnerRadius(), this.getGraphOuterRadius()]);
    return distanceScale(visits);
  },

  getDorlingLegend() {
    let ticks = (DataStore.getSelectedId()) ? [1,4,7,10] : [1,10,40,70,100],
      h = this.getTermWidth() * 2 + this.getGraphWidth() + this.data.titleOffset * this.data.widthHeight / 2 + this.getRadius(),
      midAngle = Math.PI * 0.25,
      separationAngle = Math.asin(this.getPointRadius((DataStore.getSelectedId()) ? 1 : 10) / h) * 4,
      totalAngle = separationAngle * 3 + ticks.reduce((a,v) => a + Math.asin(this.getPointRadius(v) / h) * 2, 0),
      farAngle = midAngle + totalAngle/2,
      offset = 0,
      data = [];
    ticks.forEach((v,i) => {
      let dorlingAngle = Math.asin(this.getPointRadius(v) / h) * 2;
      data.push({
        value: v,
        cx: h * Math.cos(farAngle - dorlingAngle/2 - separationAngle*i - offset), 
        cy: h * Math.sin(farAngle - dorlingAngle/2 - separationAngle*i - offset), 
        r: this.getPointRadius(v),
        class: (v == ticks[0]) ? 'latinamerica' : (v == ticks[1]) ? 'eastasia' : (v==ticks[2]) ? 'africa' : (v==ticks[3]) ? 'middleeast' : 'westerneurope',
        offset: Math.round(1000 * (0.75 - (farAngle - dorlingAngle/2 - separationAngle*i - offset - midAngle) / Math.PI)) / 10 + '%'
      });
      offset += dorlingAngle;
    });
    return data;
  },



  getHamburgerStyle() {
    return {
      position: 'fixed',
      top: this.getTermWidth(),
      left: window.innerWidth / 2 - this.getWidthHeight() / 2 + this.getTermWidth()
    };
  }


};

// Mixin EventEmitter functionality
Object.assign(DimensionsStore, EventEmitter.prototype);

// Register callback to handle all updates
DimensionsStore.dispatchToken = AppDispatcher.register((action) => {

  switch (action.type) {
  case 'parseData':
  case 'windowResized':
    DimensionsStore.calculate(Math.min(window.innerHeight, window.innerWidth));
    break;
  }
});

export default DimensionsStore;