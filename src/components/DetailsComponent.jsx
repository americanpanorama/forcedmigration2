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
        { (DataStore.isSelectedLocation()) ?
          <div
            className='controls'
            style= { DimensionsStore.getDetailsControlStyle() }
          >

            <span onClick={ this.props.onSelectDestination } id=''>
              close
            </span>

            { (DataStore.getPreviousDestinationIdSelected() && DataStore.getVisibleLocationIds().length == 1) ?
              <span 
                onClick={ this.props.onSelectDestination }
                id={ DataStore.getPreviousDestinationIdSelected() }
              > 
                { 'previous' }
              </span> :
              ''
            }

            { (DataStore.getNextDestinationIdSelected() && DataStore.getVisibleLocationIds().length == 1) ?
              <span 
                onClick={ this.props.onSelectDestination }
                id={ DataStore.getNextDestinationIdSelected() }
              > 
                { 'next' }
              </span> :
              ''
            }

          </div> : ''
        }
  
        <div
          className='destinations'
          style= { DimensionsStore.getDetailsStyle() }
        >
          <div
            className='inner'
            style= { DimensionsStore.getDetailsInnerStyle() }
          >
            <h3 style= { DimensionsStore.getDetailsDestinationStyle() }>
              { DataStore.getDestinationDetails(DataStore.getVisibleLocationIds())[0].properties.city + ', ' + DataStore.getDestinationDetails(DataStore.getVisibleLocationIds())[0].properties.country}
            </h3>
          {/* <h4 style= { DimensionsStore.getDetailsOfficeholderStyle() }>
              { ((DataStore.getDestinationDetails(DataStore.getVisibleLocationIds())[0].properties.position == 'SOS') ? 'Secretary of State ' : 'President ')  + DataStore.getDestinationDetails(DataStore.getVisibleLocationIds())[0].properties.pres_sos}
            </h4> */}
            
            <ul>
            { DataStore.getDestinationDetails(DataStore.getVisibleLocationIds()).map((destination, i) => {
              let dp = destination.properties.start_date.split('-'),
                d = new Date(dp[0], dp[1]-1, dp[2]),
                date = d.toLocaleString('en-us', { month: "long" }) + ' ' + d.getDate() + ', ' + d.getFullYear();
              if (destination.properties.end_date) {
                let d1p = destination.properties.end_date.split('-'),
                  d1 = new Date(d1p[0], d1p[1]-1, d1p[2]),
                  day1 = d.getDate(),
                  day2 = d1.getDate(),
                  month1 = d.toLocaleString('en-us', { month: "long" }),
                  month2 = d1.toLocaleString('en-us', { month: "long" }),
                  year1 = d.getFullYear(),
                  year2 = d1.getFullYear();
                if (year1 != year2) {
                  date = month1 + ' ' + day1 + ', ' + year1 + '-' + month2 + ' ' + day2 + ', ' + year2;
                } else if (month1 != month2) {
                  date = month1 + ' ' + day1 + '-' + month2 + ' ' + day2 + ', ' + year1;
                } else if (day1 != day2) {
                  date = month1 + ' ' + day1 + '-' + day2+ ', ' + year1;
                }
              }
              return (
                <li key={ 'detail' + i }>
                  <span className='date'>{ date }</span>
                  {/* show name if all officeholders selected */}
                  { (!DataStore.getSelectedId()) ?
                    <span className='officeholder'>
                      <br />
                      { ((DataStore.getSelectedOffice() == 'president') ? 'Pres.' : 'SOS') + ' ' + destination.properties.pres_sos }
                    </span> : ''
                  }
                  <br />
                  <span className='description'>{ destination.properties.remarks }</span>
                </li>
              );
            })}
            </ul>
          </div>
        </div>
      </div>
    );
  }

}