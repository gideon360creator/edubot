import { Schema, model, type Document, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface AssessmentDocument extends Document {
  subjectId: Types.ObjectId;
  name: string;
  maxScore: number;
  weight: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<AssessmentDocument>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 0,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        if (ret.subjectId && ret.subjectId instanceof Types.ObjectId) {
          ret.subjectId = ret.subjectId.toString();
        }
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

AssessmentSchema.index({ subjectId: 1, name: 1 }, { unique: false });

AssessmentSchema.plugin(mongoosePaginate);
AssessmentSchema.plugin(aggregatePaginate);

export const AssessmentModel = model<AssessmentDocument>(
  "Assessment",
  AssessmentSchema,
);
