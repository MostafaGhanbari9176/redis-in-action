import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Request, Response } from 'express';
import { CredentialDTO } from './dto/credential.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async signUp(email: string) {
    const emailIsFree = await this.userService.emailIsFree(email);

    if (!emailIsFree) {
      throw new BadRequestException('Email is already in use');
    }

    this.generateAndStoreOTP(email, "sign-up")
  }

  confirmSignUp(credential: CredentialDTO, response: Response): Promise<{ token: string }> {
    const otpIsValid = this.otpValidation(credential, "sign-up")

    if (!otpIsValid) {
      throw new BadRequestException("otp is not valid, or expired")
    }

    this.userService.createUser(credential.email)

    return this.getTokenResponse(credential.email, response)
  }

  async signIn(email: string) {
    const user = await this.userService.userIsExists(email);

    if (!user) {
      throw new BadRequestException('user not exists');
    }

    this.generateAndStoreOTP(email, "sign-in")
  }

  confirmSignIn(credential: CredentialDTO, response: Response): Promise<{ token: string }> {
    const otpIsValid = this.otpValidation(credential, "sign-in")

    if (!otpIsValid) {
      throw new BadRequestException("otp is not valid, or expired")
    }

    return this.getTokenResponse(credential.email, response)
  }

  refresh(request: Request, response: Response) {
    const refreshToken = request.cookies['RefreshToken'];
  }

  private otpValidation(credential: CredentialDTO, route: string): boolean {
    // validate otp through redis
    return true;
  }

  private generateAndStoreOTP(email: string, route: string) {
    const code = this.generateOTP()

    this.sendOTP(email, code)

    //store OTP in redis with expiration time
  }

  private sendOTP(email: string, code: string) {
    console.dir({ email, code })

    return code
  }

  private generateOTP(): string {
    return Date.now().toString().substring(7)
  }

  private async getTokenResponse(email: string, response: Response): Promise<{ token: string }> {
    const { accessToken, refreshToken } = await this.createTokens(email);

    response.cookie('RefreshToken', refreshToken, {
      httpOnly: true,
      path: 'account/refresh',
    });

    return {
      token: accessToken,
    };
  }

  private async createTokens(
    email: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.jwtService.signAsync(
      { email: email },
      {
        expiresIn: '1d',
        secret: 'ACCESS_SECRET',
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { email: email },
      {
        expiresIn: '30d',
        secret: 'REFRESH_SECRET',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
