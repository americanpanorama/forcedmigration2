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

          <text 
            fontSize={ DimensionsStore.getTermsLabelSize() }
            textAnchor='middle'
          >
            <textPath 
              xlinkHref={'#presSegment'} 
              startOffset='50%'
            >
              PRESIDENTS
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
                  label={ (isSelected) ? presidency.name : presidency.last_name }
                  radius={ DimensionsStore.getRadius() }
                  textHref={ '#presSegment' }
                />
              </ReactTransitionGroup>
            );
          }) }


        {/* secretaries of state */}
          <defs>
            <path 
              id='sosSegment'
              d={ DimensionsStore.getSOSLabelArc() }
            />
          </defs>

          <text 
            fontSize={ DimensionsStore.getTermsLabelSize() }
            textAnchor='middle'
          >
            <textPath 
              xlinkHref={'#sosSegment'} 
              startOffset='50%'
            >
              SECRETARIES OF STATE
            </textPath>
          </text>

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
                  label={ (isSelected) ? sos.name : sos.last_name }
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
      </svg>
    );
  }

}