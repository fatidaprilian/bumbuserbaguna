import { ZodError, type ZodSchema } from "zod";

import { ApplicationError } from "../errors/application-error";

export function parseBoundaryInput<TParsedInput>(
  schema: ZodSchema<TParsedInput>,
  incomingPayload: unknown,
): TParsedInput {
  try {
    return schema.parse(incomingPayload);
  } catch (error) {
    if (error instanceof ZodError) {
      const firstIssue = error.issues[0];
      const issuePath = firstIssue ? firstIssue.path.join(".") : "request";
      const issueMessage = firstIssue ? firstIssue.message : "Invalid request payload";
      throw new ApplicationError("VALIDATION_ERROR", `${issuePath}: ${issueMessage}`);
    }

    throw error;
  }
}
