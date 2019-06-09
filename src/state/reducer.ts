import { produce, Draft } from 'immer'
import invariant from 'tiny-invariant'
import warning from 'tiny-warning'
import { DataState, QueryAction, MainRootState, RequestData, ResponseData, Filter } from '../types'
const initialState: DataState = {
  requests: {},
  responses: {}
}
export default function(state: DataState = initialState, action: QueryAction) {
  if (__DEV__) {
    console.log('Testing usage of DEV__ only, processing action:', JSON.stringify(action))
  }

  return produce(state, draft => {
    switch (action.type) {
      case 'SET_REQUEST': {
        const { requestId, config } = action.payload

        // if first time adding this request, create it
        console.log(
          'below should be a dev-only warning invariant about first-ever request creation'
        )
        warning(
          draft.requests[requestId],
          `Variant warning test - first ever trying to create request for id=${requestId}`
        )

        if (!draft.requests[requestId]) {
          draft.requests[requestId] = {} as any
        }
        draft.requests[requestId] = config

        return
      }
      case 'SET_FILTER': {
        const { requestId, filter } = action.payload
        validateRequestExistsInDraft(requestId, draft)

        // create filters root if none existed yet
        if (!draft.requests[requestId].filters) {
          draft.requests[requestId].filters = {}
        }

        invariant(
          filter.id !== 'special_id',
          `Throwing on purposes via invariant for filter ${filter.id}`
        )

        draft.requests[requestId].filters![filter.id] = filter
        return
      }

      case 'PROCESS_RESPONSE': {
        const { requestId, response } = action.payload
        validateRequestExistsInDraft(requestId, draft)

        draft.responses[requestId] = response
        return
      }

      default:
        return
    }
  })
}
export function validateRequestExistsInDraft(requestId: string, draft: Draft<DataState>) {
  invariant(
    draft.requests[requestId] !== undefined,
    `Trying to modify non-existing request with requestId = ${requestId}. Did you forget to initialize request first?`
  )
}

export function validateRequestExistsInState(requestId: string, state: MainRootState) {
  invariant(
    state.esDsl.requests[requestId] !== undefined,
    `Invalid request id: ${requestId} - cannot found in state`
  )
}

export const getRequestById = (requestId: string, state: MainRootState): RequestData => {
  return state.esDsl.requests[requestId]
}
export const getResponseById = (requestId: string, state: MainRootState): ResponseData => {
  return state.esDsl.responses[requestId]
}
export const getFilterById = (
  requestId: string,
  filterId: string,
  state: MainRootState
): Filter | undefined => {
  const filter =
    getRequestById(requestId, state) && getRequestById(requestId, state).filters
      ? getRequestById(requestId, state).filters![filterId]
      : undefined
  return filter
}
