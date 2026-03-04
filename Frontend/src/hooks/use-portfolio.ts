/**
 * Backwards-compatible barrel — delegates to domain-separated files in ./portfolio/.
 * Consuming components continue to import from "@/hooks/use-portfolio" unchanged.
 */
export {
  useProjects,
  useSkills,
  useSkillConnections,
  useMindset,
  useArticles,
  useArticle,
  useExperiences,
  useServices,
  useTestimonials,
  useMessages,
  useSendMessage,
  useLogin,
  useAnalyticsSummary,
} from "./portfolio";

