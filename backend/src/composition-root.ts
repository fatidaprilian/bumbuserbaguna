import { DocumentIngestionController } from "./modules/document-ingestion/transport/document-ingestion.controller.ts";
import { PostgresqlDocumentIngestionRepository } from "./modules/document-ingestion/repository/document-ingestion.postgresql.repository.ts";
import { DocumentIngestionService } from "./modules/document-ingestion/service/document-ingestion.service.ts";
import { IdentityAccessController } from "./modules/identity-access/transport/identity-access.controller.ts";
import { PostgresqlIdentityAccessRepository } from "./modules/identity-access/repository/identity-access.postgresql.repository.ts";
import { IdentityAccessService } from "./modules/identity-access/service/identity-access.service.ts";
import { PlagiarismAnalysisController } from "./modules/plagiarism-analysis/transport/plagiarism-analysis.controller.ts";
import { PostgresqlPlagiarismAnalysisRepository } from "./modules/plagiarism-analysis/repository/plagiarism-analysis.postgresql.repository.ts";
import { PlagiarismAnalysisService } from "./modules/plagiarism-analysis/service/plagiarism-analysis.service.ts";
import { PresentationGenerationController } from "./modules/presentation-generation/transport/presentation-generation.controller.ts";
import { PostgresqlPresentationGenerationRepository } from "./modules/presentation-generation/repository/presentation-generation.postgresql.repository.ts";
import { PresentationGenerationService } from "./modules/presentation-generation/service/presentation-generation.service.ts";
import { PostgresqlReportStructuringRepository } from "./modules/report-structuring/repository/report-structuring.postgresql.repository.ts";
import { ReportStructuringService } from "./modules/report-structuring/service/report-structuring.service.ts";
import { ReportStructuringController } from "./modules/report-structuring/transport/report-structuring.controller.ts";
import { createPostgresqlClient } from "./shared/database/postgresql-client.ts";
import { InMemoryJobQueue } from "./shared/queue/job-queue.ts";
import { PlagiarismAnalysisWorker, type PlagiarismWorkerPayload } from "./workers/plagiarism-analysis.worker.ts";
import {
  PresentationGenerationWorker,
  type PresentationWorkerPayload,
} from "./workers/presentation-generation.worker.ts";

export interface BackendRuntime {
  identityAccessController: IdentityAccessController;
  documentIngestionController: DocumentIngestionController;
  plagiarismAnalysisController: PlagiarismAnalysisController;
  reportStructuringController: ReportStructuringController;
  presentationGenerationController: PresentationGenerationController;
  plagiarismQueue: InMemoryJobQueue<PlagiarismWorkerPayload>;
  presentationQueue: InMemoryJobQueue<PresentationWorkerPayload>;
}

export function createBackendRuntime(databaseConnectionString: string): BackendRuntime {
  const databaseClient = createPostgresqlClient(databaseConnectionString);

  // Repositories
  const identityAccessRepository = new PostgresqlIdentityAccessRepository(databaseClient);
  const documentIngestionRepository = new PostgresqlDocumentIngestionRepository(databaseClient);
  const plagiarismAnalysisRepository = new PostgresqlPlagiarismAnalysisRepository(databaseClient);
  const reportStructuringRepository = new PostgresqlReportStructuringRepository(databaseClient);
  const presentationGenerationRepository = new PostgresqlPresentationGenerationRepository(databaseClient);

  // Services
  const identityAccessService = new IdentityAccessService(identityAccessRepository);
  const documentIngestionService = new DocumentIngestionService(documentIngestionRepository);
  const plagiarismAnalysisService = new PlagiarismAnalysisService(plagiarismAnalysisRepository);
  const reportStructuringService = new ReportStructuringService(reportStructuringRepository);
  const presentationGenerationService = new PresentationGenerationService(
    presentationGenerationRepository,
  );

  // Workers + Queues
  const plagiarismWorker = new PlagiarismAnalysisWorker(plagiarismAnalysisService);
  const presentationWorker = new PresentationGenerationWorker(presentationGenerationService);

  const plagiarismQueue = new InMemoryJobQueue<PlagiarismWorkerPayload>();
  plagiarismQueue.registerHandler("plagiarism.run", (workerPayload) =>
    plagiarismWorker.processJob(workerPayload),
  );

  const presentationQueue = new InMemoryJobQueue<PresentationWorkerPayload>();
  presentationQueue.registerHandler("presentation.generate", (workerPayload) =>
    presentationWorker.processJob(workerPayload),
  );

  return {
    identityAccessController: new IdentityAccessController(identityAccessService),
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
