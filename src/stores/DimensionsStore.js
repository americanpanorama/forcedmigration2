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

  getTimelineTickOuterRadius: function() { return this.getRadius() + this.getTermWidth() * 2 + this.getGraphWidth(); },

  getTimelineLabelRadius: function() { return this.getRadius() + this.getTermWidth() * 2.5 + this.getGraphWidth(); },

  getGraphInnerRadius: function() { return this.getPresOuterRadius(); },

  getGraphOuterRadius: function() { return this.getRadius() + this.getTermWidth() * 2 + this.getGraphWidth(); },

  getTermWidth: function() { return (this.data.widthHeight * this.data.termsProportion) / 2; },

  getGraphWidth: function() { return (this.data.widthHeight * this.data.graphProportion) / 2; },

  getTermsLabelSize: function() { return this.getTermWidth() / 2; },

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

  getAboutMapLinkSize: function() { return this.getTermWidth() * 0.75; },

  getTimelineLabelSize: function() { return this.getTermWidth() / 3; },

  getRegionLabelSize: function() { return this.getTermWidth() / 2.5; },

  getPointRadius: function(num) { 
    num = (num) ? num : 1;
    let radius = Math.sqrt(num * this.data.pointPercentOfRadius * this.getRadius() * this.data.pointPercentOfRadius * this.getRadius());
    return radius; 
  },

  getDetailsControlStyle: function() {
    return {
      top: window.innerHeight / 2 - this.getRadius() *  0.4,
      left: window.innerWidth / 2 - this.getRadius() *  0.6,
      width: this.getRadius() * 0.4,
      height: this.getTermWidth() ,
      fontSize: this.getTermWidth() / 2
    };
  },


  getDetailsStyle: function() {
    return {
      top: window.innerHeight / 2 - this.getRadius() *  0.4 + this.getTermWidth(),
      left: window.innerWidth / 2 - this.getRadius() *  0.6,
      width: this.getRadius() * 0.4,
      height: window.innerHeight * 0.7,
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
      fontSize: this.getTermWidth() / 1.5
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

  getDestinationDistance(distance) {
    let distanceScale = d3.scale.linear()
      .domain([0, DataStore.getMaxDistance()])
      .range([this.getGraphInnerRadius(), this.getGraphOuterRadius()]);
    return distanceScale(distance);
  },

      // widthHeight: widthHeight,
      // diameter: widthHeight * mapProportion,
      // radius: ,
      // ringWidth: widthHeight * (1 - mapProportion) / 2,
      // graphRegionOffset: (widthHeight * (1 - mapProportion) / 2 - 60) / 9,
      // detailsTop: window.innerHeight / 2 + widthHeight * mapProportion /2 *  0.1,
      // detailsLeft: window.innerWidth / 2 - widthHeight * mapProportion /2 *  0.6,
      // detailsWidth: widthHeight * mapProportion / 2 * 0.5,
      // detailsHeight: widthHeight * mapProportion / 2 * 0.9,
      // termRingsWidth: widthHeight * ringProportion / 12,
      // graphWidth: widthHeight * ringProportion / 6,
      // yearRingWidth: widthHeight * ringProportion / 6,
      // sosInnerRadius: widthHeight * mapProportion / 2,
      // sosOuterRadius: widthHeight * (mapProportion + termsProportion) / 2,
      // presInnerRadius: widthHeight * (mapProportion + termsProportion) / 2,
      // presOuterRadius: widthHeight * (mapProportion + termsProportion + termsProportion) / 2,
      // graphInnerRadius: widthHeight * (mapProportion + termsProportion + termsProportion) / 2,
      // graphOuterRadius: widthHeight * (mapProportion + termsProportion + termsProportion + graphProportion) / 2,
      // yearTickInnerRadius: widthHeight * (mapProportion + termsProportion + termsProportion) / 2,
      // yearTickOuterRadius: widthHeight * (mapProportion + termsProportion + termsProportion + graphProportion) / 2,
      // yearLabelInnerRadius: widthHeight * (mapProportion + termsProportion + termsProportion + graphProportion) / 2

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