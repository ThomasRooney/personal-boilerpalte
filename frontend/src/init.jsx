import React from 'react';
import {AppContainer} from 'react-hot-loader';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import {reducer as reduxFormReducer} from 'redux-form';
import DevTools from './views/DevTools.jsx';
import createSagaMiddleware from 'redux-saga';
import sagas from './sagas/sagas.js';
import reducers from './sagas/reducers.js';
import { syncHistoryWithStore, routerReducer, routerMiddleware } from 'react-router-redux';
import { Router, Route, hashHistory } from 'react-router';

import Root from './root.jsx';

const middleware = createSagaMiddleware();

let store;

if (process.env.NODE_ENV !== 'production') {
  const rootReducer = combineReducers({...reducers, form: reduxFormReducer, routing: routerReducer });
  store = createStore(
    rootReducer,
    compose(applyMiddleware(thunk, middleware, routerMiddleware(hashHistory)), DevTools.instrument({maxAge: 50, shouldCatchErrors: true})),
  );
  ReactDOM.render(
    <DevTools store={store}>
    </DevTools>,
    document.getElementById('devtools-entrypoint'));
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./sagas/reducers.js', () => {
      store.replaceReducer(rootReducer);
    });
  }
} else {
  store = createStore(
    combineReducers({...reducers, user: userReducer, form: reduxFormReducer, routing: routerReducer }),
    compose(applyMiddleware(thunk, middleware, routerMiddleware(hashHistory))),
  );
}

sagas.map(middleware.run);

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(hashHistory, store);

window.store = store;

const maybeApp = document.getElementById('app-entrypoint');

if (maybeApp) {
  ReactDOM.render(
    <AppContainer>
      <Root store={store} history={history}/>
    </AppContainer>, maybeApp);
}

if (module.hot && maybeApp) {
  module.hot.accept('./root.jsx', () => {
    const NextRootContainer = require('./root.jsx').default;
    ReactDOM.render(
      <AppContainer>
        <NextRootContainer store={store} history={history}/>
      </AppContainer>, maybeApp);
  });
}
