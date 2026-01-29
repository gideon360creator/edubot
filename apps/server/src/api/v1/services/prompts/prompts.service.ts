import fs from "fs/promises";
import path from "path";
import { CustomError } from "@/api/v1/utils";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  roles: string[];
}

class PromptsServiceImpl {
  async getPrompts(role?: string) {
    const jsonPath = path.resolve(__dirname, "./prompts.json");

    try {
      const data = await fs.readFile(jsonPath, "utf-8");
      const prompts = JSON.parse(data) as Prompt[];

      if (role) {
        return prompts.filter((p) => p.roles.includes(role));
      }

      return prompts;
    } catch (err: any) {
      if (err instanceof CustomError) throw err;
      throw new CustomError("Failed to fetch prompts", 500, {
        error: err?.message,
      });
    }
  }
}

const PromptsService = new PromptsServiceImpl();
export default PromptsService;
