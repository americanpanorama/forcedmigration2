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
import AboutLink from './components/AboutLinkComponent.jsx';
import IntroModal from './components/IntroModalComponent.jsx';

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
    const handlers = ['onWindowResize', 'onOfficeholderSelected', 'storeChanged', 'onMapPointHover', 'onMapPointClick', 'onMapPointOut', 'onViewAbout', 'onDismissIntroModal'];
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
       
        { (DataStore.hasVisibleLocation()) ? <Details onSelectDestination={ this.onMapPointClick } /> : '' }

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

        { !this.state.showIntroModal ? <IntroModal onDismiss={ this.onDismissIntroModal } /> : '' }

      </div>
    );
  }

}

export default App;