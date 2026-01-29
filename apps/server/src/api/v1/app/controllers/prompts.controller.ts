import { Context } from "hono";
import PromptsService from "@/api/v1/services/prompts/prompts.service";
import { respond } from "@/api/v1/utils/respond";

export const getPrompts = async (c: Context) => {
  const user = c.get("user");
  const prompts = await PromptsService.getPrompts(user?.role);
  return respond(c, 200, "Prompts fetched", prompts);
};
