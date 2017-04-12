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
import DimensionsStore from '../stores/DimensionsStore.js';

// main app container
export default class DestinationTimeline extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      angle: this.props.angle,
      cx: DimensionsStore.getTimelineDestinationX(this.props.angle, this.props.destination.properties.distance),
      cy: DimensionsStore.getTimelineDestinationY(this.props.angle, this.props.destination.properties.distance),
    };
  }

  componentWillEnter(callback) {
    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(750)
      .attrTween('cx', (d) => (t) => DimensionsStore.getTimelineDestinationX(d3.interpolate(this.props.originAngle, this.props.angle)(t), this.props.destination.properties.distance))
      .attrTween('cy', (d) => (t) => DimensionsStore.getTimelineDestinationY(d3.interpolate(this.props.originAngle, this.props.angle)(t), this.props.destination.properties.distance))
      .each('end', () => {
        this.setState({
          angle: this.props.angle,
          cx: DimensionsStore.getTimelineDestinationX(this.props.angle, this.props.destination.properties.distance),
          cy: DimensionsStore.getTimelineDestinationY(this.props.angle, this.props.destination.properties.distance),
        });
        callback();
      }); 
  }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) { 
    if (this.state.cx !== DimensionsStore.getTimelineDestinationX(nextProps.angle, nextProps.destination.properties.distance)) {
      this.setState({
        cx: DimensionsStore.getTimelineDestinationX(nextProps.angle, nextProps.destination.properties.distance),
        cy: DimensionsStore.getTimelineDestinationY(nextProps.angle, nextProps.destination.properties.distance)
      });
    }
  }

  render() {
    return (
      <circle
        cx={ this.state.cx }
        cy={ this.state.cy }
        r={ (this.props.selected) ? DimensionsStore.getPointRadius() * 1.25 : DimensionsStore.getPointRadius() }
        fillOpacity={ (this.props.selected) ? 1 : DataStore.hasVisibleLocation() ? 0.2 : 0.7 }
        strokeWidth={ (this.props.selected) ? DimensionsStore.getPointRadius() / 2 : 0 }
        className={ 'destination ' + this.props.destination.properties.new_region.replace(/ /g,'').toLowerCase() }
        onMouseEnter={ this.props.onHover }
        onMouseLeave={ this.props.onMouseLeave }
        onClick={ this.props.onClick }
        id={ this.props.destination.properties.cartodb_id }
        key={ 'destinationRing' + this.props.destination.properties.cartodb_id }
      />
    );
  }

}