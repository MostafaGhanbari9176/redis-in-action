import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { UserModel } from 'src/decorator/user.decorator';
import { UserDocument } from './schema/user.schema';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Patch('')
  async updateUser(
    @UserModel() user: UserDocument,
    @Body() updateUserDto: UpdateUserDto
  ) {
    await this.userService.updateUser(user, updateUserDto);

    return {
      success: true,
      message: "user updated successfully"
    }
  }
}



