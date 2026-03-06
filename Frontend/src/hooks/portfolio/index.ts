/**
 * Portfolio hooks — domain-separated barrel export.
 * All hooks are re-exported here for backwards compatibility.
 */
export { useProjects } from "./use-projects";
export { useSkills, useSkillConnections, useMindset } from "./use-skills";
export { useArticles, useArticle, useArticleSearch } from "./use-articles";
export { useExperiences } from "./use-experiences";
export { useServices } from "./use-services";
export { useTestimonials } from "./use-testimonials";
export { useMessages, useSendMessage } from "./use-contact";
export { useAnalyticsSummary, useVitalsSummary } from "./use-analytics";
export { useEmailTemplates } from "./use-email-templates";
export { useLogin } from "./use-auth";
export { useGuestbook, useSubmitGuestbook, useAdminGuestbook, useApproveGuestbook, useDeleteGuestbook } from "./use-guestbook";
export { useCreateMindset, useUpdateMindset, useDeleteMindset } from "./use-admin-mindset";
export { useSiteSettings, useUpdateSiteSettings } from "../use-site-settings";
