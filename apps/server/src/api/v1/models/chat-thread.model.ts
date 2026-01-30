import { Schema, model, Document, Types } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IChatThread extends Document {
  userId: Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatThreadSchema = new Schema<IChatThread>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Conversation",
    },
    messages: [
      {
        role: {
          type: String,
          enum: ["user", "assistant"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.messages) {
          ret.messages = ret.messages.map((m: any) => {
            if (m._id) {
              m.id = m._id.toString();
              delete m._id;
            }
            return m;
          });
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const ChatThreadModel = model<IChatThread>(
  "ChatThread",
  ChatThreadSchema,
);
