import { Schema, model, type Document, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface GradeDocument extends Document {
  studentId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  studentNumber: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<GradeDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assessment",
      required: true,
      index: true,
    },
    studentNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id?.toString();
        if (ret.studentId && ret.studentId instanceof Types.ObjectId) {
          ret.studentId = ret.studentId.toString();
        }
        if (ret.assessmentId && ret.assessmentId instanceof Types.ObjectId) {
          ret.assessmentId = ret.assessmentId.toString();
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

GradeSchema.index({ assessmentId: 1, studentId: 1 });

GradeSchema.plugin(mongoosePaginate);
GradeSchema.plugin(aggregatePaginate);

export const GradeModel = model<GradeDocument>("Grade", GradeSchema);
