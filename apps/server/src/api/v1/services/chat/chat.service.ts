import Groq from "groq-sdk";
import { env } from "@/api/v1/utils/env";
import { CustomError } from "@/api/v1/utils";
import { SubjectModel } from "@/api/v1/models/subject.model";
import { AssessmentModel } from "@/api/v1/models/assessment.model";
import { GradeModel } from "@/api/v1/models/grade.model";
import { UserModel } from "@/api/v1/models/user.model";
import { EnrollmentModel } from "@/api/v1/models/enrollment.model";
import { ChatThreadModel } from "@/api/v1/models/chat-thread.model";
import GradesService from "@/api/v1/services/grades/grades.service";

type ChatUser = {
  id: string;
  username: string;
  role: string;
  studentNumber?: string | null;
};

type ChatContext = {
  userSummary: string;
  gpaSummary?: string;
  subjects: string[];
  assessments: string[];
  grades: string[];
  students?: string[];
  recentGrades?: string[];
  role: string;
};

const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

class ChatServiceImpl {
  private client: Groq;

  constructor() {
    if (!env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }
    this.client = new Groq({ apiKey: env.GROQ_API_KEY });
  }

  private truncate(list: string[], max: number) {
    if (list.length <= max) return list;
    const sliced = list.slice(0, max);
    sliced.push(`…and ${list.length - max} more`);
    return sliced;
  }

  private async buildContext(user: ChatUser): Promise<ChatContext> {
    let subjects;
    let assessments;

    if (user.role === "lecturer") {
      subjects = await SubjectModel.find({ lecturerId: user.id }).sort({
        name: 1,
      });
      const subjectIds = subjects.map((s) => s._id);
      assessments = await AssessmentModel.find({
        subjectId: { $in: subjectIds },
      }).sort({ createdAt: -1 });
    } else {
      const enrollments = await EnrollmentModel.find({ userId: user.id });
      const subjectIds = enrollments.map((e) => e.subjectId);
      subjects = await SubjectModel.find({ _id: { $in: subjectIds } }).sort({
        name: 1,
      });
      assessments = await AssessmentModel.find({
        subjectId: { $in: subjectIds },
      }).sort({ createdAt: -1 });
    }

    const subjectMap = new Map(
      subjects.map((s) => [s._id.toString(), s.toJSON() as any]),
    );

    const subjectSummaries = subjects.map((s) => {
      const json = s.toJSON() as any;
      return `${json.code || json.name}: ${json.name}`;
    });

    const assessmentSummaries = await Promise.all(
      assessments.map(async (a) => {
        const json = a.toJSON() as any;
        const subject = subjectMap.get(json.subjectId);
        const subjectLabel =
          subject?.code || subject?.name || "Unknown subject";
        const gradeCount = await GradeModel.countDocuments({
          assessmentId: a._id,
        });
        return `${subjectLabel} — ${json.name} (weight ${json.weight}%, max ${json.maxScore}, ${gradeCount} grades recorded)`;
      }),
    );

    let gradeSummaries: string[] = [];
    let gpaSummary: string | undefined;
    const userSummaryParts = [`User: ${user.username}`, `Role: ${user.role}`];
    if (user.studentNumber) {
      userSummaryParts.push(`Student number: ${user.studentNumber}`);
    }

    if (user.role === "student") {
      const studentNumber = user.studentNumber || user.username;
      const grades = await GradeModel.find({
        studentNumber,
      }).sort({ createdAt: -1 });

      const gpa = await GradesService.computeGpa(studentNumber);
      gpaSummary = `GPA ${gpa.gpa.toFixed(2)} | ${gpa.percentage.toFixed(
        1,
      )}% across ${gpa.graded_assessments} assessments (recorded weight ${
        gpa.recorded_weight
      }%)`;

      const assessmentMap = new Map(
        assessments.map((a) => [a._id.toString(), a.toJSON() as any]),
      );

      gradeSummaries = grades.map((g) => {
        const json = g.toJSON() as any;
        const assessment = assessmentMap.get(json.assessmentId);
        const subject = subjectMap.get(assessment?.subjectId);
        const subjectLabel = subject?.code || subject?.name || "Subject";
        const assessmentLabel = assessment?.name || "Assessment";
        return `${subjectLabel} — ${assessmentLabel}: ${json.score}/${
          assessment?.maxScore ?? "?"
        } (weight ${assessment?.weight ?? 0}%)`;
      });
    } else {
      const totalLecturerGrades = await GradeModel.countDocuments({
        lecturerId: user.id,
      });
      gpaSummary = `Role: ${user.role}. Total subjects: ${subjects.length}. Total assessments: ${assessments.length}. Recorded grades (your subjects): ${totalLecturerGrades}.`;

      // Filter students to only those enrolled in this lecturer's subjects
      const enrollments = await EnrollmentModel.find({ lecturerId: user.id });
      const enrolledStudentIds = [
        ...new Set(enrollments.map((e) => e.userId.toString())),
      ];
      const students = await UserModel.find({
        _id: { $in: enrolledStudentIds },
        role: "student",
      })
        .select("fullName username studentNumber")
        .sort({ fullName: 1 });

      const studentSummaries = students.map((s) => {
        const json = s.toJSON() as any;
        return `${json.fullName} (${json.studentNumber || json.username})`;
      });

      // Recent grades across all students for the lecturer's OWN assessments only.
      const assessmentIds = assessments.map((a) => a._id);
      const recent = await GradeModel.find({
        assessmentId: { $in: assessmentIds },
      }).sort({ createdAt: -1 });
      // .limit(32);
      const assessmentMap = new Map(
        assessments.map((a) => [a._id.toString(), a.toJSON() as any]),
      );
      const recentSummaries = recent.map((g) => {
        const json = g.toJSON() as any;
        const assessment = assessmentMap.get(json.assessmentId);
        const subject = subjectMap.get(assessment?.subjectId);
        const subjectLabel = subject?.code || subject?.name || "Subject";
        const assessmentLabel = assessment?.name || "Assessment";
        const studentLabel = json.studentNumber || "Student";
        return `${studentLabel} — ${subjectLabel} / ${assessmentLabel}: ${
          json.score
        }/${assessment?.maxScore ?? "?"} (weight ${assessment?.weight ?? 0}%)`;
      });

      return {
        userSummary: userSummaryParts.join(" | "),
        gpaSummary,
        subjects: this.truncate(subjectSummaries, 24),
        assessments: this.truncate(assessmentSummaries, 32),
        grades: [],
        students: this.truncate(studentSummaries, 40),
        recentGrades: this.truncate(recentSummaries, 32),
        role: user.role,
      };
    }

    return {
      userSummary: userSummaryParts.join(" | "),
      gpaSummary,
      subjects: this.truncate(subjectSummaries, 24),
      assessments: this.truncate(assessmentSummaries, 32),
      grades: this.truncate(gradeSummaries, 32),
      role: user.role,
    };
  }

  private async generateTitle(message: string): Promise<string> {
    try {
      const completion = await this.client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "Generate a very short, concise title (max 5 words) for a chat conversation based on the first user message provided. Do not use quotes, periods, or prefixes like 'Title:'. Just the words.",
          },
          { role: "user", content: message },
        ],
        temperature: 0.5,
        max_tokens: 20,
      });
      return completion.choices?.[0]?.message?.content?.trim() || "New Chat";
    } catch (err) {
      return "New Chat";
    }
  }

  private buildSystemPrompt(context: ChatContext, history: string[] = []) {
    const sections = [
      "You are a student performance assistant. Answer concisely, in markdown, with actionable next steps.",
      `User profile: ${context.userSummary}`,
    ];

    if (history.length > 0) {
      sections.push("", "Recent conversation history:", ...history, "");
    }

    if (context.gpaSummary) sections.push(`GPA/Stats: ${context.gpaSummary}`);
    if (context.subjects.length) {
      sections.push(`Subjects: ${context.subjects.join("; ")}`);
    }
    if (context.assessments.length) {
      sections.push(`Assessments: ${context.assessments.join("; ")}`);
    }
    if (context.grades.length) {
      sections.push(`Grades: ${context.grades.join("; ")}`);
    }
    if (context.students?.length) {
      sections.push(`Students: ${context.students.join("; ")}`);
    }
    if (context.recentGrades?.length) {
      sections.push(`Recent grades: ${context.recentGrades.join("; ")}`);
    }

    const roleGuidelines =
      context.role === "lecturer"
        ? [
            "- You are advising a lecturer; focus on class-wide insights, distributions, at-risk students, and assessment planning.",
            "- Use studentNumber or name and recent grades when asked about specific students; highlight missing data and suggest actions (record grades, verify weights).",
          ]
        : [
            "- For students: cite GPA, recent assessments, and weights; list missing grades or unknown assessments explicitly.",
            "- If asked for predictions, use available weights/scores; if missing, state the assumption or ask for the needed numbers.",
          ];

    sections.push(
      "",
      "Common requests to support:",
      "- Grade lookups, GPA explanations, missing scores, and recent graded assessments.",
      "- Predictions for target scores; study plans/schedules; learning resources.",
      "- Lecturer analytics: distributions, averages, at-risk lists, reweighting ideas, feedback templates.",
      "- Assessment help: weight splits, rubrics, sample exam questions.",
      "",
      "Hard constraints (do not violate):",
      "- Do NOT fabricate or infer averages, medians, distributions, final grades, at-risk lists, or hypothetical outcomes unless provided.",
      "- If a requested statistic is missing, explicitly say it is unavailable, name the missing computation, describe how it would be computed, and offer qualitative guidance only.",
      "- Predictions are allowed only when all weights/current scores are provided, or when a weighted average AND remaining weight are provided. Otherwise, ask for the missing inputs and explain the formula; label any assumption clearly.",
      "- For lecturer/admin prompts: you may discuss trends/patterns/completeness, but do NOT report averages/distributions/percent-below/rankings unless given. Instead, state what is needed from backend computations.",
      "- For students: do NOT infer subject-level performance without provided subject averages; list ungraded/unrecorded assessments instead of guessing scores.",
      "- Prefer correctness over completeness; be transparent about limitations; suggest the next actionable step (e.g., record grades, provide weights, fetch analytics) when blocked.",
      "",
      "Response style:",
      "- Answer in natural, conversational paragraphs.",
      "- Use bullet points ONLY for listing items.",
      "- NEVER start your entire response with a bullet point.",
      "- Be brief and clear, including numbers/percentages when known.",
      "- If data is missing, say so and list what is needed to answer accurately.",
      "- Offer a next step when appropriate (e.g., record grades, verify subject code).",
      "",
      "Guidelines:",
      ...roleGuidelines,
    );

    return sections.join("\n");
  }

  async getThreads(userId: string) {
    return await ChatThreadModel.find({ userId }).sort({ updatedAt: -1 });
  }

  async getMessagesByThread(threadId: string) {
    const thread = await ChatThreadModel.findById(threadId);
    return thread?.messages || [];
  }

  async generate(input: {
    user: ChatUser;
    message: string;
    threadId?: string;
  }) {
    const { user, message } = input;
    let threadId = input.threadId;

    if (!threadId) {
      const thread = await ChatThreadModel.create({
        userId: user.id,
        title: await this.generateTitle(message),
      });
      threadId = (thread as any).id;
    }

    // Save user message
    const thread = await ChatThreadModel.findByIdAndUpdate(
      threadId,
      {
        $push: {
          messages: {
            role: "user",
            content: message,
            createdAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!thread) {
      throw new CustomError("Thread not found", 404);
    }

    const historyStrings = thread.messages.map(
      (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
    );

    const context = await this.buildContext(user);
    const systemPrompt = this.buildSystemPrompt(context, historyStrings);

    try {
      const completion = await this.client.chat.completions.create({
        model: DEFAULT_MODEL || "openai/gpt-oss-120b",
        temperature: 0.35,
        max_tokens: 768,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });

      const content = completion.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new CustomError("Chat service unavailable", 503);
      }

      // Save assistant response
      await ChatThreadModel.findByIdAndUpdate(threadId, {
        $push: {
          messages: {
            role: "assistant",
            content,
            createdAt: new Date(),
          },
        },
        updatedAt: new Date(),
      });

      return { content, threadId };
    } catch (err: any) {
      throw new CustomError("Chat service unavailable", 503, {
        error: err?.message,
      });
    }
  }

  async stream(input: {
    user: ChatUser;
    message: string;
    threadId?: string;
    onChunk: (text: string) => Promise<void> | void;
  }) {
    const { user, message, onChunk } = input;
    let threadId = input.threadId;

    if (!threadId) {
      const thread = await ChatThreadModel.create({
        userId: user.id,
        title: await this.generateTitle(message),
      });
      threadId = (thread as any).id;
    }

    // Save user message
    const thread = await ChatThreadModel.findByIdAndUpdate(
      threadId,
      {
        $push: {
          messages: {
            role: "user",
            content: message,
            createdAt: new Date(),
          },
        },
      },
      { new: true },
    );

    if (!thread) {
      throw new CustomError("Thread not found", 404);
    }

    const historyStrings = thread.messages.map(
      (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`,
    );

    const context = await this.buildContext(user);
    const systemPrompt = this.buildSystemPrompt(context, historyStrings);

    try {
      const stream = await this.client.chat.completions.create({
        model: DEFAULT_MODEL,
        temperature: 0.35,
        max_tokens: 768,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      });

      let fullResponse = "";
      for await (const chunk of stream as any) {
        const delta = chunk?.choices?.[0]?.delta?.content;
        if (delta) {
          fullResponse += delta;
          await onChunk(delta);
        }
      }

      // Save complete assistant response
      if (fullResponse.trim()) {
        await ChatThreadModel.findByIdAndUpdate(threadId, {
          $push: {
            messages: {
              role: "assistant",
              content: fullResponse.trim(),
              createdAt: new Date(),
            },
          },
          updatedAt: new Date(),
        });
      }

      return { threadId };
    } catch (err: any) {
      throw new CustomError("Chat service unavailable", 503, {
        error: err?.message,
      });
    }
  }
}

const ChatService = new ChatServiceImpl();
export default ChatService;
