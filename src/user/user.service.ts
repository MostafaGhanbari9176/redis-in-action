import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

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

  /**
 * return true if user is exists
 * @param email
 */
  async userIsExists(email: string): Promise<boolean> {
    const emailIsExists: object | null = await this.userModel
      .exists({ email: email })
      .exec();

    return emailIsExists !== null;
  }

  async createUser(email: string): Promise<UserDocument> {
    const user = new this.userModel();
    user.email = email;

    return await user.save();
  }
}
