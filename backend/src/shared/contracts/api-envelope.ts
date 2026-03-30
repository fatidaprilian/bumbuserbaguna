export interface ApiSuccessEnvelope<TPayload> {
  success: true;
  traceId: string;
  payload: TPayload;
}

export interface ApiErrorEnvelope {
  success: false;
  traceId: string;
  error: {
    code: string;
    message: string;
  };
}
