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

  componentWillEnter(callback) { console.log(this); callback(); }

  componentWillLeave(callback) { callback(); }

  componentWillUnmount() {
    // cancel transitions
    d3.select(ReactDOM.findDOMNode(this)).select('line').transition();
    d3.select(ReactDOM.findDOMNode(this)).select('text').transition();
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.yearData.startAngle !== nextProps.yearData.startAngle || this.state.yearData.endAngle !== nextProps.yearData.endAngle ) {
      d3.select(ReactDOM.findDOMNode(this)).select('line')
        .transition()
        .duration(750)
        .attrTween('x1', (d) => (t) => DimensionsStore.getTimelineTickInnerX(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
        .attrTween('y1', (d) => (t) => DimensionsStore.getTimelineTickInnerY(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
        .attrTween('x2', (d) => (t) => DimensionsStore.getTimelineTickOuterX(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
        .attrTween('y2', (d) => (t) => DimensionsStore.getTimelineTickOuterY(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
        .each('end', () => {
          this.setState({
            yearData: nextProps.yearData
          });
        });

      d3.select(ReactDOM.findDOMNode(this)).select('text')
        .transition()
        .duration(750)
        .attrTween('x', (d) => (t) => DimensionsStore.getTimelineLabelX(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
        .attrTween('y', (d) => (t) => DimensionsStore.getTimelineLabelY(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)))
        .attrTween('transform', (d) => (t) => 'rotate(' + (d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)/Math.PI * 180 + ((d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t) + DataStore.getTimelineRotationRadians()) % (Math.PI * 2) > Math.PI ? 90 : 270)) + ' ' + DimensionsStore.getTimelineLabelX(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)) + ' ' + DimensionsStore.getTimelineLabelY(d3.interpolate(this.state.yearData.startAngle, nextProps.yearData.startAngle)(t)) + ')');

    }

  }

  render() {
    return (
      <g>
        <line
          x1 = { DimensionsStore.getTimelineTickInnerX(this.state.yearData.startAngle) }
          y1 = { DimensionsStore.getTimelineTickInnerY(this.state.yearData.startAngle) }
          x2 = { DimensionsStore.getTimelineTickOuterX(this.state.yearData.startAngle) }
          y2 = { DimensionsStore.getTimelineTickOuterY(this.state.yearData.startAngle) }
          stroke= '#446'
          strokeWidth={ 0.5 }
        />

        <text
          x = { DimensionsStore.getTimelineLabelX(this.state.yearData.startAngle) }
          y = { DimensionsStore.getTimelineLabelY(this.state.yearData.startAngle) }
          fill= '#446'
          textAnchor='start'
          fontSize={ DimensionsStore.getTimelineLabelSize() }
          alignmentBaseline='middle'
          transform={'rotate(' + (this.state.yearData.startAngle/Math.PI * 180 + ((this.state.yearData.startAngle + DataStore.getTimelineRotationRadians()) % (Math.PI * 2) > Math.PI  ? 90 : 270)) + ' ' + DimensionsStore.getTimelineLabelX(this.state.yearData.startAngle) + ' ' + DimensionsStore.getTimelineLabelY(this.state.yearData.startAngle) + ')'}
        >
          { this.props.label }
        </text>
      </g>
    );
  }

}