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
import DimensionsStore from './stores/DimensionsStore';
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
    let office = (Object.keys(HashManager.getState()).indexOf('sos') !== -1) ? 'sos' : 'president',
      id = (HashManager.getState()[office]) ? (HashManager.getState()[office]) : 44,
      visits = (HashManager.getState().visits) ? HashManager.getState().visits.split('-') : [];
    AppActions.parseData(id, office, visits); 
  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    DataStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
  }

  componentWillUnmount () {}

  componentDidUpdate () { this.changeHash(); }

  getDefaultState () {
    return {
      dimensions: this.calculateDimensions()
    };
  }

  calculateDimensions() {
    let widthHeight = Math.min(window.innerHeight, window.innerWidth),
      mapProportion = 2/3,
      ringProportion = 1/3,
      termsProportion = 1/18,
      graphProportion = 3/18,
      yearProportion = 2/18;
    return {
      widthHeight: widthHeight,
      diameter: widthHeight * mapProportion,
      radius: widthHeight * mapProportion /2,
      ringWidth: widthHeight * (1 - mapProportion) / 2,
      graphRegionOffset: (widthHeight * (1 - mapProportion) / 2 - 60) / 9,
      detailsTop: window.innerHeight / 2 + widthHeight * mapProportion /2 *  0.1,
      detailsLeft: window.innerWidth / 2 - widthHeight * mapProportion /2 *  0.6,
      detailsWidth: widthHeight * mapProportion / 2 * 0.5,
      detailsHeight: widthHeight * mapProportion / 2 * 0.9,
      termRingsWidth: widthHeight * ringProportion / 12,
      graphWidth: widthHeight * ringProportion / 6,
      yearRingWidth: widthHeight * ringProportion / 6,
      sosInnerRadius: widthHeight * mapProportion / 2,
      sosOuterRadius: widthHeight * (mapProportion + termsProportion) / 2,
      presInnerRadius: widthHeight * (mapProportion + termsProportion) / 2,
      presOuterRadius: widthHeight * (mapProportion + termsProportion + termsProportion) / 2,
      graphInnerRadius: widthHeight * (mapProportion + termsProportion + termsProportion) / 2,
      graphOuterRadius: widthHeight * (mapProportion + termsProportion + termsProportion + graphProportion) / 2,
      yearTickInnerRadius: widthHeight * (mapProportion + termsProportion + termsProportion) / 2,
      yearTickOuterRadius: widthHeight * (mapProportion + termsProportion + termsProportion + graphProportion) / 2,
      yearLabelInnerRadius: widthHeight * (mapProportion + termsProportion + termsProportion + graphProportion) / 2
    };
  }

  storeChanged() {
    this.setState({});
  }

  onOfficeholderSelected(e) {
    let [office, id] = e.target.id.split('-');
    AppActions.officeholderSelected(id, office);
  }

  onMapPointHover(e) { 
    let ids = (DataStore.getSelectedLocationIds().length==e.target.id.split('-').length && DataStore.getSelectedLocationIds().every((v,i)=> v === e.target.id.split('-')[i])) ? [] : e.target.id.split('-');
    AppActions.visitsSelected(ids); 
  }

  clearDetails() {
    AppActions.visitsSelected([]); 
  }

  onWindowResize() {
    this.setState({
      dimensions: this.calculateDimensions()
    });
    AppActions.windowResized();
  }

  changeHash () {
    let hash = {},
      office = DataStore.getSelectedOffice();
    hash['president'] = (office == 'president') ? DataStore.getSelectedId() : null;
    hash['sos'] = (office == 'sos') ? DataStore.getSelectedId() : null;
    hash['visits'] = DataStore.getSelectedLocationIds().join('-');
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

        <TheMap onHover={ this.onMapPointHover } />

        { (DataStore.getSelectedLocationIds().length > 0) ? 

          <div 
            className='details'
            key={ 'visits' + DataStore.getSelectedLocationIds().join('-') }
          >
            <div
              className='controls'
              style= {{
                top: this.state.dimensions.detailsTop,
                left: this.state.dimensions.detailsLeft,
                width: this.state.dimensions.detailsWidth,
                height: 20
              }}

              
            >
              { (DataStore.getPreviousDestinationIdSelected()) ?
                <span 
                  onClick={ this.onMapPointHover }
                  id={ DataStore.getPreviousDestinationIdSelected() }
                > 
                  { '<' }
                </span> :
                ''
              }

              { (DataStore.getNextDestinationIdSelected()) ?
                <span 
                  onClick={ this.onMapPointHover }
                  id={ DataStore.getNextDestinationIdSelected() }
                > 
                  { '>' }
                </span> :
                ''
              }
              
              <span onClick={ this.clearDetails }>
                x
              </span>
            </div>
            <div
              className='destinations'
              style= {{
                top: this.state.dimensions.detailsTop + 20,
                left: this.state.dimensions.detailsLeft,
                width: this.state.dimensions.detailsWidth,
                height: this.state.dimensions.detailsHeight
              }}
            >
              <h3>
                { DataStore.getDestinationDetails(DataStore.getSelectedLocationIds())[0].properties.city + ', ' + DataStore.getDestinationDetails(DataStore.getSelectedLocationIds())[0].properties.country}
              </h3>
              <h4>
                { ((DataStore.getDestinationDetails(DataStore.getSelectedLocationIds())[0].properties.position == 'SOS') ? 'Secretary of State ' : 'President ')  + DataStore.getDestinationDetails(DataStore.getSelectedLocationIds())[0].properties.pres_sos}
              </h4>
              <ul>
              { DataStore.getDestinationDetails(DataStore.getSelectedLocationIds()).map((destination, i) => {
                let d = new Date(destination.properties.date_convert.substring(0,10)),
                  date = d.toLocaleString('en-us', { month: "long" }) + ' ' + d.getDate() + ', ' + d.getFullYear();
                return (
                  <li key={ 'detail' + i }>
                    { date }
                    <br />
                    { destination.properties.remarks }
                  </li>
                );
              })}
              </ul>
            </div>
          </div> :
          ''


        }

        <svg
          width={ DimensionsStore.getWidthHeight() }
          height={ DimensionsStore.getWidthHeight() }
        > 
          <defs>
            <path 
              id='yearSegment'
              d={ this._makeArc(-70, DimensionsStore.getRadius()) }
            />
            <path 
              id='monthSegment'
              d={ this._makeArc(-100, DimensionsStore.getRadius()) }
            />
            <path 
              id='arcSegment'
              d={ this._makeArc(-40, DimensionsStore.getRadius()) }
            />
            <path 
              id='sosSegment'
              d={ this._makeArc(-10, DimensionsStore.getRadius()) }
            />
            <path 
              id='titleArcSegment'
              d={ this._makeArc(70, DimensionsStore.getWidthHeight() / 2) }
            />
            <path 
              id='subtitleArcSegment'
              d={ this._makeArc(100, DimensionsStore.getWidthHeight() / 2) }
            />
          </defs>

          <g transform={'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ')' }>

            <Timeline 
              onOfficeholderSelected = { this.onOfficeholderSelected }
            />

            <Steamgraph
              onHover={ this.onMapPointHover }
            />

          />

          </g>

        {/* title, etc. */}

          <text 
            fill='white'
            stroke='transparent'
            fontSize="30"
            textAnchor='middle'
          >
            <textPath xlinkHref="#titleArcSegment" startOffset='50%'>
              The Executive Abroad
            </textPath>
          </text>

          <text 
            fill='white'
            stroke='transparent'
            fontSize="22"
            textAnchor='middle'
          >
            <textPath xlinkHref="#subtitleArcSegment" startOffset='50%'>
              1905-2016
            </textPath>
          </text>
          
        </svg>
      </div>
    );
  }

}

export default App;