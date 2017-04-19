// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

import DataStore from '../stores/DataStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';

// main app container
export default class YearTick extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      yearData: this.props.yearData
    };
  }

  componentWillEnter(callback) { callback(); }

  componentWillLeave(callback) {callback(); }

  componentWillReceiveProps(nextProps) {
    // d3.select(ReactDOM.findDOMNode(this)).select('line')
    //   .transition()
    //   .duration(750)
    //   .attrTween('x1', (d) => (t) => DimensionsStore.getTimelineTickInnerX(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
    //   .attrTween('y1', (d) => (t) => DimensionsStore.getTimelineTickInnerY(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
    //   .attrTween('x2', (d) => (t) => DimensionsStore.getTimelineTickOuterX(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
    //   .attrTween('y2', (d) => (t) => DimensionsStore.getTimelineTickOuterY(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)));
  }

  render() {
    return (
      <g>
        <line
          x1 = { DimensionsStore.getTimelineTickInnerX(this.props.angle) }
          y1 = { DimensionsStore.getTimelineTickInnerY(this.props.angle) }
          x2 = { DimensionsStore.getTimelineTickOuterX(this.props.angle) }
          y2 = { DimensionsStore.getTimelineTickOuterY(this.props.angle) }
          className={ 'destination ' + this.props.region.replace(/ /g,'').toLowerCase() }
          strokeWidth={ 1.5 }
        />

        <circle
          cx = { DimensionsStore.getTimelineTickOuterX(this.props.angle) }
          cy = { DimensionsStore.getTimelineTickOuterY(this.props.angle) }
          r={ DimensionsStore.getPointRadius() * 3 }
          className={ 'destination ' + this.props.region.replace(/ /g,'').toLowerCase() }
        />
      </g>
    );
  }

}