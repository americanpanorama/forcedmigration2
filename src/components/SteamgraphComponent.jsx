// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

import ReactTransitionGroup from 'react-addons-transition-group';

import DataStore from '../stores/DataStore.js';

import AreaGraph from './AreaGraphComponent.jsx';
import SelectedTerm from './SelectedTermComponent.jsx';

import { AppActions, AppActionTypes } from '../utils/AppActionCreator';
import AppDispatcher from '../utils/AppDispatcher';

export default class SteamGraph extends React.Component {

  constructor (props) { super(props); }

  render() {
    let offsetBase = 94;
    var stack = d3.layout.stack()
      .values(d => d.values )
      .y(d => d.visits);

    var radiusStack = d3.scale.linear()
      .domain([0, DataStore.getMaxVisits()])
      .range([this.props.dimensions.radius+offsetBase, this.props.dimensions.widthHeight/2 - 5]);

    var area = d3.svg.area.radial()
      .interpolate('cardinal-open')
      .tension([0.7])
      .angle(d => DataStore.getDateAngle(d.year + '-12-31'))
      .innerRadius(d => radiusStack(d.y0))
      .outerRadius(d => radiusStack(d.y0+d.y));

    let stackedData = stack(DataStore.getDestinationsByYear());

    var graphArc = d3.svg.arc()
      .innerRadius(this.props.dimensions.radius+90)
      .outerRadius(this.props.dimensions.widthHeight/2);

    return (
      <g>
          <ReactTransitionGroup
            component='g' 
            transform={'translate(' + this.props.dimensions.radius + ',' + this.props.dimensions.radius + ')'}
          >
            { stackedData.map((region,i) => {
              return (
                <AreaGraph
                  data={ region.values }
                  area={ area }
                  radiusStack={ radiusStack }
                  selectedId={ DataStore.getSelectedId() }
                  region={region.key}
                  key={'area' + region.key}
                  angles={ region.values.map(yearData => DataStore.getDateAngle(yearData.year + '-12-31'))}
                  ys={ region.values.map(yearData=>yearData.y) }
                  y0s={ region.values.map(yearData=>yearData.y0) }
                  dimensions={ this.props.dimensions }
                />
              );
            }) }   
          </ReactTransitionGroup>

          <ReactTransitionGroup
            key='selectedTerm'
            component='g'
          >
            <SelectedTerm
              graphArc={ graphArc }
              startAngle={ DataStore.getOfficeholderStartAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) }
              endAngle={ DataStore.getOfficeholderEndAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) }
              radius={ this.props.dimensions.radius  }
              key={ 'mask' + DataStore.getSelectedOffice() + DataStore.getSelectedId() }
            />
          </ReactTransitionGroup>

        {/* destination points */}
        { DataStore.getSimplifiedDestinationsForSelected().map((destination, i) => {
          if (destination && destination.geometry && destination.geometry.coordinates) {
            let region = destination.properties.new_region.replace(/ /g,'').toLowerCase(),
              offset = (region == 'westerneurope') ? offsetBase :
                (region == 'easterneuropeandcentralasia') ? offsetBase + this.props.dimensions.graphRegionOffset * 1 :
                (region == 'eastasia') ? offsetBase + this.props.dimensions.graphRegionOffset * 2 :
                (region == 'middleeast') ? offsetBase + this.props.dimensions.graphRegionOffset * 3 :
                (region == 'latinamerica') ? offsetBase + this.props.dimensions.graphRegionOffset * 4 :
                (region == 'africa') ? offsetBase + this.props.dimensions.graphRegionOffset * 5 :
                (region == 'southasia') ? offsetBase + this.props.dimensions.graphRegionOffset * 6 :
                (region == 'oceania') ? offsetBase + this.props.dimensions.graphRegionOffset * 7 : offsetBase + this.props.dimensions.graphRegionOffset * 8,
                
              angle = DataStore.getDateAngle(destination.properties.date_convert.substring(0,10), this.props.presidency),
              cx = this.props.dimensions.radius + (this.props.dimensions.radius + offset) * Math.sin(angle),
              cy = this.props.dimensions.radius - (this.props.dimensions.radius + offset) * Math.cos(angle),
              selected = DataStore.getSelectedLocationIds().indexOf(destination.properties.cartodb_id.toString()) !== -1,
              unselected = !selected && DataStore.hasSelectedLocation();
            return (
              <circle
                cx={ cx }
                cy={ cy }
                r={ 4 }
                key={ 'destinationRing' + i }
                className={ 'destination ' + destination.properties.new_region.replace(/ /g,'').toLowerCase() + ((selected) ? ' selected' : '') + ((unselected) ? ' unselected' : '')}
                onClick={ this.props.onHover }
                id={ destination.properties.cartodb_id }
              />
            );
          }
        })}

      </g>
    );
  }

}