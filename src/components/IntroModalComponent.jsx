import React, { PropTypes } from 'react';

/**
 * The new (Summer 2016) intro modal.
 * This is distinct from the IntroManager "intro",
 * which acts more like a series of walkthrough overlays.
 */
export default class IntroModal extends React.Component {

  constructor (props) {

    super(props);

    this.dismissIntro = this.dismissIntro.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

    this.state = this.getDefaultState();

  }

  componentWillMount () {

    let img = new Image(),
      onload = (event) => {
        img.removeEventListener('load', onload);
        this.setState({
          coverImgLoaded: true
        });
      };

    img.addEventListener('load', onload);
    img.src = IntroModal.coverImgPath;

  }

  getDefaultState () {

    return {
      pageIndex: 0
    };

  }

  setPage (pageIndex) {

    pageIndex = Math.max(0, Math.min(pageIndex, 1));
    this.setState({
      pageIndex
    });

  }

  dismissIntro () {

    if (this.props.onDismiss) this.props.onDismiss(this.refs.muteIntroInput.checked);

  }

  handleInputChange () {

    this.refs.muteIntroLabel.classList.toggle('checked', this.refs.muteIntroInput.checked);

  }



  // ============================================================ //
  // Lifecycle
  // ============================================================ //

  render () {

    if (this.state.pageIndex === 0) {

      return (
        <div className='intro-modal'>
          <div className='page p0'>
            <div className='title-block'>
              <h1>The Executive Abroad</h1>
              <h3>1905-2016</h3>
            </div>
            <img src={ './static/JFK_exiting_Air_Force_One.jpg' } className={ this.state.coverImgLoaded ? '' : 'loading' } />
            <p>No sitting American president traveled outside the country before Theodore Roosevelt traveled to Panama in 1906 to see the construction of the Panama Canal. A century later Air Force One regularly carries the head of the executive branch to all corners of the world. The <cite>Executive Abroad</cite> maps the international trips of presidents and secretaries of state.</p>
            <div className='intro-modal-button' onClick={ () => this.setPage(1) }>Next</div>
          </div>
        </div>
      );

    } else {

      return (
        <div className='intro-modal'>
          <div className='page p1'>
            <div className='title-block'>
              <h3>how to use</h3>
              <h2>this map</h2>
            </div>
            <div className='content'>
              <ol>
                <li>
                  <div className='ordinal'>1</div>
                  <div className='item text-overlay'>
                    <p>The map places Washington DC at the center with the globe arrayed around it.</p>
                    <img src='./static/introModalStep01.png' />
                  </div>
                </li>
                <li className='wider'>
                  <div className='ordinal'>2</div>
                  <div className='item'>
                    <p>Select a President or Secretary of State to map their travels.</p>
                    <img src='./static/introModalStep02.png' />
                  </div>
                </li>
                <li>
                  <div className='ordinal descender'>3</div>
                  <div className='item'>
                    <p>The graph shows frequency of visits to each geopolitical region over time.</p>
                    <img src='./static/introModalStep03.png' />
                  </div>
                </li>
                <li className='wider'>
                  <div className='ordinal descender'>4</div>
                  <div className='item  text-overlay4'>
                    <p>Hover over a marker to inspect or click to select to see details about visits.</p>
                    <img src='./static/introModalStep04.png' />
                  </div>
                </li>
              </ol>
            </div>
            <p className='map-desc'></p>
            <div className='intro-modal-button' onClick={ this.dismissIntro }>Enter</div>
            <div className='footer'>
              <div onClick={ () => this.setPage(0) }>&lt; back</div>
              <label onChange={ this.handleInputChange } ref='muteIntroLabel'><input type='checkbox' ref='muteIntroInput' />do not show again</label>
            </div>
          </div>
        </div>
      );

    }

  }

}
