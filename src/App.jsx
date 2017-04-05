// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactTransitionGroup from 'react-addons-transition-group';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';

import TheMap from './components/MapComponent.jsx';
import Details from './components/DetailsComponent.jsx';
import Timeline from './components/TimelineComponent.jsx';
import Steamgraph from './components/SteamgraphComponent.jsx';
import Title from './components/TitleComponent.jsx';

import DataStore from './stores/DataStore';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

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
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
  }

  componentDidUpdate () { this.changeHash(); }

  storeChanged() { this.setState({}); }

  onOfficeholderSelected(e) {
    let [office, id] = e.target.id.split('-');
    AppActions.officeholderSelected(id, office);
  }

  onMapPointHover(e) { 
    let ids = (DataStore.getSelectedLocationIds().length==e.target.id.split('-').length && DataStore.getSelectedLocationIds().every((v,i)=> v === e.target.id.split('-')[i])) ? [] : e.target.id.split('-');
    AppActions.visitsSelected(ids); 
  }

  clearDetails() { AppActions.visitsSelected([]); }

  onWindowResize() { AppActions.windowResized(); }

  changeHash () {
    let hash = {},
      office = DataStore.getSelectedOffice();
    hash['president'] = (office == 'president') ? DataStore.getSelectedId() : null;
    hash['sos'] = (office == 'sos') ? DataStore.getSelectedId() : null;
    hash['visits'] = DataStore.getSelectedLocationIds().join('-');
    HashManager.updateHash(hash);
  }

  _makeArc(padding, radius) {
    return 'M ' + padding + ',' + radius + ' A ' + (radius-padding) + ',' + (radius-padding) + ' 0 0, 1 ' + (radius*2 - padding) + ',' + radius; 
  }

  render () {
    return (
      <div>

        <TheMap onHover={ this.onMapPointHover } />

        { (DataStore.getSelectedLocationIds().length > 0) ? 
          <Details
            onSelectDestination={ this.onMapPointHover }
            clearDetails={ this.clearDetails }
          /> :
          ''
        }

        <ReactTransitionGroup component='g'>
          <Steamgraph onHover={ this.onMapPointHover } />
          <Timeline onOfficeholderSelected = { this.onOfficeholderSelected } />
        </ReactTransitionGroup>

        <Title />

      </div>
    );
  }

}

export default App;