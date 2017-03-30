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
export default class AreaGraph extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      d: this.props.area(this.props.data),
      angles: this.props.angles,
      ys: this.props.ys,
      y0s: this.props.y0s
    };
  }

  componentWillEnter(callback) {
    callback();
  }

  componentWillLeave(callback) {
    callback();
  }

  componentWillReceiveProps(nextProps) {
    let offsetBase = 94;
    let radiusStack = d3.scale.linear()
      .domain([0, DataStore.getMaxVisits()])
      .range([this.props.dimensions.radius+offsetBase, this.props.dimensions.widthHeight/2 - 5]);



    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(750)
      //.innerRadius((d,i) => this.props.radiusStack(d3.interpolate(this.state.ys[i], nextProps.ys[i])(t))).outerRadius((d,i) => this.props.radiusStack(d3.interpolate(this.state.y0s[i], nextProps.y0s[i])(t)))
      .attrTween('d', (d) => (t) => this.props.area.angle((d,i) => d3.interpolate(this.state.angles[i], nextProps.angles[i])(t)).innerRadius((d,i) => { return radiusStack(d3.interpolate(this.state.y0s[i], nextProps.y0s[i])(t)); }).outerRadius((d,i) => radiusStack(d3.interpolate(this.state.y0s[i] + this.state.ys[i], nextProps.y0s[i] + nextProps.ys[i])(t)))(this.props.data) )
      .each('end', () => {
        this.setState({
          angles: nextProps.angles,
          ys: this.props.ys,
          y0s: this.props.y0s,
          d: this.props.area(nextProps.data)
        });
      });
  }

  render() {
    return (
      <path
        d={ this.state.d }
        className={ this.props.region }
        key={ 'area' + this.props.region }
      />
    );
  }

}