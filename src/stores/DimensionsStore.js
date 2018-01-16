import { EventEmitter } from 'events';
import AppDispatcher from '../utils/AppDispatcher';
import { AppActionTypes } from '../utils/AppActionCreator';

import d3 from 'd3';

const DimensionsStore = {

  data: {
    app      : 0,
    mapHeight: 0,
    mapWidth : 0,
    tab      : 0,
    tabPanel : 0,
    bubble   : 0
  },

  calculate: function(dimension) { 
    // min-height: 700
    this.data.app = Math.max(window.innerHeight, 700);

    // .tabs top position = 77
    //  top & bottom borders = 20
    //  bottom padding = 15
    this.data.tab = this.data.app - 77 - 20 - 15;

    // tab-nav = 33
    this.data.tabPanel = this.data.tab - 33;

    // timeline height = 200
    this.data.mapHeight = this.data.tab - 200;

    // chart height = 326
    // padding = 15
    this.data.bubble = this.data.tabPanel - 326 - 30; // padding increased to 35 to prevent scrollbars

    this.data.mapWidth = (document.getElementsByClassName('population-map-container').length > 0) ? document.getElementsByClassName('population-map-container')[0].offsetWidth: 617;

    this.data.sidebarWidth = (document.getElementsByClassName('sidebar').length > 0) ? document.getElementsByClassName('sidebar')[0].offsetWidth: 617;

    this.data.barChartLabelWidth = 150;
    this.data.barChartLabelGutter = 20;
    this.data.barChartCountLabelWidth = 50;

    this.emit(AppActionTypes.storeChanged);
    
  
  },

  getData: function() { return this.data; },

  getMapHeight: function() { return this.data.mapHeight; },

  getMapWidth: function() { return this.data.mapWidth; },

  getMapScale: function() { return Math.min(this.getMapWidth()/960* 2400, this.getMapHeight()/500 * 2400); }, // I calculated these with trial and error--sure there's a more precise way as this will be fragile if the width changes 

  getBubbleRadius: function(v, options = {}) {
    let r = d3.scale.sqrt()
      .domain([0, 1200])
      .range([0, 2]);

    return r(Math.abs(v));
  },

  getBarChartStyle: function() {
    return {
      width: this.data.sidebarWidth
    };
  },

  getBarChartBarWidth: function() { return (this.getBarChartStyle().width - this.data.barChartLabelWidth - this.data.barChartLabelGutter)/2 - this.data.barChartCountLabelWidth; },

  getBarChartDividerX: function() { return this.data.barChartLabelWidth + this.getBarChartBarWidth() + this.data.barChartCountLabelWidth; },

  getBarChartLabelWidth: function() { return this.data.barChartLabelWidth; },


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