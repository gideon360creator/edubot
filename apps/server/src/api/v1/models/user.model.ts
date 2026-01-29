import { Schema, model, type Document } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export type UserRole = "student" | "lecturer";

export interface UserDocument extends Document {
  id: string;
  username: string;
  fullName: string;
  hashedPassword: string;
  role: UserRole;
  studentNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "lecturer"],
      required: true,
      index: true,
    },
    studentNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
    },
  },
);

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(aggregatePaginate);

export const UserModel = model<UserDocument>("User", UserSchema);
