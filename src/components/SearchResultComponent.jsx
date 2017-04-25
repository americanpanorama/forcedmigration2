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
      <ul>
        { this.props.options.map(l => {
          return (
            <li 
              onClick={ () => { this.props.onOptionSelected(l.visits.map(v => v.cartodb_id)); } }
              className={ l.regionClass }
              key={ 'searchResult' + l.displayName }
            >
              { l.displayName }
            </li>
          );
        })}

      </ul>
    );
  }

}