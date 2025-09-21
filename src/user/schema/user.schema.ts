import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserDocument extends Document<Types.ObjectId> {
  declare id: string;

  @Prop({ type: String, required: false })
  name: string;

  @Prop({ type: String, required: false })
  family: string;

  @Prop({ type: String, required: false })
  bio: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  createdAt!: Date;

  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

UserSchema.virtual('id').get(function (this: UserDocument) {
  return this._id.toString();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });
