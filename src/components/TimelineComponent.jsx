// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

import ReactTransitionGroup from 'react-addons-transition-group';

import Term from './TermComponent.jsx';
import YearTick from './YearTickComponent.jsx';

import DataStore from '../stores/DataStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';

// utils
// TODO: refactor to use same structure as PanoramaDispatcher;
// Having `flux` as a dependency, and two different files, is overkill.
import { AppActions, AppActionTypes } from '../utils/AppActionCreator';
import AppDispatcher from '../utils/AppDispatcher';


// main app container
export default class Timeline extends React.Component {

  constructor (props) {
    super(props);

  }

  render() {
    return (
      <g transform={'rotate(0 ' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')'}>
        <text 
          fontSize="15"
          textAnchor='middle'
        >
          <textPath 
            xlinkHref={'#arcSegment'} 
            startOffset='50%'
          >
            PRESIDENTS
          </textPath>

          <textPath 
            xlinkHref={'#sosSegment'} 
            startOffset='50%'
          >
            SECRETARIES OF STATE
          </textPath>
        </text>

        { DataStore.getPresidentialTerms().map((presidency, i) => {
          let isSelected = (DataStore.getSelectedOffice() == 'president' && DataStore.getSelectedId() == presidency.number);
          return (
            <ReactTransitionGroup
              key={ 'presidentialterm' + i }
              component='g'
              className='terms' 
            >
              <Term
                theArc={ DimensionsStore.getPresArc() }
                startAngle={ presidency.startAngle  }
                endAngle={ presidency.endAngle }
                selected={ isSelected } 
                id={ 'president-' + presidency.number }
                onOfficeholderSelected={ this.props.onOfficeholderSelected }
                visited={ DataStore.getOfficeholdersWhoVisitedSelected().indexOf('president-' + presidency.number) !== -1 }
                label={ presidency.president }
                radius={ DimensionsStore.getRadius() }
                textHref={ '#arcSegment' }
              />
            </ReactTransitionGroup>
          );
        }) }

        { DataStore.getSOSTerms().map((sos, i) => {
          let isSelected = (DataStore.getSelectedOffice() == 'sos' && DataStore.getSelectedId() == sos.number);
          return (
            <ReactTransitionGroup
              key={ 'sosterm' + i }
              component='g' 
              className='terms' 
            >
              <Term
                theArc={ DimensionsStore.getSOSArc() }
                startAngle={ sos.startAngle  }
                endAngle={ sos.endAngle }
                selected={ isSelected }
                id={ 'sos-' + sos.number }
                onOfficeholderSelected={ this.props.onOfficeholderSelected }
                label={ sos.name.split(' ').splice(-1) }
                radius={ DimensionsStore.getRadius() }
                textHref={ '#sosSegment' }
              />
            </ReactTransitionGroup>
          );
        }) }

        { DataStore.getYearsWithAngles().map((yearData) => {
          return (
            <ReactTransitionGroup
              key={ 'year' + yearData.year }
              component='g' 
              className='years' 
            >
              <YearTick
                yearData={ yearData }
                label= { (yearData.year % 4 == 0) ? yearData.year : '' }
              />
            </ReactTransitionGroup>
          );
        }) }
      </g>
    );
  }

}