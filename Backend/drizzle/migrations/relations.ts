import { relations } from "drizzle-orm/relations";
import { articles, articleTags, skills, skillConnections, projects, caseStudies, clients, clientProjects, clientFeedback, codeReviews, analytics } from "./schema";

export const articleTagsRelations = relations(articleTags, ({one}) => ({
	article: one(articles, {
		fields: [articleTags.articleId],
		references: [articles.id]
	}),
}));

export const articlesRelations = relations(articles, ({many}) => ({
	articleTags: many(articleTags),
}));

export const skillConnectionsRelations = relations(skillConnections, ({one}) => ({
	skill_fromSkillId: one(skills, {
		fields: [skillConnections.fromSkillId],
		references: [skills.id],
		relationName: "skillConnections_fromSkillId_skills_id"
	}),
	skill_toSkillId: one(skills, {
		fields: [skillConnections.toSkillId],
		references: [skills.id],
		relationName: "skillConnections_toSkillId_skills_id"
	}),
}));

export const skillsRelations = relations(skills, ({many}) => ({
	skillConnections_fromSkillId: many(skillConnections, {
		relationName: "skillConnections_fromSkillId_skills_id"
	}),
	skillConnections_toSkillId: many(skillConnections, {
		relationName: "skillConnections_toSkillId_skills_id"
	}),
}));

export const caseStudiesRelations = relations(caseStudies, ({one}) => ({
	project: one(projects, {
		fields: [caseStudies.projectId],
		references: [projects.id]
	}),
}));

export const projectsRelations = relations(projects, ({many}) => ({
	caseStudies: many(caseStudies),
	codeReviews: many(codeReviews),
	analytics: many(analytics),
}));

export const clientProjectsRelations = relations(clientProjects, ({one, many}) => ({
	client: one(clients, {
		fields: [clientProjects.clientId],
		references: [clients.id]
	}),
	clientFeedbacks: many(clientFeedback),
}));

export const clientsRelations = relations(clients, ({many}) => ({
	clientProjects: many(clientProjects),
	clientFeedbacks: many(clientFeedback),
}));

export const clientFeedbackRelations = relations(clientFeedback, ({one}) => ({
	clientProject: one(clientProjects, {
		fields: [clientFeedback.clientProjectId],
		references: [clientProjects.id]
	}),
	client: one(clients, {
		fields: [clientFeedback.clientId],
		references: [clients.id]
	}),
}));

export const codeReviewsRelations = relations(codeReviews, ({one}) => ({
	project: one(projects, {
		fields: [codeReviews.projectId],
		references: [projects.id]
	}),
}));

export const analyticsRelations = relations(analytics, ({one}) => ({
	project: one(projects, {
		fields: [analytics.targetId],
		references: [projects.id]
	}),
}));