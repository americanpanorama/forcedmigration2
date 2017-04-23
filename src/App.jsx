// import node modules
import "babel-polyfill";
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
import AboutLink from './components/AboutLinkComponent.jsx';
import DorlingLegend from './components/DorlingLegendComponent.jsx';
import IntroModal from './components/IntroModalComponent.jsx';
import Search from './components/SearchComponent.jsx';

import DataStore from './stores/DataStore';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      about: (HashManager.getState()['about']) ? true : false,
      showIntroModal: true
    };

    // bind handlers
    const handlers = ['onWindowResize', 'onOfficeholderSelected', 'storeChanged', 'onMapPointHover', 'onMapPointClick', 'onMapPointOut', 'onViewAbout', 'onDismissIntroModal', 'onSearchSelected'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  componentWillMount () { 
    const theHash = HashManager.getState(),
      office = (Object.keys(theHash).indexOf('sos') !== -1) ? 'sos' : 'president',
      id = (theHash[office]) ? (HashManager.getState()[office]) : null,
      visits = (theHash.visit) ? [theHash.visit] : [];
    AppActions.parseData(id, office, visits, parseFloat(theHash.lat), parseFloat(theHash.lng)); 
  }

  componentDidMount () {
    window.addEventListener('resize', this.onWindowResize);
    DataStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
  }

  componentDidUpdate () { this.changeHash(); }

  storeChanged() { this.setState({}); }

  onOfficeholderSelected(e) {
    let office, id;
    if (e.target.id == 'president' || e.target.id == 'sos') {
      office = e.target.id;
      id = null;
    } else {
      [office, id] = e.target.id.split('-');
      if (id == DataStore.getSelectedId() && office == DataStore.getSelectedOffice()) {
        id = null;
      }
    }

    AppActions.officeholderSelected(id, office);
    this.setState({ about: false });
  }

  onMapPointHover(e) { 
    let ids = e.target.id.split('-').map(id => parseInt(id));
    // only hover if it's not selected
    AppActions.visitsInspected(ids);
    if (!DataStore.getSelectedLocationIds().every((v,i)=> v === ids[i])) {
      //AppActions.visitsInspected(ids); 
    }
    this.setState({ about: false });
  }

  onMapPointOut() { AppActions.visitsInspected([]); }

  onMapPointClick(e) { 
    this.setState({ about: false });
    let ids = (e.target.id) ? e.target.id.split('-').map(id => parseInt(id)) : [];
    // off if the selected location is clicked again
    if (ids.every((v,i)=> v === DataStore.getSelectedLocationIds()[i])) {
      ids = [];
    }
    AppActions.visitsSelected(ids); 
  }

  onSearchSelected(ids) { AppActions.visitsSelected(ids); }

  onViewAbout() { this.setState({ about: !this.state.about }); }

  onDismissIntroModal (persist) {
    if (persist) {
      window.localStorage.setItem('hasViewedIntroModal-executiveabroad', 'true');
    }
    this.setState({
      showIntroModal: false
    });
  }


  onWindowResize() { AppActions.windowResized(); }

  changeHash () {
    let hash = {},
      office = DataStore.getSelectedOffice();
    hash.president = (office == 'president') ? DataStore.getSelectedId() : null;
    hash.sos = (office == 'sos') ? DataStore.getSelectedId() : null;
    if (DataStore.hasSelectedLocation()) {
      if (DataStore.getSelectedLocationIds().length == 1) {
        hash.lat = null;
        hash.lng = null;
        hash.visit = DataStore.getSelectedLocationIds();
      } else {
        hash.lat = DataStore.getLatLng(DataStore.getSelectedLocationIds()[0])[1];
        hash.lng = DataStore.getLatLng(DataStore.getSelectedLocationIds()[0])[0];
        hash.visit = null;
      }
    } else {
      hash.lat = null;
      hash.lng = null;
      hash.visit = null;
    }
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
       
        { (DataStore.hasVisibleLocation()) ? 
          <Details onSelectDestination={ this.onMapPointClick } /> :  
          <Search onSelected={ this.onSearchSelected } />
        }

        { (this.state.about) ? <About onClick={ this.onViewAbout }/> : '' } 

        <ReactTransitionGroup component='g'>
          <Steamgraph 
            onClick={ this.onMapPointClick }
            onHover={ this.onMapPointHover } 
            onMouseLeave={ this.onMapPointOut }
          />
          <Timeline onOfficeholderSelected = { this.onOfficeholderSelected } />
        </ReactTransitionGroup>

        <Title />

        <AboutLink onClick={ this.onViewAbout } />

        <DorlingLegend />

        { !this.state.showIntroModal ? <IntroModal onDismiss={ this.onDismissIntroModal } /> : '' }

      </div>
    );
  }

}

export default App;