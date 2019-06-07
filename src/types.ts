import { ActionType } from 'typesafe-actions'
import * as queryActions from './state/actions'

export interface Filter {
  id: string
  label?: string
  enabled: boolean
  multiInput?: any
}

export interface DataState {
  requests: { [key: string]: RequestData }
  responses: { [key: string]: any }
}
export interface MainRootState {
  esDsl: DataState
}
export interface RequestData {
  requestId: string
  url: string
  filters?: { [key: string]: Filter }
}
export interface ResponseData {
  requestId: string
  status: 'EXECUTING' | 'FAILED' | 'COMPLETED'
  data?: any
  errorMsg?: any
}
export type QueryAction = ActionType<typeof queryActions>
