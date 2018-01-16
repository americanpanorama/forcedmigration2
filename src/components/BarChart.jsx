import * as React from 'react';
import * as d3 from 'd3';

import StateMigrationGraph from './StateMigrationGraph.jsx';
import DimensionsStore from '../stores/DimensionsStore';

export default class BarChart extends React.Component {

  constructor (props) { super(props); }

  render() {
    return (
      <svg 
        { ...DimensionsStore.getBarChartStyle() }
        height={ this.props.height }
        className='barchart'
      >

        <text
          x={ DimensionsStore.getBarChartDividerX() + 3  }
          y={ 34 }
          className='inmgrations'
        >
          Inmigrations
        </text>

        <text
          x={ DimensionsStore.getBarChartDividerX() + 3  }x={ DimensionsStore.getData().barChartLabelWidth * 2/3 + 3 }
          y={ 34 }
        >
          Net
        </text>

        <text
          x={ DimensionsStore.getBarChartDividerX() - 3 }
          y={ 34 }
          className='outmigrations'
        >
          Outmigrations
        </text>

        <g>
          { this.props.yearData.map(stateData => 
            <StateMigrationGraph
              { ...stateData }
              key={ 'stateData' + stateData.state }
            />
          )}
        </g>


      </svg>
  	);
  }
}