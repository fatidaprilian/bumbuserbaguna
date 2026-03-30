export interface GeneratePresentationRequestBody {
  documentId: string;
  targetSlideCount: number;
  audienceLevel: "smp" | "sma-smk" | "university";
}

export interface GeneratePresentationResponseBody {
  presentationId: string;
  jobStatus: "queued" | "processing" | "completed";
}
