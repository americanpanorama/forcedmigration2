// import node modules
import * as React from 'react';
import ReactDOM from 'react-dom';
import { Typeahead } from 'react-typeahead';

import SearchResult from './SearchResultComponent.jsx';

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
          onOptionSelected={ this.props.onSelected }
          customListComponent={ SearchResult }
          maxVisible={ 16 }
          style={ DimensionsStore.getSearchInnerStyle() }
        />
      </div>
    );
  }

}