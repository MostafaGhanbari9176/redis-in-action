import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { UserDocument } from 'src/user/schema/user.schema';

/**
 * Holds the singleton mongoose connection provided during app bootstrap.
 * Initialized once via `registerUserDecoratorDb`.
 */
let connection: Connection | null = null;

export const registerUserDecoratorDb = (conn: Connection) => {
  connection = conn;
};

/**
 * Resolves the authenticated user document using the id injected by AuthGuard.
 *
 * Usage:
 *  - Ensure `registerUserDecoratorDb` is called in your root module constructor.
 *  - Use `@UserModel()` in route handlers to access the current user document.
 */
export const UserModel = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext): Promise<UserDocument> => {
    const request = ctx.switchToHttp().getRequest<{ user?: { id?: string } }>();

    if (!request.user?.id) {
      throw new UnauthorizedException('User payload is missing on request');
    }

    if (!connection) {
      throw new Error('User decorator not initialized; call registerUserDecoratorDb');
    }

    const user = await connection
      .model<UserDocument>(UserDocument.name)
      .findById(request.user.id)
      .exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  },
);

