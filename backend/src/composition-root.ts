import { DocumentIngestionController } from "./modules/document-ingestion/transport/document-ingestion.controller";
import { PostgresqlDocumentIngestionRepository } from "./modules/document-ingestion/repository/document-ingestion.postgresql.repository";
import { DocumentIngestionService } from "./modules/document-ingestion/service/document-ingestion.service";
import { PlagiarismAnalysisController } from "./modules/plagiarism-analysis/transport/plagiarism-analysis.controller";
import { PostgresqlPlagiarismAnalysisRepository } from "./modules/plagiarism-analysis/repository/plagiarism-analysis.postgresql.repository";
import { PlagiarismAnalysisService } from "./modules/plagiarism-analysis/service/plagiarism-analysis.service";
import { PresentationGenerationController } from "./modules/presentation-generation/transport/presentation-generation.controller";
import { PostgresqlPresentationGenerationRepository } from "./modules/presentation-generation/repository/presentation-generation.postgresql.repository";
import { PresentationGenerationService } from "./modules/presentation-generation/service/presentation-generation.service";
import { PostgresqlReportStructuringRepository } from "./modules/report-structuring/repository/report-structuring.postgresql.repository";
import { ReportStructuringService } from "./modules/report-structuring/service/report-structuring.service";
import { ReportStructuringController } from "./modules/report-structuring/transport/report-structuring.controller";
import { createPostgresqlClient } from "./shared/database/postgresql-client";
import { InMemoryJobQueue } from "./shared/queue/job-queue";
import { PlagiarismAnalysisWorker, type PlagiarismWorkerPayload } from "./workers/plagiarism-analysis.worker";
import {
  PresentationGenerationWorker,
  type PresentationWorkerPayload,
} from "./workers/presentation-generation.worker";

export interface BackendRuntime {
  documentIngestionController: DocumentIngestionController;
  plagiarismAnalysisController: PlagiarismAnalysisController;
  reportStructuringController: ReportStructuringController;
  presentationGenerationController: PresentationGenerationController;
  plagiarismQueue: InMemoryJobQueue<PlagiarismWorkerPayload>;
  presentationQueue: InMemoryJobQueue<PresentationWorkerPayload>;
}

export function createBackendRuntime(databaseConnectionString: string): BackendRuntime {
  const databaseClient = createPostgresqlClient(databaseConnectionString);

  const documentIngestionRepository = new PostgresqlDocumentIngestionRepository(databaseClient);
  const plagiarismAnalysisRepository = new PostgresqlPlagiarismAnalysisRepository(databaseClient);
  const reportStructuringRepository = new PostgresqlReportStructuringRepository(databaseClient);
  const presentationGenerationRepository = new PostgresqlPresentationGenerationRepository(databaseClient);

  const documentIngestionService = new DocumentIngestionService(documentIngestionRepository);
  const plagiarismAnalysisService = new PlagiarismAnalysisService(plagiarismAnalysisRepository);
  const reportStructuringService = new ReportStructuringService(reportStructuringRepository);
  const presentationGenerationService = new PresentationGenerationService(
    presentationGenerationRepository,
  );

  const plagiarismWorker = new PlagiarismAnalysisWorker(plagiarismAnalysisService);
  const presentationWorker = new PresentationGenerationWorker(presentationGenerationService);

  const plagiarismQueue = new InMemoryJobQueue<PlagiarismWorkerPayload>();
  plagiarismQueue.registerHandler("plagiarism.run", (payload) => plagiarismWorker.processJob(payload));

  const presentationQueue = new InMemoryJobQueue<PresentationWorkerPayload>();
  presentationQueue.registerHandler("presentation.generate", (payload) =>
    presentationWorker.processJob(payload),
  );

  return {
    documentIngestionController: new DocumentIngestionController(documentIngestionService),
    plagiarismAnalysisController: new PlagiarismAnalysisController(plagiarismAnalysisService),
    reportStructuringController: new ReportStructuringController(reportStructuringService),
    presentationGenerationController: new PresentationGenerationController(
      presentationGenerationService,
    ),
    plagiarismQueue,
    presentationQueue,
  };
}
