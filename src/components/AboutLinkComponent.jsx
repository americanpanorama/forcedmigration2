// import node modules
import * as React from 'react';

import DimensionsStore from '../stores/DimensionsStore';

// main app container
export default class AboutLink extends React.Component {

  render() {
    return (
      <svg
        width={ DimensionsStore.getWidthHeight() }
        height={ DimensionsStore.getWidthHeight() }
      > 
        <defs>
          <path 
            id='aboutArcSegment'
            d={ DimensionsStore.getAboutMapLinkArc() }
            transform={'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ') rotate(0 ' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')' }
          />
        </defs>

        <text 
          stroke='transparent'
          fontSize={ DimensionsStore.getAboutMapLinkSize() }
          textAnchor='middle'
          className='aboutLink'
        >
          <textPath 
            onClick={ this.props.onClick }
            xlinkHref="#aboutArcSegment" 
            startOffset='25%'
          >
            About this Map
          </textPath>
        </text>
      </svg>
    );
  }

}