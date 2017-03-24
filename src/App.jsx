// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactTransitionGroup from 'react-addons-transition-group';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';

import Term from './components/TermComponent.jsx';
import SelectedTerm from './components/SelectedTermComponent.jsx';
import AreaGraph from './components/AreaGraphComponent.jsx';

import DataStore from './stores/DataStore';
import HashManager from './stores/HashManager';

import WorldJson from '../data/oceans.json';
import DestinationsJson from '../data/destinations.json';
import PresidentialTerms from '../data/terms.json';
import * as topojson from 'topojson';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);
    this.state = this.getDefaultState();

    // bind handlers
    const handlers = ['onPresidencySelected', 'onWindowResize'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  componentWillMount () { }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount () {}

  componentDidUpdate () { this.changeHash(); }

  getDefaultState () {
    return {
      presidency: (HashManager.getState().presidency) ? HashManager.getState().presidency : 44,
      dimensions: this.calculateDimensions()
    };
  }

  calculateDimensions() {
    let widthHeight = Math.min(window.innerHeight, window.innerWidth),
      mapProportion = 3/4;
    return {
      widthHeight: widthHeight,
      diameter: widthHeight * mapProportion,
      radius: widthHeight * mapProportion /2,
      ringWidth: widthHeight * (1 - mapProportion) / 2,
      graphRegionOffset: (widthHeight * (1 - mapProportion) / 2 - 60) / 9
    };
  }

  onPresidencySelected(e) {
    this.setState({
      presidency: e.target.id
    });
  }

  onWindowResize() {
    this.setState({
      dimensions: this.calculateDimensions()
    });
  }

  changeHash () {
    HashManager.updateHash({ 
      presidency: this.state.presidency
    });
  }

  _dateDiff(date1, date2) {
    let d1 = date1.split('-').map(num => parseInt(num)),
      d2 = date2.split('-').map(num => parseInt(num)),
      dO1 = new Date(d1[0], d1[1]-1, d1[2], 0, 0, 0, 0),
      dO2 = new Date(d2[0], d2[1]-1, d2[2]),
      timeDiff = Math.abs(dO2.getTime() - dO1.getTime()),
      diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return diffDays;
  }

  render () {
    var firstYear = 1905,
      years = [...Array(112).keys()].map(num => num+firstYear),
      tau = 2 * Math.PI,
      DC = [-77.0365, 38.8977],
      translateMap = 'translate(' + this.state.dimensions.radius + ',' + this.state.dimensions.radius +')';
      
    var makeArc = (padding, radius) => 'M ' + padding + ',' + radius + ' A ' + (radius-padding) + ',' + (radius-padding) + ' 0 0, 1 ' + (radius*2 - padding) + ',' + radius; 

    console.log(makeArc(-10, this.state.dimensions.radius + 10));
      
    var projection = d3.geo.azimuthalEquidistant()
      .scale(this.state.dimensions.radius/10 * Math.PI)
      .rotate(DC.map(latlng => latlng * -1))
      .clipAngle(180 - 1e-3)
      .translate([this.state.dimensions.radius,this.state.dimensions.radius])
      .precision(.1);

    var path = d3.geo.path()
      .projection(projection);

    var SOStermsArc = d3.svg.arc()
      .innerRadius(this.state.dimensions.radius)
      .outerRadius(this.state.dimensions.radius + 30);

    var termsArc = d3.svg.arc()
      .innerRadius(this.state.dimensions.radius + 30)
      .outerRadius(this.state.dimensions.radius + 60);

    var exteriorArc = d3.svg.arc()
      .innerRadius(this.state.dimensions.radius - 30)
      .outerRadius(this.state.dimensions.radius);

    var graphArc = d3.svg.arc()
      .innerRadius(this.state.dimensions.radius+50)
      .outerRadius(this.state.dimensions.widthHeight/2);

    var stack = d3.layout.stack()
      .values(d => d.values )
      .y(d => d.visits);

    var radiusStack = d3.scale.linear()
      .domain([0, DataStore.getMaxVisits()])
      .range([this.state.dimensions.radius+50, this.state.dimensions.widthHeight/2 - 5]);

    var area = d3.svg.area.radial()
      .interpolate('cardinal-open')
      .tension([0.7])
      .angle(d => DataStore.getDateAngle(d.year + '-07-01', this.state.presidency))
      .innerRadius(d => radiusStack(d.y0))
      .outerRadius(d => radiusStack(d.y0+d.y));

    let stackedData = stack(DataStore.getDestinationsByYear());

    console.log(DataStore.getRegionsVisited(this.state.presidency));

    return (
      <svg
        width={ this.state.dimensions.widthHeight }
        height={ this.state.dimensions.widthHeight }
      > 
        <filter id="A">
          <feGaussianBlur stdDeviation="2" />
        </filter>

        <defs>
          <path 
            id='arcSegment'
            d={ makeArc(0, this.state.dimensions.radius) }
          />
          <path 
            id='outerArcSegment'
            d={ makeArc(-40, this.state.dimensions.radius + 40) }
          />
          <path 
            id='titleArcSegment'
            d={ makeArc(10, this.state.dimensions.widthHeight / 2) }
          />
        </defs>

        <text 
          fill='white'
          stroke='transparent'
          fontSize="40"
          textAnchor='end'
        >
          <textPath xlinkHref="#titleArcSegment" startOffset='77%'>
            The Executive Abroad
          </textPath>
        </text>

        <text 
          fill='white'
          stroke='transparent'
          fontSize="30"
          textAnchor='start'
        >
          <textPath xlinkHref="#titleArcSegment" startOffset='78%'>
            1905-2016
          </textPath>
        </text>

        <g transform={'translate(' + this.state.dimensions.ringWidth + ',' + this.state.dimensions.ringWidth + ')' }>

          <path d={makeArc(-10, this.state.dimensions.radius + 10) } fill='transparent' />

          {/* destination points 
          { DataStore.getDestinationsForPresidency(this.state.presidency).map((destination, i) => {
            if (destination && destination.geometry && destination.geometry.coordinates) {
              return (
                <g key={ 'destination' + i }>
                  <circle
                    fill={ (destination.properties.position == 'SOS') ? 'white' : 'yellow' }
                    fillOpacity={0.3}
                    cx={ projection(destination.geometry.coordinates)[0] }
                    cy={ projection(destination.geometry.coordinates)[1] }
                    r={ 5 }
                    className={destination.properties.new_region.replace(/ /g,'').toLowerCase()}
                  />
                  <circle
                    fill={ (destination.properties.position == 'SOS') ? 'white' : 'yellow' }
                    fillOpacity={1}
                    cx={ projection(destination.geometry.coordinates)[0] }
                    cy={ projection(destination.geometry.coordinates)[1] }
                    r={ 3 }
                    className={destination.properties.new_region.replace(/ /g,'').toLowerCase()}
                  />
                </g>
              );
            }
          })} */}

          { DataStore.getDestinationsForPresidencyAggregated(this.state.presidency).map((destination, i) => {
            return (
              <circle
                cx={ projection([destination.lng, destination.lat])[0] }
                cy={ projection([destination.lng, destination.lat])[1] }
                r={ 3* Math.sqrt(destination.visits.length) }
                fillOpacity={0.5}
                className={ destination.regionClass } 
              />
            );

          })}

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

          {/* DataStore.getRegionsPolygons().map((polygon,i) => {
            return (
              <path
                key={ 'region' + i }
                d={ path(polygon.geometry) }
                strokeWidth={ 0.5 }
                fill='transparent'
                className={ polygon.properties.new_region.replace(/ /g,'').toUpperCase() }
              />
            );
          }) */}

          <path 
            d={ termsArc.startAngle(0).endAngle(tau)() }
            transform={ translateMap }
            className='edgeObscure'
          />

          { years.map(year => {
            return (
              <g key={'yearTick' + year} transform={ 'rotate(' + (DataStore.getDateAngleDegrees(year + '-01-01', this.state.presidency) + 90) + ',' + this.state.dimensions.radius + ',' + this.state.dimensions.radius + ')' }>
                
                <text 
                  fill='black'
                  stroke='transparent'
                  fontSize="11"
                >
                  <textPath xlinkHref="#outerArcSegment">
                    { ( year % 4 == 0) ? year : '' }
                  </textPath>
                </text>

              </g>

            );
          }) }


          
        {/* <path
            d={ outerArc }
            fill='violet'
            fillOpacity={ 0.7 }

          />   */}

          {/* DataStore.getDestinations().map((destination, i) => {
            if (destination && destination.geometry && destination.geometry.coordinates) {
              if (!isNaN(DataStore.getDateRotation(destination.properties.date_convert))) {
                return (
                  <g key={ 'destinationTimeline' + i }>
                    <line
                      stroke={ (destination.properties.position == 'SOS') ? '#99FF99' : '#9999FF' }
                      fillOpacity={ 0.25 }
                      x1={ radius  }
                      y1={ (destination.properties.position == 'SOS') ? 30 : 20 }
                      x2={ radius }
                      y2={ (destination.properties.position == 'SOS') ? 20 : 10 }
                      width={ 0.1 }
                      transform={ 'rotate(' + DataStore.getDateRotation(destination.properties.date_convert) +  ',' + radius + ',' + this.state.dimensions.radius + ')' }
                    />
                  </g>
                );
              }
    
            }
          })*/}

          <ReactTransitionGroup
            component='g' 
            transform={'translate(' + this.state.dimensions.radius + ',' + this.state.dimensions.radius + ')'}
          >
            { stackedData.map((region,i) => {
              return (
                <AreaGraph
                  data={ region.values }
                  area={ area }
                  selectedId={ this.state.presidency }
                  region={region.key}
                  key={'area' + region.key}
                  angles={ region.values.map(yearData => DataStore.getDateAngle(yearData.year + '-01-01', this.state.presidency))}
                />
              );
            }) }   
          </ReactTransitionGroup>

          { DataStore.getPresidentialTerms().map((presidency, i) => {
            let startDate = (presidency.took_office > '1905-04-03') ? presidency.took_office : '1905-04-03',
              endDate = (presidency.left_office < '2016-12-12') ? presidency.left_office : '2016-12-12',
              startAngle = DataStore.getDateAngle(startDate, this.state.presidency) + 0.001,
              endAngle = DataStore.getDateAngle(endDate, this.state.presidency) - 0.001;

            return (
              <ReactTransitionGroup
                key={ 'term' + i }
                component='g' 
              >
                <Term
                  theArc={ termsArc }
                  startAngle={ startAngle }
                  endAngle={ endAngle }
                  color={ (presidency.number == this.state.presidency) ? '#ffe' : '#333355' }
                  selected={ (presidency.number == this.state.presidency) ? true : false }
                  id={ presidency.number }
                  onPresidencySelected={ this.onPresidencySelected }
                  president={ presidency.president }
                  rotate={ (startAngle / Math.PI + DataStore.getPresidencyPercentWithSelected(presidency.number, this.state.presidency)) * 180 }
                  radius={ this.state.dimensions.radius }
                  
                />
              </ReactTransitionGroup>
            );

          }) }

          { DataStore.getSOSTerms().map((SOS, i) => {
            console.log(SOS);
            let startDate = (SOS.took_office > '1905-04-03') ? SOS.took_office : '1905-04-03',
              endDate = (SOS.left_office < '2016-12-12') ? SOS.left_office : '2016-12-12',
              startAngle = DataStore.getDateAngle(startDate, this.state.presidency) + 0.001,
              endAngle = DataStore.getDateAngle(endDate, this.state.presidency) - 0.001;

            return (
              <ReactTransitionGroup
                key={ 'term' + i }
                component='g' 
              >
                <Term
                  theArc={ SOStermsArc }
                  startAngle={ startAngle }
                  endAngle={ endAngle }
                  color={ '#333355' }
                  selected={ false }
                  id={ SOS.number }
                  onPresidencySelected={ this.onPresidencySelected }
                  president={ SOS.name }
                  rotate={ 0 }
                  radius={ this.state.dimensions.radius }
                  
                />
              </ReactTransitionGroup>
            );

          }) }

          <ReactTransitionGroup
            key='selectedTerm'
            component='g'
          >
            <SelectedTerm
              graphArc={ graphArc }
              startAngle={ DataStore.getPresidentialStartAngle(this.state.presidency, this.state.presidency) }
              endAngle={ DataStore.getPresidentialEndAngle(this.state.presidency, this.state.presidency) }
              radius={ this.state.dimensions.radius  }
              key={'selectedTerm' + this.state.presidency}
            />
          </ReactTransitionGroup>

          <circle
            cx={ this.state.dimensions.radius }
            cy={ this.state.dimensions.radius }
            r={ 2 }
            fill='white'
          />

          <text
            x={ this.state.dimensions.radius + 8 }
            y={ this.state.dimensions.radius }
            fill='#eee'
            fillOpacity={0.5}
            fontSize={12}
            alignmentBaseline='hanging'

          >
            Washington DC
          </text>

          { DataStore.getRegionsVisited(this.state.presidency).map(slug => {
            return (
              <text
                x={ projection(DataStore.getRegionMetadata(slug).latlng)[0] }
                y={ projection(DataStore.getRegionMetadata(slug).latlng)[1] }
                fontSize={12}
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

        {/* destination points */}
        { DataStore.getDestinationsForPresidency(this.state.presidency).map((destination, i) => {
          if (destination && destination.geometry && destination.geometry.coordinates) {
            let region = destination.properties.new_region.replace(/ /g,'').toLowerCase(),
              offset = (region == 'westerneurope') ? 60 :
                (region == 'easterneuropeandcentralasia') ? 60 + this.state.dimensions.graphRegionOffset * 1 :
                (region == 'eastasia') ? 60 + this.state.dimensions.graphRegionOffset * 2 :
                (region == 'middleeast') ? 60 + this.state.dimensions.graphRegionOffset * 3 :
                (region == 'latinamerica') ? 60 + this.state.dimensions.graphRegionOffset * 4 :
                (region == 'africa') ? 60 + this.state.dimensions.graphRegionOffset * 5 :
                (region == 'southasia') ? 60 + this.state.dimensions.graphRegionOffset * 6 :
                (region == 'oceania') ? 60 + this.state.dimensions.graphRegionOffset * 7 : 60 + this.state.dimensions.graphRegionOffset * 8,
                
              angle = DataStore. getDateAngle(destination.properties.date_convert.substring(0,10), this.state.presidency),
              cx = this.state.dimensions.widthHeight/2 + (this.state.dimensions.radius + offset) * Math.sin(angle),
              cy = this.state.dimensions.widthHeight/2 - (this.state.dimensions.radius + offset) * Math.cos(angle);
              
            return (
              <circle
                cx={ cx }
                cy={ cy }
                r={ 4 }
                key={ 'destinationRing' + i }
                className={ destination.properties.new_region.replace(/ /g,'').toLowerCase()}
              />
            );
          }
        })}
        
     
      </svg>
    );
  }

}

export default App;