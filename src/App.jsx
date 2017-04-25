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
import Navigation from './components/PanNavComponent.jsx';

import DataStore from './stores/DataStore';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';
import panoramaNavData from '../data/panorama-nav.json';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      about: (HashManager.getState()['about']) ? true : false,
      showIntroModal: window.localStorage.getItem('hasViewedIntroModal-executiveabroad') !== 'true',
      transitioning: false,
      show_panorama_menu: false
    };

    // bind handlers
    const handlers = ['onWindowResize', 'onOfficeholderSelected', 'storeChanged', 'onMapPointHover', 'onMapPointClick', 'onMapPointOut', 'onViewAbout', 'onDismissIntroModal', 'onSearchSelected','onPanoramaMenuClick'];
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
    if (this.state.transitioning) {
      return;
    }

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
    setTimeout(() => this.setState({ transitioning: false}), 800);
    this.setState({ 
      about: false,
      transitioning: true
    });
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

  onPanoramaMenuClick() { this.setState({ show_panorama_menu: !this.state.show_panorama_menu }); }

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

        <Navigation 
          show_menu={ this.state.show_panorama_menu } 
          on_hamburger_click={ this.onPanoramaMenuClick } 
          nav_data={ panoramaNavData.filter((item, i) => item.url.indexOf('executive-abroad') === -1) } 
          links={ [
            { name: 'Digital Scholarship Lab', url: '//dsl.richmond.edu' },
            { name: 'University of Richmond', url: '//www.richmond.edu' }
          ] }
          link_separator=', '
        />

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

        { this.state.showIntroModal ? <IntroModal onDismiss={ this.onDismissIntroModal } /> : '' }

      </div>
    );
  }

}

export default App;