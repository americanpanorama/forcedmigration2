import * as React from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';


export default class Polygon extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      color: this.props.color,
      opacity: this.props.opacity
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.color !== nextProps.color || this.props.opacity !== nextProps.opacity) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(4000)
        //.duration((this.state.windowDimensions.width == DimensionsStore.getMapDimensions().width && this.state.windowDimensions.height == DimensionsStore.getMapDimensions().height) ? 750 : 0) // immediately replace on window resize
        .attr('fill', nextProps.color)
        .attr('fill-opacity', nextProps.opacity)
        .each('end', () => {
          this.setState({
            opacity: nextProps.opacity,
            color: nextProps.color,
          });
        });
    };
  }

  render() {
    return (
      <path
        d={ this.props.d }
        stroke='grey'
        strokeOpacity={0.5}
        fill={ this.state.color }
        fillOpacity={ this.state.opacity }
        strokeWidth={ 0 } 
      />
    );
  }
}