import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { RedisService } from 'src/redis/redis.service';
import { UpdateUserDto } from './dto/user.dto';
import { UserNameService } from './username.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
    private readonly redis: RedisService,
    private readonly userNameService: UserNameService,
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
    user.username = await this.userNameService.getNewUserName(email);

    await user.save();

    this.redis.unlock(user.username);
    this.userNameService.updateUserNameLookup(user.username)

    return user;
  }

  async getUserIdByEmail(email: string): Promise<string> {
    const user = await this.userModel.findOne({ email: email }, { id: 1 }).exec()

    if (!user) {
      throw new InternalServerErrorException("something is go wrong!")
    }

    return user.id.toString()
  }

  async updateUser(user: UserDocument, newData: UpdateUserDto) {
    if (newData.username) {
      await this.userNameService.checkAndLockUserName(newData.username)
    }

    await user.updateOne(newData)

    if (newData.username) {
      this.userNameService.updateUserNameLookup(newData.username)
      this.redis.unlock(newData.username)
    }
  }

}
