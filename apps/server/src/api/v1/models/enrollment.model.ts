import { Schema, model, type Document, type Types } from "mongoose";

export interface EnrollmentDocument extends Document {
  userId: Types.ObjectId;
  subjectId: Types.ObjectId;
  lecturerId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<EnrollmentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    lecturerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
  },
);

// Ensure a student can only enroll in a subject once
EnrollmentSchema.index({ userId: 1, subjectId: 1 }, { unique: true });

export const EnrollmentModel = model<EnrollmentDocument>(
  "Enrollment",
  EnrollmentSchema,
);
