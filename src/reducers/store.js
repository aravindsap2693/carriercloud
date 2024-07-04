import appReducer from './index';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const configureStore = () => createStore( appReducer, composeEnhancers(applyMiddleware(thunk)) );

export default configureStore;