// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactTransitionGroup from 'react-addons-transition-group';

// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';

import Term from './components/TermComponent.jsx';
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
    const handlers = ['onPresidencySelected'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  // ============================================================ //
  // React Lifecycle
  // ============================================================ //

  componentWillMount () {
    //AppActions.loadInitialData(this.state, HashManager.getState());
  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);


    // this.setState({
    //   x: DimensionsStore.getMainPaneWidth() / 2,
    //   y: DimensionsStore.getNationalMapHeight() / 2
    // });
  }

  componentWillUnmount () {
  }

  componentDidUpdate () { this.changeHash(); }

  getDefaultState () {
    return {
      presidency: (HashManager.getState().presidency) ? HashManager.getState().presidency : 44,
      dimensions: this.calculateDimensions()
    };
  }



  // ============================================================ //
  // Handlers
  // ============================================================ //

  hashChanged (event, suppressRender) {
  }

  storeChanged () {
    this.setState({

    });
  }

  calculateDimensions() {
    let widthHeight = Math.min(window.innerHeight, window.innerWidth),
      mapProportion = 5/6;
    return {
      widthHeight: widthHeight,
      diameter: widthHeight * mapProportion,
      radius: widthHeight * mapProportion /2,
      ringWidth: widthHeight * (1 - mapProportion) / 2
    };
  }

  onPresidencySelected(e) {
    this.setState({
      presidency: e.target.id
    });
  }

  calculateScale() { return Math.min(window.innerHeight, window.innerWidth); }

  /* manage hash */

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
      daysDuration = this._dateDiff('1905-01-01', '2016-12-31'),
      tau = 2 * Math.PI,
      DC = [-77.0365, 38.8977],
      arcSegmentRadians = tau / (years.length),
      translateMap = 'translate(' + this.state.dimensions.radius + ',' + this.state.dimensions.radius +')',
      innerArc = 'M 50,500 A 450,450 0 0, 1 950,500',
      outerArc = 'M 20,500 A 480,480 0 0, 1 980,500',
      titleArc = 'M 40,600 A 560,560 0 0, 1 1160,600';

    console.log(this.state);
      
    var makeArc = (padding, radius) => 'M ' + padding + ',' + radius + ' A ' + (radius-padding) + ',' + (radius-padding) + ' 0 0, 1 ' + (radius*2 - padding) + ',' + radius; 

    console.log(makeArc(0, this.state.dimensions.radius));
      
    var projection = d3.geo.azimuthalEquidistant()
      .scale(160)
      .rotate(DC.map(latlng => latlng * -1))
      .clipAngle(180 - 1e-3)
      .translate([this.state.dimensions.radius,this.state.dimensions.radius])
      .precision(.1);

    var path = d3.geo.path()
      .projection(projection);

    var termsArc = d3.svg.arc()
      .innerRadius(this.state.dimensions.radius)
      .outerRadius(this.state.dimensions.radius + 30);

    var exteriorArc = d3.svg.arc()
      .innerRadius(this.state.dimensions.radius - 30)
      .outerRadius(this.state.dimensions.radius);

    var angle = (point) => Math.atan2(projection(point)[1]-projection(DC)[1], projection(point)[0]-projection(DC)[0]);

    var stack = d3.layout.stack()
      .offset('zero')
      .values(d => d.values )
      //.x(d => d.year)
      .y(d => d.visits);

    var radiusStack = d3.scale.linear()
      .domain([0, 50])
      .range([this.state.dimensions.radius, this.state.dimensions.radius + 50]);

    var area = d3.svg.area.radial()
      .interpolate('cardinal-open')
      .tension([0.7])
      .angle(d => DataStore.getDateAngle(d.year + '-07-01', this.state.presidency))
      .innerRadius(d => radiusStack(d.y0))
      .outerRadius(d => radiusStack(d.y0+d.y));

    let stackedData = stack(DataStore.getDestinationsByYear());

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
            d={ makeArc(-10, this.state.dimensions.radius + 10) }
          />
          <path 
            id='outerArcSegment'
            d={ makeArc(-40, this.state.dimensions.radius + 40) }
          />
          <path 
            id='titleArcSegment'
            d={ makeArc(40, this.state.dimensions.widthHeight / 2) }
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

          <path d={ makeArc(-3, this.state.dimensions.radius + 3) } fill='transparent' />

          {/* destination points */}
          { DataStore.getDestinationsForPresidency(this.state.presidency).map((destination, i) => {
            if (destination && destination.geometry && destination.geometry.coordinates) {
              return (
                <g key={ 'destination' + i }>
                  <circle
                    fill={ (destination.properties.position == 'SOS') ? 'white' : 'yellow' }
                    fillOpacity={0.15}
                    cx={ projection(destination.geometry.coordinates)[0] }
                    cy={ projection(destination.geometry.coordinates)[1] }
                    r={ 7 }
                    filter="url(#A)"
                  />
                  <circle
                    fill={ (destination.properties.position == 'SOS') ? 'white' : 'yellow' }
                    fillOpacity={0.3}
                    cx={ projection(destination.geometry.coordinates)[0] }
                    cy={ projection(destination.geometry.coordinates)[1] }
                    r={ 5 }
                  />
                  <circle
                    fill={ (destination.properties.position == 'SOS') ? 'white' : 'yellow' }
                    fillOpacity={1}
                    cx={ projection(destination.geometry.coordinates)[0] }
                    cy={ projection(destination.geometry.coordinates)[1] }
                    r={ 3 }
                  />
                </g>
              );
            }
          })}

          { DataStore.getOceanPolygons().map((polygon,i) => {
            return (
              <path
                key={ 'country' + i }
                d={ path(polygon.geometry) }
                strokeWidth={ 0.2 }
                fillOpacity={0.9}
                className='ocean'
              />
            );
          })}

          { DataStore.getRegionsPolygons().map((polygon,i) => {
            return (
              <path
                key={ 'region' + i }
                d={ path(polygon.geometry) }
                strokeWidth={ 0.5 }
                fill='transparent'
                stroke='purple'
                className={ polygon.properties.new_region.replace(/ /g,'').toUpperCase() }
              />
            );
          })}

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

          { DataStore.getPresidentialTerms().map((presidency, i) => {
            let startAngle = DataStore.getDateAngle(presidency.took_office, this.state.presidency) + 0.001,
              endAngle = DataStore.getDateAngle(presidency.left_office, this.state.presidency) - 0.001;

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
                  d={area(region.values)}
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


        </g>
        
     
      </svg>
    );
  }

}

export default App;