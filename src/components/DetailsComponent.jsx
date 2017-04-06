// import node modules
import * as React from 'react';
import ReactDOM from 'react-dom';

import DataStore from '../stores/DataStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';

// main app container
export default class Details extends React.Component {

  constructor (props) { super(props); }

  render() {
    return (
      <div 
        className='details'
        key={ 'visits' + DataStore.getVisibleLocationIds().join('-') }
      >
        <div
          className='controls'
          style= { DimensionsStore.getDetailsControlStyle() }
        >
          { (DataStore.getPreviousDestinationIdSelected()) ?
            <span 
              onClick={ this.props.onSelectDestination }
              id={ DataStore.getPreviousDestinationIdSelected() }
            > 
              { 'previous' }
            </span> :
            ''
          }

          <span onClick={ this.props.onSelectDestination } id=''>
            close
          </span>

          { (DataStore.getNextDestinationIdSelected()) ?
            <span 
              onClick={ this.props.onSelectDestination }
              id={ DataStore.getNextDestinationIdSelected() }
            > 
              { 'next' }
            </span> :
            ''
          }

        </div>
        <div
          className='destinations'
          style= { DimensionsStore.getDetailsStyle() }
        >
          <h3 style= { DimensionsStore.getDetailsDestinationStyle() }>
            { DataStore.getDestinationDetails(DataStore.getVisibleLocationIds())[0].properties.city + ', ' + DataStore.getDestinationDetails(DataStore.getVisibleLocationIds())[0].properties.country}
          </h3>
        {/* <h4 style= { DimensionsStore.getDetailsOfficeholderStyle() }>
            { ((DataStore.getDestinationDetails(DataStore.getVisibleLocationIds())[0].properties.position == 'SOS') ? 'Secretary of State ' : 'President ')  + DataStore.getDestinationDetails(DataStore.getVisibleLocationIds())[0].properties.pres_sos}
          </h4> */}
          
          <ul>
          { DataStore.getDestinationDetails(DataStore.getVisibleLocationIds()).map((destination, i) => {
            let d = new Date(destination.properties.date_convert.substring(0,10)),
              date = d.toLocaleString('en-us', { month: "long" }) + ' ' + d.getDate() + ', ' + d.getFullYear();
            return (
              <li key={ 'detail' + i }>
                { date }
                <br />
                <span className='description'>{ destination.properties.remarks }</span>
              </li>
            );
          })}
          </ul>
        </div>
      </div>
    );
  }

}