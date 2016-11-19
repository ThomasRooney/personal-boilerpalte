import React, {Component, PropTypes} from 'react';
import {Route, Router} from 'react-router';

import Home from './views/Home.jsx';
import {Provider} from 'react-redux';

export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  render() {
    const {store, history} = this.props;
    return (
      <Provider store={store}>
          <Router history={history}>
            <Route path='/' component={Home} />
          </Router>
      </Provider>
    );
  }
}
