import * as React from 'react';

import ReactDOM from 'react-dom';
import d3 from 'd3';
import DimensionsStore from '../stores/DimensionsStore.js';

export default class Bubble extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      r: this.props.r / this.props.z,
      color: this.props.color,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.color !== nextProps.color) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(500)
        //.duration((this.state.windowDimensions.width == DimensionsStore.getMapDimensions().width && this.state.windowDimensions.height == DimensionsStore.getMapDimensions().height) ? 750 : 0) // immediately replace on window resize
        .attr('r', 0)
        .each('end', () => {
          d3.select(ReactDOM.findDOMNode(this))
            .style('fill', nextProps.color)
            .transition()
            .duration(500)
            //.duration((this.state.windowDimensions.width == DimensionsStore.getMapDimensions().width && this.state.windowDimensions.height == DimensionsStore.getMapDimensions().height) ? 750 : 0) // immediately replace on window resize
            .attr('r', nextProps.r)
            .each('end', () => {
              this.setState({
                r: nextProps.r,
                color: nextProps.color,
                //windowDimensions: DimensionsStore.getMapDimensions()
              });
            });
        });


    }

    if (this.props.r !== nextProps.r && this.props.color == nextProps.color) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(1000)
        //.duration((this.state.windowDimensions.width == DimensionsStore.getMapDimensions().width && this.state.windowDimensions.height == DimensionsStore.getMapDimensions().height) ? 750 : 0) // immediately replace on window resize
        .attr('r', nextProps.r)
        .style('fill', nextProps.color)
        .each('end', () => {
          this.setState({
            r: nextProps.r,
            color: nextProps.color,
            //windowDimensions: DimensionsStore.getMapDimensions()
          });
        });
    }
  }

  render () {
    return (
      <circle className='dorling'
        cx={ this.props.cx }
        cy={ this.props.cy }
        r={ this.state.r }
        fill={ this.state.color }
        //style={{ fill: this.state.color }}
        // style={ {
        //   fillOpacity: (this.props.highlightedCities.length == 0) || this.props.highlightedCities.includes(this.props.city_id) ? 1 : 0.2,
        //   strokeWidth: this.props.strokeWidth,
        //   strokeOpacity: ((this.props.percentFamiliesOfColor >= this.props.pocSpan[0] && this.props.percentFamiliesOfColor <= this.props.pocSpan[1]) && (this.props.highlightedCities.length == 0 || this.props.highlightedCities.includes(this.props.city_id))) ? 1 : 0,
        //   stroke: this.props.stroke
        // } }
      />
    );
  }
}