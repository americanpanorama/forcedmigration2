// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

import ReactTransitionGroup from 'react-addons-transition-group';

import DataStore from '../stores/DataStore.js';

import AreaGraph from './AreaGraphComponent.jsx';
import SelectedTerm from './SelectedTermComponent.jsx';
import YearTick from './YearTickComponent.jsx';
import DestinationsTimeline from './DestinationsTimelineComponent.jsx';

import { AppActions, AppActionTypes } from '../utils/AppActionCreator';
import AppDispatcher from '../utils/AppDispatcher';

export default class SteamGraph extends React.Component {

  constructor (props) { super(props); }

  render() {
    let offsetBase = 60;
    var stack = d3.layout.stack()
      .values(d => d.values )
      .y(d => d.visits);

    var radiusStack = d3.scale.linear()
      .domain([0, DataStore.getMaxVisits()])
      .range([this.props.dimensions.radius+offsetBase, this.props.dimensions.widthHeight/2 - 40]);

    var area = d3.svg.area.radial()
      .interpolate('cardinal-open')
      .tension([0.7])
      .angle(d => DataStore.getDateAngle(d.year + '-01-01'))
      .innerRadius(d => radiusStack(d.y0))
      .outerRadius(d => radiusStack(d.y0+d.y));

    let stackedData = stack(DataStore.getDestinationsByYear());

    var graphArc = d3.svg.arc()
      .innerRadius(this.props.dimensions.radius+offsetBase)
      .outerRadius(this.props.dimensions.widthHeight/2);

    var weArc = d3.svg.arc()
      .innerRadius(this.props.dimensions.radius+90)
      .outerRadius(this.props.dimensions.radius+100);

    var eeArc = d3.svg.arc()
      .innerRadius(this.props.dimensions.radius+100)
      .outerRadius(this.props.dimensions.radius+116);

    var eaArc = d3.svg.arc()
      .innerRadius(this.props.dimensions.radius+116)
      .outerRadius(this.props.dimensions.radius+132);

    var distance = d3.scale.linear()
      .domain([0, DataStore.getMaxDistance()])
      .range([this.props.dimensions.radius+offsetBase, this.props.dimensions.widthHeight/2 - 35]);

    console.log(DataStore.getMaxDistance() / 1609.344);
    return (
      <g
        transform={'rotate(0 ' + this.props.dimensions.radius + ',' + this.props.dimensions.radius + ')'}
      >
          {/* tick marks for distance */}
          { [10, 7.5, 5, 2.5].map(milesAway => {
            return (
              <circle
                cx={this.props.dimensions.radius}
                cy={this.props.dimensions.radius}
                r={ distance(milesAway * 1000 * 1609.344)}
                className='distanceTicks'
              />
            );
          })}
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
                  angles={ region.values.map(yearData => DataStore.getDateAngle(yearData.year + '-01-01'))}
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
              fill={ '#111133' }
            />
            {/* JSX Comment <SelectedTerm
              graphArc={ weArc }
              startAngle={ DataStore.getOfficeholderStartAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) }
              endAngle={ DataStore.getOfficeholderEndAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) }
              radius={ this.props.dimensions.radius  }
              key={ 'mask' + DataStore.getSelectedOffice() + DataStore.getSelectedId() + '_we'}
              fill={ 'orange'}
            />
            <SelectedTerm
              graphArc={ eeArc }
              startAngle={ DataStore.getOfficeholderStartAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) }
              endAngle={ DataStore.getOfficeholderEndAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) }
              radius={ this.props.dimensions.radius  }
              key={ 'mask' + DataStore.getSelectedOffice() + DataStore.getSelectedId() + '_ee'}
              fill={ '#722f37' }
            />
            <SelectedTerm
              graphArc={ eaArc }
              startAngle={ DataStore.getOfficeholderStartAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) }
              endAngle={ DataStore.getOfficeholderEndAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) }
              radius={ this.props.dimensions.radius  }
              key={ 'mask' + DataStore.getSelectedOffice() + DataStore.getSelectedId() + '_ea'}
              fill={ '#2ca02c' }
            />*/}
          </ReactTransitionGroup>

        { DataStore.getMonthsSelectedWithAngles().map((monthData) => {
          return (
            <ReactTransitionGroup
              key={ 'month' + monthData.year + monthData.month }
              component='g' 
              className='months' 
            >
              <YearTick
                yearData={ monthData }
                dimensions={ this.props.dimensions }
                label={ (monthData.month == 1) ? monthData.year : ((monthData.month - 1) % 4 == 0) ? monthData.monthName.substring(0,3) : '' }
              />
            </ReactTransitionGroup>
          );
        }) }

        {/* destination points */}
        <ReactTransitionGroup
          component='g' 
          className='destinationsRing' 
        >
          { DataStore.getSimplifiedDestinationsForSelected().map((destination, i) => {
            if (destination && destination.geometry && destination.geometry.coordinates) {
              return (
                <DestinationsTimeline
                  destination={ destination }
                  angle={ DataStore.getDateAngle(destination.properties.date_convert.substring(0,10)) }
                  originAngle={ (DataStore.getOfficeholderEndAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice()) + DataStore.getOfficeholderStartAngle(DataStore.getSelectedId(), DataStore.getSelectedOffice())) / 2 }
                  dimensions={ this.props.dimensions }
                  key={ 'destinationRing' + destination.properties.cartodb_id }
                  selected={ DataStore.getSelectedLocationIds().indexOf(destination.properties.cartodb_id.toString()) !== -1 }
                  unselected={ (DataStore.getSelectedLocationIds().indexOf(destination.properties.cartodb_id.toString()) == -1) && DataStore.hasSelectedLocation() }
                  onClick={ this.props.onHover }
                />
              );
            }
          })}
        </ReactTransitionGroup>

      </g>
    );
  }

}