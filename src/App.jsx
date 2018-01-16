// import node modules
//import "babel-polyfill";
import d3 from 'd3';
import * as React from 'react';
import ReactTransitionGroup from 'react-addons-transition-group';

// utils
import { AppActions, AppActionTypes } from './utils/AppActionCreator';
import AppDispatcher from './utils/AppDispatcher';



import PlacesStore from './stores/Places';
import GeographyStore from './stores/Geography';
import DimensionsStore from './stores/DimensionsStore';
import HashManager from './stores/HashManager';
import panoramaNavData from '../data/panorama-nav.json';

import Bubble from './components/Bubble.jsx';
import Polygon from './components/Polygon.jsx';
import BarChart from './components/BarChart.jsx';
import ZoomControls from './components/ZoomControlsComponent.jsx';

// main app container
class App extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      about: (HashManager.getState()['about']) ? true : false,
      showIntroModal: window.localStorage.getItem('hasViewedIntroModal-executiveabroad') !== 'true',
      transitioning: false,
      show_panorama_menu: false,
      selectedDecade: HashManager.getState().decade || 1820,
    };

    // bind handlers
    const handlers = ['storeChanged', 'handleMouseUp', 'handleMouseDown', 'handleMouseMove','onTimelineDecadeSelect', 'onZoomIn', 'zoomOut', 'resetView'];
    handlers.map(handler => { this[handler] = this[handler].bind(this); });
  }

  componentWillMount () { 
    AppActions.loadInitialData(this.state, HashManager.getState()); 
    DimensionsStore.calculate();
  }

  componentDidMount () {
    PlacesStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    DimensionsStore.addListener(AppActionTypes.storeChanged, this.storeChanged);
    GeographyStore.addListener(AppActionTypes.storeChanged, this.storeChanged);

    // recalculate dimensions now that everything's mounted in the DOM
    AppActions.windowResized();
    PlacesStore.parseHexesProjected();
    PlacesStore.parseStateTotals();
  }

  componentDidUpdate () { this.changeHash(); }

  storeChanged() { this.setState({}); }



  onWindowResize() { AppActions.windowResized(); }

  onTimelineDecadeSelect(e) {
    // TODO if county no longer exists, de-select
    this.setState({"selectedDecade":e.target.id});
  }

  onZoomIn(event) {
    event.preventDefault();
    const z = Math.min(GeographyStore.getZ() * 1.62, 18),
      centerX = (event.target.id == 'zoomInButton') ? DimensionsStore.getMapWidth()  / 2 - GeographyStore.getX() : event.nativeEvent.offsetX - GeographyStore.getX(),
      centerY = (event.target.id == 'zoomInButton') ? DimensionsStore.getMapHeight()  / 2 - GeographyStore.getY() : event.nativeEvent.offsetY - GeographyStore.getY(),
      x = DimensionsStore.getMapWidth()  / 2 - centerX / GeographyStore.getZ() * z,
      y = DimensionsStore.getMapHeight()  / 2 - centerY / GeographyStore.getZ() * z;
    AppActions.mapMoved(x,y,z);
  }

  zoomOut() {
    const z = Math.max(GeographyStore.getZ() / 1.62, 1),
      x = DimensionsStore.getMapWidth()  / 2 - (DimensionsStore.getMapWidth()  / 2 - GeographyStore.getX()) / GeographyStore.getZ() * z,
      y = DimensionsStore.getMapHeight()  / 2 - (DimensionsStore.getMapHeight()  / 2 - GeographyStore.getY()) / GeographyStore.getZ() * z;
    AppActions.mapMoved(x,y,z);
  }

  resetView() { AppActions.mapMoved(0,0,1); }


  handleMouseUp() {
    this.dragging = false;
    this.coords = {};
  }

  handleMouseDown(e) {
    this.dragging = true;
    //Set coords
    this.coords = {x: e.pageX, y:e.pageY};
  }

  handleMouseMove(e) {
    //If we are dragging
    if (this.dragging) {
      e.preventDefault();
      //Get mouse change differential
      var xDiff = this.coords.x - e.pageX,
        yDiff = this.coords.y - e.pageY;
      //Update to our new coordinates
      this.coords.x = e.pageX;
      this.coords.y = e.pageY;
      //Adjust our x,y based upon the x/y diff from before
      var x = GeographyStore.getX() - xDiff,       
        y = GeographyStore.getY() - yDiff,
        z = GeographyStore.getZ();
      //Re-render
      AppActions.mapMoved(x,y,z); 
    }
  }

  changeHash () {
    const vizState = { 
      decade: this.state.selectedDecade,
      view: [GeographyStore.getX(), GeographyStore.getY(), GeographyStore.getZ()].join('/'),
    };
    // if (CitiesStore.getSelectedCity() && GeographyStore.getLatLngZoom().lat) {
    //   vizState.loc = { 
    //     zoom: GeographyStore.getLatLngZoom().zoom, 
    //     center: [GeographyStore.getLatLngZoom().lat, GeographyStore.getLatLngZoom().lng] 
    //   };
    // } else {
    //   vizState.loc = null;
    // }

    HashManager.updateHash(vizState);
  }

  render () {
    //GeographyStore.simplify_union();
    return (
      <div className='richmondatlas-forcedmigraton'>
        <article className="content">
          <h1>The forced migration of enslaved people in the United States 1810 - 1860</h1>
          <div className="article-content-wrapper">
           <div className="article-content-inner">
              <div className="population-map-container" style={{height: DimensionsStore.getMapHeight() + 'px'}}>
                  <svg 
                    width={DimensionsStore.getMapWidth()}
                    height={DimensionsStore.getMapHeight()}
                    className='theMap'
                  >
                    <g 
                      width={ DimensionsStore.getMapWidth() }  
                      height={ DimensionsStore.getMapHeight() }
                      className='ussvg'
                      onDoubleClick={ this.onZoomIn }
                      onMouseUp={this.handleMouseUp }
                      onMouseDown={this.handleMouseDown }
                      onMouseMove={this.handleMouseMove }
                      ref='mapChart'
                      transform={"translate("+GeographyStore.getX()+","+GeographyStore.getY()+")scale(" + GeographyStore.getZ() +")"}
                    >
                      { GeographyStore.getOceanPolygons().map((polygon,i) => {
                        return (
                          <path
                            key={ 'ocean' + i }
                            d={ GeographyStore.getPath(polygon.geometry) }
                            strokeWidth={ 0.2 } 
                            className='ocean'
                          />
                        );
                      })}

                      { GeographyStore.getStateBoundariesForDecade(this.state.selectedDecade).map((polygon,i) => {
                        return (
                          <path
                            key={ polygon.properties.id }
                            d={ GeographyStore.getPath(polygon.geometry) }
                            stroke='grey'
                            strokeOpacity={0.5}
                            fill='transparent'
                            strokeWidth={ 0.5 } 
                          />
                        );
                      })}

                      { GeographyStore.getCountyUnion().map((polygon,i) => {
                        let d = GeographyStore.getPath(polygon.geometry);
                        if (true || !d.includes('NaN')) {
                          return (
                            <Polygon
                              key={ 'countyUnion' + i }
                              d={ d }
                              color={ (polygon.properties[this.state.selectedDecade].ipsm > 0) ? '#AC3712' : '#2E5E66' }
                              opacity={ Math.abs(polygon.properties[this.state.selectedDecade].ipsm) / 10 }
                            />
                          );
                        }
                      })}


                      { (false && PlacesStore.hexesParsed) ?
                        <g>
                          { PlacesStore.getHexesProjected().map(b => {
                            return (
                              <Bubble
                                { ...b }
                                r={ DimensionsStore.getBubbleRadius(b['mig_' + this.state.selectedDecade]) }
                                color={(b['mig_' + this.state.selectedDecade] > 0) ? '#AC3712' : '#50a5b2'}
                                key={ b.id }
                                z={ GeographyStore.getZ() }
                              />
                            );
                          })}
                        </g> : ''
                      }
                    </g>

                   
                  </svg>

                  <ZoomControls
                    onZoomIn={ this.onZoomIn }
                    onZoomOut={ this.zoomOut }
                    resetView={ this.resetView }
                  />
              </div>

              <div className="population-timeline-container">
                <ul>
                  <li onClick={this.onTimelineDecadeSelect} id={1820}>1810s</li>
                  <li onClick={this.onTimelineDecadeSelect} id={1830}>1820s</li>
                  <li onClick={this.onTimelineDecadeSelect} id={1840}>1830s</li>
                  <li onClick={this.onTimelineDecadeSelect} id={1850}>1840s</li>
                  <li onClick={this.onTimelineDecadeSelect} id={1860}>1850s</li>

                </ul>
              </div>
            </div>
          </div>
        </article>

        <aside className="sidebar">
          <div className='component selected-decade-display'><div><span className="little-the">the</span><span>{ this.state.selectedDecade - 10 }s</span></div></div>
          <div className="">

            { (PlacesStore.stateTotalsParsed()) ?
              <BarChart
                yearData={ PlacesStore.getStateTotalsForDecade([this.state.selectedDecade]) }
                height={ PlacesStore.getStateTotalsForDecade([this.state.selectedDecade]).length * 20 + 42 }

              /> : ''
            }

          </div>
        </aside>

           

      </div>
    );
  }

}

export default App;