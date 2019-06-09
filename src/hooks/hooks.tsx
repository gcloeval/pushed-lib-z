import React, { useRef } from 'react'
import { Provider, useStore, shallowEqual, useSelector } from 'react-redux'
// import invariant from 'tiny-invariant';
import warning from 'tiny-warning'

import { createDraft, finishDraft } from 'immer'
import { MainRootState, ResponseData, Filter, RequestData } from '../types'

import { RequestClient } from '../state/request-client'
import { setRequest, setFilter } from '../state/actions'
import invariant from 'tiny-invariant'
import { getOrCreateStore } from '../state/store'
import {
  getResponseById,
  validateRequestExistsInState,
  getFilterById,
  getRequestById
} from '../state/reducer'

export interface HooksProviderProps {
  initialState?: MainRootState
  children: import('react').ReactNode
}
export function HooksProvider(props: HooksProviderProps) {
  let store = null
  if (props.initialState) {
    store = getOrCreateStore(props.initialState)
  } else {
    store = getOrCreateStore()
  }
  return <Provider store={store}>{props.children}</Provider>
}

export function useResponse(requestId: string): { response: ResponseData } {
  const response: ResponseData = useSelector((state: MainRootState) =>
    getResponseById(requestId, state)
  )

  return { response }
}

export function useFilter(
  requestId: string,
  filterId: string,
  initValue?: Filter,
  initDeps?: any[]
): { filter: Filter; saveFilter: () => void } {
  const store = useStore()
  const state = store.getState()
  validateRequestExistsInState(requestId, state)

  if (initValue && initValue.id !== filterId) {
    throw Error(
      `invalid initData for useFilter hook. Mismatch between filter id. Hook filterId ${filterId} does not match initData id:${initValue.id}`
    )
  }

  const lookupFunction = (): any => {
    // console.error('FILTER LOOKUP')
    const ret = getFilterById(requestId, filterId, state)
    return ret
  }
  const setterFunction = () => {
    store.dispatch(setFilter(requestId, initValue as any))
  }

  useInitCheck(lookupFunction, setterFunction, initValue, initDeps)

  const storedFilter = useSelector(
    (state: MainRootState) => getFilterById(requestId, filterId, state)
    // state.esDsl.requests[requestId] && state.esDsl.requests[requestId].filters
    //   ? state.esDsl.requests[requestId].filters![filterId]
    //   : undefined
  )

  let filter: any
  if (storedFilter) {
    filter = createDraft(storedFilter)
  } else {
    warning(true, `no filter found, it will be undefined`)
  }

  const saveFilter = () => {
    ;(filter as any).v_stamp = Math.random()
    const finished = finishDraft(filter)
    store.dispatch(setFilter(requestId, finished))
  }
  return { filter, saveFilter }
}

export function useRequest(
  requestId: string,
  initValue?: RequestData,
  initDeps?: any[]
): { requestClient: RequestClient } {
  const store = useStore()

  const state = store.getState()
  console.error('process.env.NODE_ENV', process.env.NODE_ENV)

  console.log('testing invariant inside hook')
  warning(state === undefined, 'State is undefined...why?')
  // invariant(state === undefined, 'why no message')
  console.log('done with hook invriant')

  const lookupFunction = (): any => {
    const lookedUp = getRequestById(requestId, store.getState())
    return lookedUp
  }
  const setterFunction = () => {
    console.error('TRIGGERED SETTER FUNCTION, store=', store)
    store.dispatch(setRequest(requestId, initValue as any))
  }

  useInitCheck(lookupFunction, setterFunction, initValue, initDeps)

  const requestClient = new RequestClient(requestId, store)

  return { requestClient }

  // return request
}

export function useInitCheck(
  lookupFunction: any,
  setterFunction: any,
  initValue?: any,
  initDeps?: any[]
) {
  const filterInitRef = useRef<{
    alreadyInitialized: boolean
    prevDeps: any[] | undefined
  }>({
    alreadyInitialized: false,
    prevDeps: undefined
  })

  const isInitialized = filterInitRef.current.alreadyInitialized
  const depsChanged =
    initDeps && initDeps.length > 0 && !shallowEqual(initDeps, filterInitRef.current.prevDeps)

  //FIX: if previously initialized filter has been deleted (i.e. doesnt exist anymore,)
  const filterExist = lookupFunction()

  if (initValue) {
    if (!isInitialized) {
      if (__DEV__) {
        console.log(
          'debug uesInitCheckxasdfsa = X increse object never before inited, lib tester adsfso applying now...='
        )
      }
      setterFunction()
      filterInitRef.current.alreadyInitialized = true
      filterInitRef.current.prevDeps = initDeps
    } else if (depsChanged) {
      if (__DEV__) {
        console.debug(
          'hooks domain object already inited, but dependencies changed - reinitializing. Dependencies array:' +
            JSON.stringify(initDeps)
        )
      }
      // console.error('filter has been initialized, but deps changed, so reupdating')
      setterFunction()
      // client.setFilter(requestId, initValue)
      filterInitRef.current.prevDeps = initDeps
    } else if (!filterExist) {
      // console.error(
      //   'filter has been deleted after previous initialization, willreinitialize now. its upt o client to correctly handle hook usage'
      // )
      setterFunction()
      // client.setFilter(requestId, initValue)
      filterInitRef.current.alreadyInitialized = true
      filterInitRef.current.prevDeps = initDeps
    } else {
      if (__DEV__) {
        console.debug(
          'hooks domain object already inited and no deps specified or changed, not reinitializing'
        )
      }
    }
  }
}
