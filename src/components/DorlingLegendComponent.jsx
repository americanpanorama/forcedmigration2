// import node modules
import * as React from 'react';

import DimensionsStore from '../stores/DimensionsStore';

// main app container
export default class DorlingLegend extends React.Component {

  render() {
    return (
      <svg
        width={ DimensionsStore.getWidthHeight() }
        height={ DimensionsStore.getWidthHeight() }
        className='titleImage'
      > 
        <defs>
          <path 
            id='dorlingArcSegment'
            d={ DimensionsStore.getDorlingLegendValuesArc() }
            transform={'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ') rotate(0 ' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')' }
          />
          <path 
            id='dorlingArcLabelSegment'
            d={ DimensionsStore.getDorlingLegendArc() }
            transform={'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ') rotate(0 ' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')' }
          />
        </defs>
        { DimensionsStore.getDorlingLegend().map(dl => {
          return (
            <g 
              key={ 'dorlinglegend' + dl.value }
              className='dorlinglegend'
            >
              <circle
                cx={ dl.cx }
                cy={ dl.cy }
                r={ dl.r }
                className={ 'increment ' + dl.class }
                transform={'translate(' + DimensionsStore.getWidthHeight() / 2 + ' ' + DimensionsStore.getWidthHeight() / 2 + ')'}
              />
              <text 
                stroke='transparent'
                fontSize={ DimensionsStore.getTimelineLabelSize() }
                textAnchor='middle'
                alignmentBaseline='hanging'
              >
                <textPath 
                  xlinkHref="#dorlingArcSegment" 
                  startOffset={ dl.offset }
                >
                  { dl.value}
                </textPath>
              </text>
            </g>
          );
        }) }

        <text 
          stroke='transparent'
          fontSize={ DimensionsStore.getTimelineLabelSize() }
          textAnchor='middle'
          alignmentBaseline='hanging'
        >
          <textPath 
            xlinkHref="#dorlingArcLabelSegment" 
            startOffset='75%'
          >
            number of visits
          </textPath>
        </text>
      </svg>
    );
  }

}