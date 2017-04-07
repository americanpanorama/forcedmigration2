// import node modules
import * as React from 'react';

import DimensionsStore from '../stores/DimensionsStore';

// main app container
export default class About extends React.Component {

  render() {
    return (
      <div id='about' style={ DimensionsStore.getAboutStyle() }>
        <svg
          width={ DimensionsStore.getWidthHeight() }
          height={ DimensionsStore.getWidthHeight() }
          id='about-bg'
        > 

          <circle
            cx={ DimensionsStore.getRadius() }
            cy={ DimensionsStore.getRadius() }
            r={ DimensionsStore.getRadius() }
            transform={'translate(' + DimensionsStore.getTimelineWidth() + ',' + DimensionsStore.getTimelineWidth() + ')' }
          />

        </svg>

        <div 
          id='about-close'  
          onClick={ this.props.onClick }
          style={ DimensionsStore.getAboutCloseStyle() }
        >
          close
        </div>

        <div id='about-content'  style={ DimensionsStore.getAboutContentStyle() } >
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur mattis lobortis ex. Aenean nec nisl est. Donec a tempus lorem. Aliquam cursus hendrerit lorem, et feugiat quam elementum in. Curabitur scelerisque in ante non aliquam. Donec vel arcu eget metus viverra porta. Maecenas vestibulum tellus vitae tellus consectetur, quis bibendum magna posuere. Maecenas nibh mi, viverra eget convallis sit amet, tempus et leo. Integer aliquet varius odio, vitae mollis metus porttitor sed. Pellentesque ut nibh at mi elementum ultrices eu nec ex. Quisque bibendum tortor turpis, sit amet tincidunt dui consequat nec. Quisque sit amet lorem sed magna suscipit malesuada quis vel ipsum. Cras imperdiet pulvinar enim, dignissim maximus lectus dictum id. Praesent vel lacus iaculis, sodales elit ut, vestibulum quam.</p>

          <p>Vivamus bibendum turpis vel libero imperdiet facilisis. Sed lobortis tincidunt erat, sit amet sagittis ex efficitur sed. Vestibulum eu ornare odio, vel vehicula dui. Nulla consequat et enim a pretium. Quisque semper dolor et ante molestie, nec sagittis risus efficitur. Interdum et malesuada fames ac ante ipsum primis in faucibus. Fusce tempus non odio eu laoreet. Nam porttitor ac dui sed varius. Vivamus elementum felis leo, sollicitudin congue nunc tempor a. In interdum turpis at cursus placerat. Nulla ipsum est, pretium non blandit non, elementum at enim.</p>
          <h3>Sources</h3>

          <p>The <a href='https://history.state.gov/departmenthistory/travels'>data for foreign trips by presidents and secretaries of state</a> come from the Office of the Historian, Bureau of Public Affairs, United States of America.</p>

          <h3>Acknowledgments</h3>
          <p>This map is authored by Robert K. Nelson, Justin Madron, Timothy Barney and the students in Barney's "TITLE" class: .</p>
          <p>The <a href='//mellon.org'>Andrew W. Mellon Foundation</a> generously provided grant finding to develop American Panorama.</p>
        </div> 
      </div>
    );
  }

}