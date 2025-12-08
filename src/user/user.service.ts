import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
    private readonly redis: RedisService,
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
    user.username = await this.getNewUserName(email);

    await user.save();

    this.redis.unlock(user.username);

    return user;
  }

  private async getNewUserName(email: string, counter:number = 1): Promise<string> {
    const username = await this.generateUsername(counter);
    const free = await this.redis.lock(username);
    if (!free) {
      return await this.getNewUserName(email, counter + 1);
    }

    return username;
  }

  private async generateUsername(counter:number): Promise<string> {
    const userCount = await this.userModel.countDocuments();

    return `user${userCount + counter}`;
  }

  async getUserIdByEmail(email: string):Promise<string> {
    const user = await this.userModel.findOne({email:email}, {id:1}).exec()
    
    if(!user){
      throw new InternalServerErrorException("something is go wrong!")
    }

    return user.id.toString()
  }

}
