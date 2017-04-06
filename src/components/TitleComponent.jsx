// import node modules
import * as React from 'react';

import DataStore from '../stores/DataStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';



export default class SteamGraph extends React.Component {

  constructor (props) { super(props); }

  render() {
    return (
       <svg
        width={ DimensionsStore.getWidthHeight() }
        height={ DimensionsStore.getWidthHeight() }
        className='titleImage'
      > 
        <g
          transform={'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ') rotate(0 ' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')'}
        >
          <defs>
            <path 
              id='titleArcSegment'
              d={ DimensionsStore.getTitleLabelArc() }
            />
          </defs>

          <text 
            stroke='transparent'
            fontSize={ DimensionsStore.getTitleSize() }
            textAnchor='end'
          >
            <textPath xlinkHref="#titleArcSegment" startOffset='78%'>
              The Executive Abroad
            </textPath>
          </text>

          <text 
            stroke='transparent'
            fontSize={ DimensionsStore.getSubtitleSize() }
            textAnchor='start'
          >
            <textPath xlinkHref="#titleArcSegment" startOffset='79%'>
              1905-2016
            </textPath>
          </text>
        </g>
        
      </svg>
    );
  }
}