// import node modules
import d3 from 'd3';
import * as React from 'react';
import ReactDOM from 'react-dom';
import ReactTransitionGroup from 'react-addons-transition-group';

import Term from './TermComponent.jsx';
import YearTick from './YearTickComponent.jsx';

import DataStore from '../stores/DataStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';

// main app container
export default class Timeline extends React.Component {

  constructor (props) { 
    super(props); 
    this.state = {
      rotate: DataStore.getTimelineRotation()
    };
  }

  componentWillReceiveProps(nextProps) {
    d3.select(ReactDOM.findDOMNode(this)).select('g')
      .transition()
      .duration(750)
      .attrTween('transform', (d) => (t) => 'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ') rotate(' + d3.interpolate(this.state.rotate, DataStore.getTimelineRotation())(t) + ' ' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')' )
      .each('end', () => this.setState({
        rotate: DataStore.getTimelineRotation()
      }));
  }

  render() {
    return (
      <svg
        width={ DimensionsStore.getWidthHeight() }
        height={ DimensionsStore.getWidthHeight() }
      > 
        <g transform={'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ') rotate(' + this.state.rotate + ' ' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')'}>
        {/* presidents */}

          <defs>
            <path 
              id='presSegment'
              d={ DimensionsStore.getPresLabelArc() }
            />
          </defs>

          <path
            d={ DimensionsStore.getTermsArc() }
            transform={ 'translate(' + DimensionsStore.getRadius() + ',' + DimensionsStore.getRadius() + ')' }
            className={ 'term-bg' }
          />

          <ReactTransitionGroup
            component='g'
            className='terms' 
          >

            <Term
              theArc={ DimensionsStore.getPresArc() }
              startAngle={ Math.PI * 2 - Math.PI * 0.075  }
              endAngle={ Math.PI * 2 + Math.PI * 0.075 }
              selected={ DataStore.allPresidentsShown() } 
              id='president'
              onOfficeholderSelected={ this.props.onOfficeholderSelected }
              label='PRESIDENTS'
              textHref={ '#presSegment' }
              key={ 'presidentialtermlabel' }
              className='officelabel'
            />

            { DataStore.getPresidentialTerms().map((presidency, i) => {
              let isSelected = (DataStore.getSelectedOffice() == 'president' && DataStore.getSelectedId() == presidency.number);
              return (
                <Term
                  theArc={ DimensionsStore.getPresArc() }
                  startAngle={ presidency.startAngle  }
                  endAngle={ presidency.endAngle }
                  selected={ isSelected } 
                  visitedVisible={ DataStore.visitedLocation(presidency.number, 'president') }
                  id={ 'president-' + presidency.number }
                  onOfficeholderSelected={ this.props.onOfficeholderSelected }
                  label={ (isSelected) ? presidency.name : presidency.last_name }
                  textHref={ '#presSegment' }
                  key={ 'presidentialterm' + i }
                />
              );
            }) }

          </ReactTransitionGroup>

        {/* secretaries of state */}
          <defs>
            <path 
              id='sosSegment'
              d={ DimensionsStore.getSOSLabelArc() }
            />
          </defs>

          <ReactTransitionGroup
            component='g' 
            className='terms' 
          >

            <Term
              theArc={ DimensionsStore.getSOSArc() }
              startAngle={ Math.PI * 2 - Math.PI * 0.075  }
              endAngle={ Math.PI * 2 + Math.PI * 0.075 }
              selected={ DataStore.allSOSsShown() } 
              id='sos'
              onOfficeholderSelected={ this.props.onOfficeholderSelected }
              label='SECRETARIES OF STATE'
              textHref='#sosSegment'
              key='sosltermlabel'
              className='officelabel'
            />

            { DataStore.getSOSTerms().map((sos, i) => {
              let isSelected = (DataStore.getSelectedOffice() == 'sos' && DataStore.getSelectedId() == sos.number);
              return (
                <Term
                  theArc={ DimensionsStore.getSOSArc() }
                  startAngle={ sos.startAngle  }
                  endAngle={ sos.endAngle }
                  selected={ isSelected }
                  visitedVisible={ DataStore.visitedLocation(sos.number, 'sos') }
                  id={ 'sos-' + sos.number }
                  onOfficeholderSelected={ this.props.onOfficeholderSelected }
                  label={ (isSelected) ? sos.name : sos.last_name }
                  textHref='#sosSegment'
                  key={ 'sostermlabel' + i }
                />
              );
            }) }

          </ReactTransitionGroup>

          <ReactTransitionGroup
            component='g' 
            className='years' 
          >
            { DataStore.getYearsWithAngles().map((yearData) => {
              return (
                  <YearTick
                    yearData={ yearData }
                    label= { (yearData.year % 4 == 0) ? yearData.year : '' }
                    key={ 'year' + yearData.year }
                  />
              );
            }) }
          </ReactTransitionGroup>
        </g>
      </svg>
    );
  }

}