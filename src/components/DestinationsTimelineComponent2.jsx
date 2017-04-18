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
      d: DimensionsStore.getVisitArc(this.props.destination.properties.distance, DataStore.getDateAngle(this.props.destination.properties.start_date), DataStore.getDateAngle(this.props.destination.properties.end_date))
    };
  }

  componentWillEnter(callback) {
    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(750)
      .attrTween('d', (d) => (t) => DimensionsStore.getVisitArc(this.props.destination.properties.distance, d3.interpolate(this.props.originAngle, DataStore.getDateAngle(this.props.destination.properties.start_date))(t), d3.interpolate(this.props.originAngle, DataStore.getDateAngle(this.props.destination.properties.end_date))(t)))
      .each('end', () => {
        this.setState({
          d: DimensionsStore.getVisitArc(this.props.destination.properties.distance, DataStore.getDateAngle(this.props.destination.properties.start_date), DataStore.getDateAngle(this.props.destination.properties.end_date))
        });
        callback();
      }); 
  }

  componentWillLeave(callback) { callback(); }

  componentWillReceiveProps(nextProps) { 
    this.setState({
      d: DimensionsStore.getVisitArc(this.props.destination.properties.distance, DataStore.getDateAngle(this.props.destination.properties.start_date), DataStore.getDateAngle(this.props.destination.properties.end_date))
    });
  }

  render() {
    return (
      <path
        d={this.state.d }
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