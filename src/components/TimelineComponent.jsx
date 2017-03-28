// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';

import ReactTransitionGroup from 'react-addons-transition-group';

import Term from './TermComponent.jsx';

import DataStore from '../stores/DataStore.js';

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
    var termsArc = d3.svg.arc()
      .innerRadius(this.props.dimensions.radius + 30)
      .outerRadius(this.props.dimensions.radius + 60);

    var sosArc = d3.svg.arc()
      .innerRadius(this.props.dimensions.radius)
      .outerRadius(this.props.dimensions.radius + 30);

    var yearArc = d3.svg.arc()
      .innerRadius(this.props.dimensions.radius + 60)
      .outerRadius(this.props.dimensions.radius + 90);

    return (
      <g>
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
                theArc={ termsArc }
                startAngle={ presidency.startAngle  }
                endAngle={ presidency.endAngle }
                selected={ isSelected } 
                id={ 'president-' + presidency.number }
                onOfficeholderSelected={ this.props.onOfficeholderSelected }
                label={ presidency.president }
                radius={ this.props.dimensions.radius }
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
                theArc={ sosArc }
                startAngle={ sos.startAngle  }
                endAngle={ sos.endAngle }
                selected={ isSelected }
                id={ 'sos-' + sos.number }
                onOfficeholderSelected={ this.props.onOfficeholderSelected }
                label={ sos.name.split(' ').splice(-1) }
                radius={ this.props.dimensions.radius }
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
              <Term
                theArc={ yearArc }
                startAngle={ yearData.startAngle + 0.001 }
                endAngle={ yearData.endAngle - 0.001}
                color={ 'transparent' }
                label={ (yearData.year % 4 == 0 || DataStore.isSelectedYear(yearData.year)) ? yearData.year : '|' }
                radius={ this.props.dimensions.radius }
                textHref={ '#yearSegment' }
              />
            </ReactTransitionGroup>
          );
        }) }


      </g>
    );
  }

}