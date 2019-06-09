import { Store } from 'redux'
import { Filter, RequestData, MainRootState } from './../types'
import { execRequest, setFilter, setRequest } from './actions'

export class RequestClient {
  constructor(public requestId: string, public store: Store) {
    this.requestId = requestId
    this.store = store
  }

  initNewRequest(config: RequestData) {
    this.store.dispatch(setRequest(this.requestId, config))
  }

  setFilter<T extends Filter>(filter: T) {
    this.store.dispatch(setFilter(this.requestId, filter))
  }

  execute() {
    console.log('in client class about to execute for request id:', this.requestId)
    this.store.dispatch<any>(execRequest(this.requestId))
  }

  getState(): MainRootState {
    return this.store.getState()
  }
}
