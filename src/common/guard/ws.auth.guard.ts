import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class WSAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const req = client._socket?.parser?.incoming;

    const token = req?.headers?.authorization;

    if (!token) {
      throw new UnauthorizedException();
    }

    const payload = this.jwtService.verify(token.replace('Bearer ', ''));

    client.user = { id: payload.id };

    return true;
  }
}


