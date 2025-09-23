import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Request, Response } from 'express';
import { CredentialDTO } from './dto/credential.dto';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redis: RedisService
  ) { }

  otpRedisKey = (email: string) => `otp:email:${email}`

  async signUp(email: string) {
    const emailIsFree = await this.userService.emailIsFree(email);

    if (!emailIsFree) {
      throw new BadRequestException('Email is already in use');
    }

    await this.generateAndSendOTP(email)
  }

  async confirmSignUp(credential: CredentialDTO, response: Response): Promise<{ token: string }> {
    const otpIsValid = await this.otpValidation(credential)

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

    await this.generateAndSendOTP(email)
  }

  async confirmSignIn(credential: CredentialDTO, response: Response): Promise<{ token: string }> {
    const otpIsValid = await this.otpValidation(credential)

    if (!otpIsValid) {
      throw new BadRequestException("otp is not valid, or expired")
    }

    return this.getTokenResponse(credential.email, response)
  }

  refresh(request: Request, response: Response) {
    const refreshToken = request.cookies['RefreshToken'];
  }

  private async otpValidation(credential: CredentialDTO): Promise<boolean> {
    const otp = await this.redis.get(this.otpRedisKey(credential.email))

    if (!otp) {
      throw new BadRequestException('otp is expired')
    }

    return otp === credential.otp;
  }

  private async generateAndSendOTP(email: string) {
    const code = this.generateOTP()

    const result = await this.redis.setNX(this.otpRedisKey(email), code, 30/* in second */)

    if(!result){
      throw new BadRequestException('the otp already sent, please try 30 second later!')
    }

    this.sendOTP(email, code)
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
