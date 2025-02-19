/* eslint-disable no-param-reassign */
import { createReducer } from '@reduxjs/toolkit'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GlobalState {}

export const initialState: GlobalState = {}

export default createReducer(initialState, (builder) => builder)
