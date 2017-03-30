// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

import ReactTransitionGroup from 'react-addons-transition-group';

// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from '../utils/AppActionCreator';
import AppDispatcher from '../utils/AppDispatcher';


// main app container
export default class Term extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      startAngle: this.props.startAngle,
      endAngle: this.props.endAngle,
      rotate: (this.props.startAngle / Math.PI + (this.props.endAngle - this.props.startAngle) / (Math.PI * 2)) * 180,
      color: this.props.color
    };
  }

  componentWillEnter(callback) {
    callback();
  }

  componentWillLeave(callback) {
    callback();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.startAngle !== nextProps.startAngle || this.props.endAngle !== nextProps.endAngle) {
      d3.select(ReactDOM.findDOMNode(this)).select('path')
        .transition()
        .duration(750)
        .attrTween('d', (d,i,a) => {
          let interpolateStart = d3.interpolate(this.state.startAngle, nextProps.startAngle),
            interpolateEnd = d3.interpolate(this.state.endAngle, nextProps.endAngle);
          return (t) => {
            let startAngle = interpolateStart(t),
              endAngle = interpolateEnd(t),
              tau = 2 * Math.PI;
            return this.props.theArc.startAngle(startAngle).endAngle(endAngle)();
          }; 
        })
        .style('fill', nextProps.color)
        .each('end', () => {
          this.setState({
            color: nextProps.color,
            startAngle: nextProps.startAngle,
            endAngle: nextProps.endAngle
          });
        });
      d3.select(ReactDOM.findDOMNode(this)).select('text')
        .transition()
        .duration(750)
        .attrTween('transform', (d,i,a) => {
          let interpolate = d3.interpolate(this.state.rotate, (this.props.startAngle / Math.PI + (this.props.endAngle - this.props.startAngle) / (Math.PI * 2)) * 180);
          return (t) => { return 'rotate(' + interpolate(t) + ',' + this.props.radius + ',' + this.props.radius + ')'; };
        })
        .each('end', () => {
          this.setState({
            rotate: (this.props.startAngle / Math.PI + (this.props.endAngle - this.props.startAngle) / (Math.PI * 2)) * 180
          });
        });
    }
  }

  render() {
    return (
      <g key={'termArc' + this.props.id}>
        <path
          d={ this.props.theArc.startAngle(this.state.startAngle).endAngle(this.state.endAngle)() }
          transform={ 'translate(' + this.props.radius + ',' + this.props.radius + ')' }
          id={ this.props.id }
          onClick={ this.props.onOfficeholderSelected }
          className={ ((this.props.selected) ? 'selected' : '') + ((this.props.visited) ? ' visited' : '') }
        />

        <text 
          transform={ 'rotate(' + this.state.rotate + ',' + this.props.radius + ',' + this.props.radius + ')' }
          className={ (this.props.selected) ? 'selected' : '' }
        >
          <textPath 
            xlinkHref={this.props.textHref} 
            startOffset='50%'
            pointerEvents='none'
          >
            { this.props.label }
          </textPath>
        </text>
      </g>
    );
  }

}