import { applyMiddleware, combineReducers, compose, createStore, Store } from 'redux'
import thunk from 'redux-thunk'
// rehydrate state on app start
import esReducer from './reducer'
import { MainRootState, QueryAction } from '../types'

const rootReducer = combineReducers<MainRootState, QueryAction>({
  esDsl: esReducer
  // otherReducer: {}
})

const isServer = typeof window === 'undefined'
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__'

export function getOrCreateStore(initialState?: MainRootState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState)
  }

  // Create store if unavailable on the client and set it on the window object
  if (!(window as any)[__NEXT_REDUX_STORE__]) {
    ;(window as any)[__NEXT_REDUX_STORE__] = initializeStore(initialState)
  }
  return (window as any)[__NEXT_REDUX_STORE__]
}

// TODO - reactotron for dev only
function initializeStore(
  // history: History,
  initialState?: MainRootState
): Store<MainRootState> {
  if (__DEV__) {
    console.log('Dev warning - initializing storeasdf, initial state=', initialState)
  }

  // const composedEnhancers = compose(applyMiddleware(thunk))
  return createStore(rootReducer, initialState as any, applyMiddleware(thunk))

  // if (isServer) {
  //   return createStore(rootReducer, initialState as any, applyMiddleware(thunk))
  // } else {
  // if (__DEV__) {
  //   console.log('----IN DEV MODE, adding reactatrong')
  //   const Reactotron = require('reactotron-react-js').default
  //   const { reactotronRedux } = require('reactotron-redux')
  //   const tron = Reactotron.configure()
  //     .use(reactotronRedux())
  //     .connect()
  //   const reactatronEnhancer = (tron as any).createEnhancer()

  //   // const composedEnhancers = compose(applyMiddleware(thunk))
  //   const composedEnhancers = compose(
  //     reactatronEnhancer,
  //     applyMiddleware(thunk)
  //   )
  //   // return createStore(rootReducer, initialState, composedEnhancers as any)
  //   return createStore(rootReducer, initialState as any, composedEnhancers as any)
  // } else {
  //   console.log('----PROD MODE, skipping reactatron')
  //   const composedEnhancers = compose(applyMiddleware(thunk))
  //   return createStore(rootReducer, initialState, composedEnhancers as any)
  // }
  // }
}
