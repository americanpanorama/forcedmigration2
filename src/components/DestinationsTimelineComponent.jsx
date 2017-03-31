// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from '../utils/AppActionCreator';
import AppDispatcher from '../utils/AppDispatcher';

import DataStore from '../stores/DataStore.js';



// main app container
export default class DestinationTimeline extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      angle: this.props.angle,
      cx: this.props.dimensions.radius + this._distance()(this.props.destination.properties.distance) * Math.sin(this.props.angle),
      cy: this.props.dimensions.radius - this._distance()(this.props.destination.properties.distance) * Math.cos(this.props.angle),
    };
  }

  componentWillEnter(callback) {
    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(750)
      .attrTween('cx', (d) => (t) => { console.log(this.props.dimensions.radius + this._distance()(this.props.destination.properties.distance) * Math.sin(d3.interpolate(this.props.originAngle, this.props.angle)(t))); return this.props.dimensions.radius + this._distance()(this.props.destination.properties.distance) * Math.sin(d3.interpolate(this.props.originAngle, this.props.angle)(t));})
      .attrTween('cy', (d) => (t) => this.props.dimensions.radius - this._distance()(this.props.destination.properties.distance) * Math.cos(d3.interpolate(this.props.originAngle, this.props.angle)(t)))
      .each('end', () => {
        this.setState({
          angle: this.props.angle,
          cx: this.props.dimensions.radius + this._distance()(this.props.destination.properties.distance) * Math.sin(this.props.angle),
          cy: this.props.dimensions.radius - this._distance()(this.props.destination.properties.distance) * Math.cos(this.props.angle)
        });
        callback();
      });
    
  }

  componentWillLeave(callback) {
    callback();
  }



  componentWillReceiveProps(nextProps) {

  }

  _distance() {
    return d3.scale.linear()
      .domain([0, DataStore.getMaxDistance()])
      .range([this.props.dimensions.radius+60, this.props.dimensions.widthHeight/2 - 35]);
  }

  render() {
    return (
      <circle
        cx={ this.state.cx }
        cy={ this.state.cy }
        r={ 4 }
        className={ 'destination ' + this.props.destination.properties.new_region.replace(/ /g,'').toLowerCase() + ((this.props.selected) ? ' selected' : '') + ((this.props.unselected) ? ' unselected' : '')}
        onClick={ this.props.onClick }
        id={ this.props.destination.properties.cartodb_id }
        key={ 'destinationRing' + this.props.destination.properties.cartodb_id }
      />
    );
  }

}