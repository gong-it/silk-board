interface ReferenceDataUpdated {
  base: number
  quote: number
}

interface ReferenceDataRequestID {
  base: number
  quote: number
}

export interface ReferenceData {
  pair: string
  rate: number
  updatedAt: ReferenceDataUpdated
  requestID: ReferenceDataRequestID
}
