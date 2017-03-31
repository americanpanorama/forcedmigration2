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
export default class YearTick extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      yearData: this.props.yearData
    };
  }

  componentWillEnter(callback) {
    callback();
  }

  componentWillLeave(callback) {
    callback();
  }

  componentWillReceiveProps(nextProps) {
    d3.select(ReactDOM.findDOMNode(this)).select('line')
      .transition()
      .duration(750)
      .attrTween('x1', (d) => (t) => this.props.dimensions.radius + (this.props.dimensions.widthHeight/2 - 35) * Math.sin(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
      .attrTween('y1', (d) => (t) => this.props.dimensions.radius - (this.props.dimensions.widthHeight/2 - 35) * Math.cos(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
      .attrTween('x2', (d) => (t) => this.props.dimensions.radius + (this.props.dimensions.radius + 60) * Math.sin(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
      .attrTween('y2', (d) => (t) => this.props.dimensions.radius - (this.props.dimensions.radius + 60)  * Math.cos(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)));

    d3.select(ReactDOM.findDOMNode(this)).select('text')
      .transition()
      .duration(750)
      .attrTween('x', (d) => (t) => this.props.dimensions.radius + (this.props.dimensions.widthHeight/2 - 20) * Math.sin(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
      .attrTween('y', (d) => (t) => this.props.dimensions.radius - (this.props.dimensions.widthHeight/2 - 20) * Math.cos(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
      .attrTween('transform', (d) => (t) => 'rotate(' + (d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)/Math.PI * 180 + (d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t) > Math.PI ? 90 : 270)) + ' ' + (this.props.dimensions.radius + (this.props.dimensions.widthHeight/2 - 20) * Math.sin(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t))) + ' ' + (this.props.dimensions.radius - (this.props.dimensions.widthHeight/2 - 20)  * Math.cos(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t))) + ')')
      .each('end', () => {
        this.setState({
          yearData: nextProps.yearData
        });
      });
  }

  render() {
    return (
      <g>
        <line
          x1 = {this.props.dimensions.radius + (this.props.dimensions.widthHeight/2 - 35) * Math.sin(this.state.yearData.startAngle)}
          y1 = {this.props.dimensions.radius - (this.props.dimensions.widthHeight/2 - 35)  * Math.cos(this.state.yearData.startAngle)}
          x2 = {this.props.dimensions.radius + (this.props.dimensions.radius + 60) * Math.sin(this.state.yearData.startAngle)}
          y2 = {this.props.dimensions.radius - (this.props.dimensions.radius + 60)  * Math.cos(this.state.yearData.startAngle)}
          stroke= '#446'
          strokeWidth={ 0.5 }
        />

        <text
          x = {this.props.dimensions.radius + (this.props.dimensions.widthHeight/2 - 20) * Math.sin(this.state.yearData.startAngle)}
          y = {this.props.dimensions.radius - (this.props.dimensions.widthHeight/2 - 20)  * Math.cos(this.state.yearData.startAngle)}
          fill= '#446'
          textAnchor='start'
          alignmentBaseline='middle'
          transform={'rotate(' + (this.state.yearData.startAngle/Math.PI * 180 + (this.state.yearData.startAngle > Math.PI ? 90 : 270)) + ' ' + (this.props.dimensions.radius + (this.props.dimensions.widthHeight/2 - 20) * Math.sin(this.state.yearData.startAngle)) + ' ' + (this.props.dimensions.radius - (this.props.dimensions.widthHeight/2 - 20)  * Math.cos(this.state.yearData.startAngle)) + ')'}
        >
          { this.props.label }
        </text>
      </g>
    );
  }

}