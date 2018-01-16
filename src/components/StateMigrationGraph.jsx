import * as React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

import DimensionsStore from '../stores/DimensionsStore';
import { formatNumber } from '../utils/HelperFunctions';

export default class ProjectDisplacementGraph extends React.Component {

  constructor (props) { 
    super(props); 

    this.state ={
      y: this.props.y,
      xOutmigrations: this.props.xOutmigrations,
      widthOutmigrations: this.props.widthOutmigrations,
      xOutmigrationsLabel: this.props.xOutmigrations - 3,
      widthInmigrations: this.props.widthInmigrations,
      xInmigrationsLabel: this.props.xInmigrations + this.props.widthInmigrations + 3,
    };
  }

  componentWillReceiveProps(nextProps) {
    const g = d3.select(ReactDOM.findDOMNode(this)),
      staggerMultiplier = 5;
    if (this.props.y !== nextProps.y) {
      g.transition()
        .delay(750 + nextProps.y * staggerMultiplier)
        .duration(750)
        .attr('transform', 'translate(0 ' + (nextProps.y + 42) +')')
        .each('end', () => {
          this.setState({
            y: this.props.y
          });
        });
    }

    if (this.props.inmigrations !== nextProps.inmigrations || this.props.outmigrations !== nextProps.outmigrations) {
      g.select('rect.outmigrations')
        .transition()
        .delay(nextProps.y * staggerMultiplier)
        .duration(750)
        .attr('x', nextProps.xOutmigrations)
        .attr('width', nextProps.widthOutmigrations)
        .each('end', () => {
          this.setState({
            xOutmigrations: nextProps.xOutmigrations,
            widthOutmigrations: nextProps.widthOutmigrations
          });
        });

      g.select('rect.inmigrations')
        .transition()
        .delay(nextProps.y * staggerMultiplier)
        .duration(750)
        .attr('width', nextProps.widthInmigrations)
        .each('end', () => {
          this.setState({
            widthInmigrations: nextProps.widthInmigrations
          });
        });

      g.select('text.outmigrations')
        .transition()
        .delay(nextProps.y * staggerMultiplier)
        .duration(750)
        .attr('x', nextProps.xOutmigrations - 3)
        .each('end', () => {
          this.setState({
            xOutmigrationLabel: nextProps.xOutmigrations - 3
          });
        });

      g.select('text.inmigrations')
        .transition()
        .delay(nextProps.y * staggerMultiplier)
        .duration(750)
        .attr('x', nextProps.xInmigrations + nextProps.widthInmigrations + 3)
        .each('end', () => {
          this.setState({
            xInmigrationLabel: nextProps.xInmigrations + nextProps.widthInmigrations + 3
          });
        });
    }
  }

  render() {
    return (
      <g 
        // onMouseEnter={ (this.props.the_geojson) ? this.props.onProjectInspected : null }
        // onMouseLeave={ (this.props.the_geojson) ? this.props.onProjectOut : null }
        // onClick={ this.props.onProjectSelected }
        // id={ this.props.project_id  }
        transform={'translate(0 ' + (this.state.y + 42) +')'}
      >
        <text
          x={ DimensionsStore.getData().barChartLabelWidth * 2/3 }
          y={ 0 + 12}
          className={ 'state ' + ((this.props.the_geojson) ? ' hasFootprint' : '') + ((this.props.inspectedProject && this.props.inspectedProject != this.props.project_id) ? ' notInspected' : '') }
          id={ this.props.state  }
        >
          { this.props.state }
        </text>

        <text
          x={ DimensionsStore.getData().barChartLabelWidth * 2/3 + 3 }
          y={ 0 + 12 }
          className={ 'net ' + ((this.props.net > 0) ? ' in' : ' out') }
        >
          { formatNumber(Math.abs(this.props.net)) }
        </text>
       
        <line
          x1={ this.props.xInmigrations }
          x2={ this.props.xInmigrations }
          y1={0}
          y2={20}
          className='divider'
        />


        <rect
          x={this.state.xOutmigrations}
          y={1}
          width={ this.state.widthOutmigrations}
          height={12}
          className={ 'outmigrations ' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.state) ? ' notInspected' : '') }
        />

        { (this.props.outmigrations > 0) ?
          <text
            x={ this.state.xOutmigrationsLabel }
            y={ 0 + 12 }
            className={'count outmigrations' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.state) ? ' notInspected' : '')}
          >
            { formatNumber(this.props.outmigrations) }
          </text> : ''
        }

        <rect
          x={this.props.xInmigrations}
          y={1}
          width={ this.state.widthInmigrations }
          height={12}
          className={'inmigrations ' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.state) ? ' notInspected' : '')}
        />
        { (this.props.inmigrations > 0) ?
           <text
            x={ this.state.xInmigrationsLabel }
            y={ 0 + 12 }
            className={'count inmigrations' + ((this.props.inspectedProject && this.props.inspectedProject != this.props.state) ? ' notInspected' : '')}
          >
            { formatNumber(this.props.inmigrations) }
          </text> : ''
        }


      </g>
    );
  }

}