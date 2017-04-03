import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

import d3 from 'd3';

import DataStore from './DataStore.js';

const DimensionsStore = {

  data: {
    mapProportion: 2/3,
    ringProportion: 1/3,
    termsProportion: 1/18,
    graphProportion: 3/18,
    yearProportion: 2/18
  },

  calculate: function(dimension) { this.data.widthHeight = dimension; },

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

  getTimelineTickOuterRadius: function() { return this.getTimelineLabelRadius() - 4; },

  getTimelineLabelRadius: function() { return this.getRadius() + this.getTermWidth() * 2 + this.getGraphWidth(); },

  getGraphInnerRadius: function() { return this.getPresOuterRadius(); },

  getGraphOuterRadius: function() { return this.getRadius() + this.getTermWidth() * 2 + this.getGraphWidth(); },

  getTermWidth: function() { return (this.data.widthHeight * this.data.termsProportion) / 2; },

  getGraphWidth: function() { return (this.data.widthHeight * this.data.graphProportion) / 2; },

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