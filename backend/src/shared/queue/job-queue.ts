export type JobHandler<TPayload> = (payload: TPayload) => Promise<void>;

export class InMemoryJobQueue<TPayload> {
  private readonly jobHandlers: Map<string, JobHandler<TPayload>> = new Map();

  public registerHandler(jobType: string, handler: JobHandler<TPayload>): void {
    this.jobHandlers.set(jobType, handler);
  }

  public async dispatch(jobType: string, payload: TPayload): Promise<void> {
    const selectedHandler = this.jobHandlers.get(jobType);

    if (!selectedHandler) {
      throw new Error(`No handler registered for job type: ${jobType}`);
    }

    await selectedHandler(payload);
  }
}
