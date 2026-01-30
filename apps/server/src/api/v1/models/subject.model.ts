import { Schema, model, type Document, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface SubjectDocument extends Document {
  lecturerId: Types.ObjectId;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<SubjectDocument>(
  {
    lecturerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
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
        ret.lecturerId = ret.lecturerId?.toString();
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

SubjectSchema.index({ lecturerId: 1, code: 1 }, { unique: true });

SubjectSchema.plugin(mongoosePaginate);
SubjectSchema.plugin(aggregatePaginate);

export const SubjectModel = model<SubjectDocument>("Subject", SubjectSchema);
