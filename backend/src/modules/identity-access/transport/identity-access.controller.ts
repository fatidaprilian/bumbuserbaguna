import type { FastifyInstance } from "fastify";
import type { ApiSuccessEnvelope } from "../../../shared/contracts/api-envelope.ts";
import {
  loginUserSchema,
  refreshTokenSchema,
  registerUserSchema,
} from "../../../shared/validation/identity-access.schema.ts";
import { parseBoundaryInput } from "../../../shared/validation/validate-input.ts";
import type { IdentityAccessService } from "../service/identity-access.service.ts";
import type {
  RegisterResponseBody,
  TokenResponseBody,
} from "./identity-access.controller-contract.ts";

// ---------------------------------------------------------------------------
// JWT payload interface — matches the shape signed into and verified from tokens
// ---------------------------------------------------------------------------

export interface JwtTokenPayload {
  sub: string; // userId
  tenantId: string; // institutionId
  email: string;
  role: string;
}

export class IdentityAccessController {
  constructor(private readonly identityAccessService: IdentityAccessService) {}

  /**
   * Registers the auth routes on a Fastify instance.
   * Called once from the route registry during server bootstrap.
   */
  public registerRoutes(fastifyInstance: FastifyInstance): void {
    fastifyInstance.post("/v1/auth/register", async (request, reply) => {
      const requestBody = parseBoundaryInput(registerUserSchema, request.body);

      const tokenPair = await this.identityAccessService.registerUser({
        institutionId: requestBody.institutionId,
        emailAddress: requestBody.emailAddress,
        fullName: requestBody.fullName,
        roleCode: requestBody.roleCode,
        plainTextPassword: requestBody.password,
      });

      const jwtPayload: JwtTokenPayload = {
        sub: tokenPair.userId,
        tenantId: tokenPair.institutionId,
        email: tokenPair.emailAddress,
        role: tokenPair.roleCode,
      };

      const accessToken = fastifyInstance.jwt.sign(jwtPayload, { expiresIn: "15m" });
      const refreshToken = fastifyInstance.jwt.sign(
        { sub: tokenPair.userId, tenantId: tokenPair.institutionId, type: "refresh" },
        { expiresIn: "30d" },
      );

      const responsePayload: RegisterResponseBody = {
        accessToken,
        refreshToken,
        userId: tokenPair.userId,
        roleCode: tokenPair.roleCode,
      };

      const envelope: ApiSuccessEnvelope<RegisterResponseBody> = {
        success: true,
        traceId: request.id,
        payload: responsePayload,
      };

      return reply.status(201).send(envelope);
    });

    fastifyInstance.post("/v1/auth/login", async (request, reply) => {
      const requestBody = parseBoundaryInput(loginUserSchema, request.body);

      const tokenPair = await this.identityAccessService.loginUser({
        institutionId: requestBody.institutionId,
        emailAddress: requestBody.emailAddress,
        plainTextPassword: requestBody.password,
      });

      const jwtPayload: JwtTokenPayload = {
        sub: tokenPair.userId,
        tenantId: tokenPair.institutionId,
        email: tokenPair.emailAddress,
        role: tokenPair.roleCode,
      };

      const accessToken = fastifyInstance.jwt.sign(jwtPayload, { expiresIn: "15m" });
      const refreshToken = fastifyInstance.jwt.sign(
        { sub: tokenPair.userId, tenantId: tokenPair.institutionId, type: "refresh" },
        { expiresIn: "30d" },
      );

      const responseBody: TokenResponseBody = {
        accessToken,
        refreshToken,
        userId: tokenPair.userId,
        roleCode: tokenPair.roleCode,
      };

      const envelope: ApiSuccessEnvelope<TokenResponseBody> = {
        success: true,
        traceId: request.id,
        payload: responseBody,
      };

      return reply.status(200).send(envelope);
    });

    fastifyInstance.post("/v1/auth/refresh", async (request, reply) => {
      const requestBody = parseBoundaryInput(refreshTokenSchema, request.body);

      let decodedToken: { sub: string; tenantId: string; type: string };

      try {
        decodedToken = fastifyInstance.jwt.verify<{
          sub: string;
          tenantId: string;
          type: string;
        }>(requestBody.refreshToken);
      } catch {
        return reply.status(401).send({
          success: false,
          traceId: request.id,
          error: { code: "UNAUTHORIZED", message: "Invalid or expired refresh token." },
        });
      }

      if (decodedToken.type !== "refresh") {
        return reply.status(401).send({
          success: false,
          traceId: request.id,
          error: { code: "UNAUTHORIZED", message: "Token type mismatch." },
        });
      }

      const newAccessToken = fastifyInstance.jwt.sign(
        { sub: decodedToken.sub, tenantId: decodedToken.tenantId },
        { expiresIn: "15m" },
      );

      return reply.status(200).send({
        success: true,
        traceId: request.id,
        payload: { accessToken: newAccessToken },
      });
    });
  }
}
