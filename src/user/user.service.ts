import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { CredentialDTO } from '../auth/dto/credential.dto';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * checking if email is already in use or not
   * @param email
   */
  async emailIsFree(email: string): Promise<boolean> {
    const emailIsExists: object | null = await this.userModel
      .exists({ email: email })
      .exec();

    return emailIsExists === null;
  }

  async createUser(data: CredentialDTO): Promise<UserDocument> {
    const user = new this.userModel();
    user.email = data.email;
    user.passHash = await hash(data.password, 12);

    return await user.save();
  }

  async getUserCredential(email: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ email: email }, { _id: 0, email: 1, passHash: 1 })
      .exec();

    if (!user) {
      throw new NotFoundException('User not exists');
    }

    return user;
  }
}
