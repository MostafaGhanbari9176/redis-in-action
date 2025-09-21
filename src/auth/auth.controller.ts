import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialDTO } from './dto/credential.dto';
import { Request, Response } from 'express';

@Controller('account')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('sign-up')
  signUp(@Body('email') email: string) {
    return this.authService.signUp(email);
  }

  @Post('sign-up/confirm')
  confirmSignUp(@Body() credential: CredentialDTO,
    @Res({ passthrough: true }) response: Response) {
    return this.authService.confirmSignUp(credential, response);
  }

  @Post('sign-in')
  signIn(@Body('email') email: string) {
    return this.authService.signIn(email);
  }

  @Post('sign-in')
  confirmSignIn(
    @Body() data: CredentialDTO,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.confirmSignIn(data, response);
  }

  @Post('refresh')
  refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.refresh(request, response);
  }
}
