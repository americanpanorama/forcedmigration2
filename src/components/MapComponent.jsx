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
export default class Map extends React.Component {

  constructor (props) {
    super(props);
  }

  render() {
    let tau = 2 * Math.PI,
      DC = [-77.0365, 38.8977];

    var projection = d3.geo.azimuthalEquidistant()
      .scale(DimensionsStore.getRadius() * .318)
      .rotate(DC.map(latlng => latlng * -1))
      .clipAngle(180 - 1e-3)
      .translate([DimensionsStore.getRadius(),DimensionsStore.getRadius()])
      .precision(.1);

    var path = d3.geo.path()
      .projection(projection);

    return (
        <svg
          width={ DimensionsStore.getWidthHeight() }
          height={ DimensionsStore.getWidthHeight() }
        > 
          <g transform={'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ')' }>
            { DataStore.getOceanPolygons().map((polygon,i) => {
              return (
                <path
                  key={ 'country' + i }
                  d={ path(polygon.geometry) }
                  strokeWidth={ 0.2 }
                  fillOpacity={0.5}
                  className='ocean'
                />
              );
            })}

            { DataStore.getDestinationsForSelected().map((destination, i) => {
              let ids = destination.visits.map(visit => visit.cartodb_id),
                id = ids.join('-'),
                selected = DataStore.getVisibleLocationIds().filter(id => ids.indexOf(parseInt(id)) !== -1).length > 0;
              return (
                <circle
                  cx={ projection([destination.lng, destination.lat])[0] }
                  cy={ projection([destination.lng, destination.lat])[1] }
                  r={ (selected) ? DimensionsStore.getPointRadius(destination.visits.length) + DimensionsStore.getPointRadius() / 4 : DimensionsStore.getPointRadius(destination.visits.length) }
                  fillOpacity={ (selected) ? 1 : DataStore.hasVisibleLocation() ? 0.4 : 0.7 }
                  strokeWidth={ (selected) ? DimensionsStore.getPointRadius() / 2 : 0 }
                  className={ 'destination ' + destination.regionClass } 
                  id={ id }
                  onClick={ this.props.onClick }
                  onMouseEnter={ this.props.onHover }
                  onMouseLeave={ this.props.onMouseLeave }
                  key={ 'mapLocation' + i}
                />
              );
            })}

            {/* map labels */}

            <circle
              cx={ DimensionsStore.getRadius() }
              cy={ DimensionsStore.getRadius() }
              r={ DimensionsStore.getPointRadius() * 2/3 }
              fill='#eee'
              fillOpacity={1}
            />

            <text
              x={ DimensionsStore.getRadius() * 1.02 }
              y={ DimensionsStore.getRadius() }
              fill='#eee'
              fillOpacity={0.7}
              fontSize={ DimensionsStore.getRegionLabelSize() }
              alignmentBaseline='hanging'

            >
              Washington DC
            </text>

            { DataStore.getRegionsVisited().map(slug => {
              return (
                <text
                  x={ projection(DataStore.getRegionMetadata(slug).latlng)[0] }
                  y={ projection(DataStore.getRegionMetadata(slug).latlng)[1] }
                  fontSize={ DimensionsStore.getRegionLabelSize() }
                  textAnchor={ DataStore.getRegionMetadata(slug).textAnchor }
                  alignmentBaseline={ DataStore.getRegionMetadata(slug).alignmentBaseline }
                  className={ slug }
                  key={ 'label' + slug }
                >
                  { DataStore.getRegionMetadata(slug).name }
                </text>
              );
            })}

        </g>
      </svg>
    );
  }

}