import invariant from 'tiny-invariant'
import { MainRootState, Filter } from './../types'
import { action } from 'typesafe-actions'
import { RequestData, ResponseData } from '../types'
import fetch from 'isomorphic-unfetch'
import warning from 'tiny-warning'
import { getFilterById } from './reducer'
export const setRequest = (requestId: string, config: RequestData) =>
  action('SET_REQUEST', { requestId, config })

export const setFilter = (requestId: string, filter: Filter) =>
  action('SET_FILTER', { requestId, filter })

export const processResponse = (requestId: string, response: ResponseData) =>
  action('PROCESS_RESPONSE', { requestId, response })

export const execRequest = (requestId: string) => {
  return async (dispatch: any, getState: () => MainRootState) => {
    console.log('now running execute request')
    const state = getState()
    if (__DEV__) {
      console.log('DEV ONLY LOG = starting execution for requestId', requestId)
    } else {
      console.log('PROD ONLY LOG = starting execution for requestId', requestId)
    }
    console.log('exec request state=', JSON.stringify(state))
    warning(
      state.esDsl.requests[requestId] === undefined,
      `WARNING - Invalid request id: ${requestId} - cannot found in state. Nothing to execute...`
    )
    console.log('not this invariant')

    // validateRequestExistsInState(requestId, getState());
    const startResponse: ResponseData = {
      requestId: requestId,
      status: 'EXECUTING'
    }
    dispatch(processResponse(requestId, startResponse))
    try {
      const rootState = getState()

      const url = rootState.esDsl.requests[requestId].url

      console.log('standard console for both: - fetching against url', url)
      if (__DEV__) {
        console.log('dev only, url details:', url)
      }

      const filter = getFilterById('first', 'firstFilter', getState())
      console.log('filter label:', filter ? filter.label : 'nofilter')

      const fetched = await fetch(filter ? url + filter.label : url)
      const response = await fetched.json()
      console.log('Fetched json:', response)

      const successResponse: ResponseData = {
        requestId: requestId,
        status: 'COMPLETED',
        data: response
      }

      dispatch(processResponse(requestId, successResponse))

      // dispatch(execRequest.success(searchResponse))
    } catch (error) {
      const msg = getCleanerErrorMessage(error)

      console.error('FATAL ERROR in execute search:', msg)
      const failedReponse: ResponseData = {
        requestId: requestId,
        status: 'FAILED',
        errorMsg: msg
      }
      dispatch(processResponse(requestId, failedReponse))
      invariant(true, `Force-throwing invariant due to fatal search error with msg ${msg}`)
      //   throw Error(msg);
    }
  }
}

function getCleanerErrorMessage(error: any) {
  let errorMessage

  if (error.response && error.response.data && error.response.data.error) {
    errorMessage = JSON.stringify(error.response.data.error)
  } else {
    errorMessage = 'Error: ' + error.message
    // OTE: Is server accesible over network? Can happen if network request was aborted (i.e. integration test auto-timeout/failed test) or due to CORS issues...'
  }

  return errorMessage
}
