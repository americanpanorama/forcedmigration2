// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactTransitionGroup from 'react-addons-transition-group';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';

import TheMap from './components/MapComponent.jsx';
import Timeline from './components/TimelineComponent.jsx';
import Steamgraph from './components/SteamgraphComponent.jsx';

import DataStore from './stores/DataStore';
import HashManager from './stores/HashManager';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);
    this.state = this.getDefaultState();

    // bind handlers
    const handlers = ['onWindowResize', 'onOfficeholderSelected', 'storeChanged', 'onMapPointHover'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  componentWillMount () { 
    let office = (Object.keys(HashManager.getState())[0]) ? Object.keys(HashManager.getState())[0] : 'president',
      id = (Object.keys(HashManager.getState())[0]) ? HashManager.getState()[Object.keys(HashManager.getState())[0]] : 44;
    AppActions.parseData(id, office); 
  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    DataStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
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
      mapProportion = 2/3;
    return {
      widthHeight: widthHeight,
      diameter: widthHeight * mapProportion,
      radius: widthHeight * mapProportion /2,
      ringWidth: widthHeight * (1 - mapProportion) / 2,
      graphRegionOffset: (widthHeight * (1 - mapProportion) / 2 - 60) / 9,
      detailsTop: window.innerHeight / 2 + widthHeight * mapProportion /2 *  0.1,
      detailsLeft: window.innerWidth / 2 - widthHeight * mapProportion /2 *  0.6,
      detailsWidth: widthHeight * mapProportion / 2 * 0.5,
      detailsHeight: widthHeight * mapProportion / 2 * 0.9
    };
  }

  storeChanged() {
    this.setState({});
  }

  onOfficeholderSelected(e) {
    let [office, id] = e.target.id.split('-');
    AppActions.officeholderSelected(id, office);
  }

  onMapPointHover(e) { console.log(e.target.id.split('-'), e.target.id); AppActions.visitsSelected(e.target.id.split('-')); }

  onWindowResize() {
    this.setState({
      dimensions: this.calculateDimensions()
    });
  }

  changeHash () {
    let hash = {},
      office = DataStore.getSelectedOffice();
    hash['president'] = (office == 'president') ? DataStore.getSelectedId() : null;
    hash['sos'] = (office == 'sos') ? DataStore.getSelectedId() : null;
    HashManager.updateHash(hash);
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

  _makeArc(padding, radius) {
    return 'M ' + padding + ',' + radius + ' A ' + (radius-padding) + ',' + (radius-padding) + ' 0 0, 1 ' + (radius*2 - padding) + ',' + radius; 
  }

  render () {
    return (
      <div>
        <svg
          width={ this.state.dimensions.widthHeight }
          height={ this.state.dimensions.widthHeight }
        > 

          
          <g transform={'translate(' + this.state.dimensions.ringWidth + ',' + this.state.dimensions.ringWidth + ')' }>

            <TheMap
              dimensions={ this.state.dimensions }
              onHover={ this.onMapPointHover }
            />

          />

          </g>
   


        </svg>

        { (DataStore.getSelectedLocationIds().length > 0) ? 

          <div 
            className='details'
            style= {{
              top: this.state.dimensions.detailsTop,
              left: this.state.dimensions.detailsLeft,
              width: this.state.dimensions.detailsWidth,
              height: this.state.dimensions.detailsHeight
            }}
          >
            <h3>
              { DataStore.getDestinationDetails(DataStore.getSelectedLocationIds())[0].properties.city + ', ' + DataStore.getDestinationDetails(DataStore.getSelectedLocationIds())[0].properties.country}
            </h3>
            <ul>
            { DataStore.getDestinationDetails(DataStore.getSelectedLocationIds()).map((destination, i) => {
              return (
                <li key={ 'detail' + i }>
                  { destination.properties.date_convert + ((destination.properties.position == 'SOS') ? ' | Secretary of State ' : ' | President ') +  destination.properties.pres_sos }
                  <br />
                  { destination.properties.remarks }
                </li>
              );
            })}
            </ul>
          </div> :
          ''


        }

        <svg
          width={ this.state.dimensions.widthHeight }
          height={ this.state.dimensions.widthHeight }
        > 
          <defs>
            <path 
              id='yearSegment'
              d={ this._makeArc(-70, this.state.dimensions.radius) }
            />
            <path 
              id='arcSegment'
              d={ this._makeArc(-40, this.state.dimensions.radius) }
            />
            <path 
              id='sosSegment'
              d={ this._makeArc(-10, this.state.dimensions.radius) }
            />
            <path 
              id='titleArcSegment'
              d={ this._makeArc(10, this.state.dimensions.widthHeight / 2) }
            />
          </defs>

          <g transform={'translate(' + this.state.dimensions.ringWidth + ',' + this.state.dimensions.ringWidth + ')' }>

            <Timeline 
              onOfficeholderSelected = { this.onOfficeholderSelected }
              dimensions = { this.state.dimensions }
            />

            <Steamgraph
              dimensions={ this.state.dimensions }
              onHover={ this.onMapPointHover }
            />

          />

          </g>

        {/* title, etc. */}

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
          
        </svg>
      </div>
    );
  }

}

export default App;