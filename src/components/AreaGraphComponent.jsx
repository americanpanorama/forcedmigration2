// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from '../utils/AppActionCreator';
import AppDispatcher from '../utils/AppDispatcher';



// main app container
export default class AreaGraph extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
      d: this.props.area(this.props.data),
      angles: this.props.angles
    };
  }

  componentWillEnter(callback) {
    callback();
  }

  componentWillLeave(callback) {
    callback();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.selectedId !== nextProps.selectedId) {
      d3.select(ReactDOM.findDOMNode(this))
        .transition()
        .duration(750)
        .attrTween('d', (d) => (t) => this.props.area.angle((d,i) => d3.interpolate(this.state.angles[i], nextProps.angles[i])(t))(this.props.data) )
        .each('end', () => {
          this.setState({
            angles: nextProps.angles
          });
        });
    }
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