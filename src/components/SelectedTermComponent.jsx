// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

import ReactTransitionGroup from 'react-addons-transition-group';

import DataStore from '../stores/DataStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';

// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from '../utils/AppActionCreator';
import AppDispatcher from '../utils/AppDispatcher';


// main app container
export default class SelectedTerm extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      d: this.props.graphArc.startAngle(this.props.startAngle).endAngle(this.props.endAngle)(),
      rotate: (this.props.startAngle - 0.01) / Math.PI * 180,
      rotateLabel: (this.props.startAngle - 0.105) / Math.PI * 180 + 90,
    };
  }

  componentWillEnter(callback) {
    let middleAngle = (this.props.startAngle + this.props.endAngle) / 2;
    d3.select(ReactDOM.findDOMNode(this))
      .transition()
      .duration(750)
      .attrTween('d', (d) => (t) => {
        return this.props.graphArc
          .startAngle((d,i) => d3.interpolate(middleAngle, this.props.startAngle)(t))
          .endAngle((d,i) => d3.interpolate(middleAngle, this.props.endAngle)(t))();
      })
      .each('end', () => {
        this.setState({
          d: this.props.graphArc.startAngle(this.props.startAngle).endAngle(this.props.endAngle)(),
          rotate: (this.props.startAngle + 0.01) / Math.PI * 180,
          rotateLabel: (this.props.startAngle - 0.105) / Math.PI * 180 + 90,
        });
        callback();
      });
  }

  componentWillLeave(callback) {
    callback();
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.d !== nextProps.graphArc.startAngle(nextProps.startAngle).endAngle(nextProps.endAngle)()) {
      this.setState({
        d: nextProps.graphArc.startAngle(nextProps.startAngle).endAngle(nextProps.endAngle)(),
        rotate: (this.props.startAngle + 0.01) / Math.PI * 180,
        rotateLabel: (this.props.startAngle - 0.105) / Math.PI * 180 + 90,
      });
    }
  }

  render() {
    return (
      <g>
        <path
          d={ this.state.d }
          transform={ 'translate(' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')' }
          strokeWidth={ 1 }
          className='termMask'
        />

        {/* axis label */}

        <path
          d={ this.props.graphArc.startAngle(this.props.startAngle - 0.105).endAngle(this.props.startAngle)() }
          transform={ 'translate(' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')' }
          className='axisLabelMask'
        />

        <text
          x={ DimensionsStore.getTimelineDestinationX(this.props.startAngle - 0.10, 6000 * 1609.344) }
          y={ DimensionsStore.getTimelineDestinationY(this.props.startAngle - 0.10, 6000 * 1609.344) }
          textAnchor='middle'
          className='axisLabel'
          fontSize={ DimensionsStore.getTimelineLabelSize() }
          transform={ 'rotate(' + this.state.rotateLabel + ' ' + DimensionsStore.getTimelineDestinationX(this.props.startAngle - 0.10, 6000 * 1609.344) + ' ' + DimensionsStore.getTimelineDestinationY(this.props.startAngle - 0.10, 6000 * 1609.344) + ')'  }
        >
          miles from DC
        </text>

        { [10, 7.5, 5, 2.5].map(milesAway => {
          return (
            <text
              x={ DimensionsStore.getTimelineDestinationX(this.props.startAngle - 0.01, milesAway * 1000 * 1609.344) }
              y={ DimensionsStore.getTimelineDestinationY(this.props.startAngle - 0.01, milesAway * 1000 * 1609.344) }
              textAnchor='end'
              alignmentBaseline='middle'
              fontSize={ DimensionsStore.getTimelineLabelSize() }
              className='axisLabel'
              key={ 'tickDistanceLabel' + milesAway }
              transform={ 'rotate(' + this.state.rotate + ' ' + DimensionsStore.getTimelineDestinationX(this.props.startAngle - 0.01, milesAway * 1000 * 1609.344) + ' ' + DimensionsStore.getTimelineDestinationY(this.props.startAngle - 0.01, milesAway * 1000 * 1609.344) + ')'  }
            >
              { milesAway + 'K' }
            </text>
          );
        })}
      </g>
    );
  }

}