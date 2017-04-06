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
import About from './components/AboutComponent.jsx';

import DataStore from './stores/DataStore';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      about: (HashManager.getState()['about']) ? true : false
    };

    // bind handlers
    const handlers = ['onWindowResize', 'onOfficeholderSelected', 'storeChanged', 'onMapPointHover', 'onMapPointClick', 'onMapPointOut', 'onViewAbout'];
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
    this.setState({ about: false });
  }

  onMapPointHover(e) { 
    let ids = (DataStore.getInspectedLocationIds().length==e.target.id.split('-').length && DataStore.getInspectedLocationIds().every((v,i)=> v === e.target.id.split('-')[i])) ? [] : e.target.id.split('-');
    AppActions.visitsInspected(ids); 
    this.setState({ about: false });
  }

  onMapPointOut() { AppActions.visitsInspected([]); }

  onMapPointClick(e) { 
    let ids = (DataStore.getSelectedLocationIds().length==e.target.id.split('-').length && DataStore.getSelectedLocationIds().every((v,i)=> v === e.target.id.split('-')[i])) ? [] : e.target.id.split('-');
    AppActions.visitsSelected(ids); 
    this.setState({ about: false });
  }

  onViewAbout() { this.setState({ about: !this.state.about }); }

  clearDetails() { AppActions.visitsSelected([]); }

  onWindowResize() { AppActions.windowResized(); }

  changeHash () {
    let hash = {},
      office = DataStore.getSelectedOffice();
    hash['president'] = (office == 'president') ? DataStore.getSelectedId() : null;
    hash['sos'] = (office == 'sos') ? DataStore.getSelectedId() : null;
    hash['visits'] = (DataStore.hasSelectedLocation()) ? DataStore.getSelectedLocationIds().join('-') : null;
    HashManager.updateHash(hash);
  }

  render () {
    return (
      <div>

        <TheMap 
          onClick={ this.onMapPointClick }
          onHover={ this.onMapPointHover } 
          onMouseLeave={ this.onMapPointOut }
        />

        <About 
          open={ this.state.about } 
          onClick={ this.onViewAbout }
        /> 
       
        { (DataStore.hasVisibleLocation()) ? 
          <Details
            onSelectDestination={ this.onMapPointHover }
            clearDetails={ this.clearDetails }
          /> :
          ''
        }

        <ReactTransitionGroup component='g'>
          <Steamgraph 
            onClick={ this.onMapPointClick }
            onHover={ this.onMapPointHover } 
            onMouseLeave={ this.onMapPointOut }
          />
          <Timeline onOfficeholderSelected = { this.onOfficeholderSelected } />
        </ReactTransitionGroup>

        <Title />

        


      </div>
    );
  }

}

export default App;