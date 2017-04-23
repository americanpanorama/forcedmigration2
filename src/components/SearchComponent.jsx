// import node modules
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Typeahead } from 'react-typeahead';

import DataStore from '../stores/DataStore.js';
import DimensionsStore from '../stores/DimensionsStore.js';

// main app container
export default class Search extends React.Component {

  constructor (props) { super(props); }

  render() {
    return (
      <div 
        className='search'
        style= { DimensionsStore.getSearchStyle() }
      >
        <Typeahead
          options={ DataStore.getDestinationsForSelected() }
          placeholder='Search by location'
          filterOption='searchName'
          displayOption='displayName'
          onOptionSelected={ c => this.props.onSelected(c.visits.map(v => v.cartodb_id)) }
          maxVisible={ 16 }
          style={ DimensionsStore.getSearchInnerStyle() }
        />
      </div>
    );
  }

}