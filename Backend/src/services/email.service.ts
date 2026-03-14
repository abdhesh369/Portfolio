import { emailQueue } from "../lib/queue.js";
import { env } from "../env.js";
import { logger } from "../lib/logger.js";
import { escapeHtml } from "../lib/escape.js";

export class EmailService {
    /**
     * Notify admin when a client submits new feedback
     */
    async sendAdminFeedbackAlert(data: { clientName: string; projectTitle: string; message: string }) {
        if (!emailQueue) {
            logger.warn("Email queue not initialized, skipping admin alert");
            return;
        }

        await emailQueue.add("portal-feedback-alert", {
            type: "admin-notification",
            payload: {
                to: env.ADMIN_EMAIL,
                subject: `NEW FEEDBACK: ${data.clientName} - ${data.projectTitle}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <h2 style="color: #4f46e5; margin-top: 0;">New Client Feedback</h2>
                        <p style="font-size: 14px; color: #64748b;">A client has submitted new feedback on the portal.</p>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Client</p>
                            <p style="margin: 5px 0 15px 0; font-weight: bold; color: #1e293b;">${escapeHtml(data.clientName)}</p>
                            
                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Project</p>
                            <p style="margin: 5px 0 15px 0; font-weight: bold; color: #1e293b;">${escapeHtml(data.projectTitle)}</p>
                            
                            <p style="margin: 0; font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Message</p>
                            <p style="margin: 5px 0 0 0; color: #334155; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
                        </div>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${env.FRONTEND_URL}/admin/clients" 
                               style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                                View in Admin Panel
                            </a>
                        </div>
                    </div>
                `
            }
        });
    }

    /**
     * Send portal invitation or token regeneration alert to client
     */
    async sendClientPortalInvite(data: { clientName: string; clientEmail: string; rawToken: string }) {
        if (!emailQueue) {
            logger.warn("Email queue not initialized, skipping client invite");
            return;
        }

        const portalUrl = `${env.FRONTEND_URL}/portal`;

        await emailQueue.add("portal-invite", {
            type: "client-notification",
            payload: {
                to: data.clientEmail,
                subject: "Your Client Portal Access Token",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <h2 style="color: #4f46e5; margin-top: 0;">Portal Access</h2>
                        <p style="font-size: 14px; color: #64748b;">Hello ${escapeHtml(data.clientName)},</p>
                        <p style="font-size: 14px; color: #64748b;">Your project dashboard token has been generated. You can use this to securely access your project updates and provide feedback.</p>
                        
                        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                            <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Access Token</p>
                            <code style="font-size: 18px; font-weight: bold; color: #0f172a; letter-spacing: 1px; display: block; word-break: break-all;">${data.rawToken}</code>
                        </div>
                        
                        <p style="font-size: 13px; color: #ef4444; font-weight: bold; margin-bottom: 25px;">IMPORTANT: Please copy this token and keep it safe. For security reasons, it cannot be recovered if lost.</p>
                        
                        <div style="text-align: center;">
                            <a href="${portalUrl}" 
                               style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                                Open Client Portal
                            </a>
                        </div>
                        
                        <p style="margin-top: 40px; font-size: 12px; color: #94a3b8; text-align: center;">
                            This is an automated message. Please do not reply directly.
                        </p>
                    </div>
                `
            }
        });
    }

    /**
     * Notify client when project status changes
     */
    async sendProjectUpdateAlert(data: { clientName: string; clientEmail: string; projectTitle: string; newStatus: string }) {
        if (!emailQueue) {
            logger.warn("Email queue not initialized, skipping project update alert");
            return;
        }

        await emailQueue.add("project-update", {
            type: "client-notification",
            payload: {
                to: data.clientEmail,
                subject: `Project Update: ${data.projectTitle}`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                        <h2 style="color: #4f46e5; margin-top: 0;">Project Update</h2>
                        <p style="font-size: 14px; color: #64748b;">Hello ${escapeHtml(data.clientName)},</p>
                        <p style="font-size: 14px; color: #64748b;">There has been an update to your project: <strong>${escapeHtml(data.projectTitle)}</strong></p>
                        
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; display: flex; align-items: center; justify-content: space-between;">
                            <span style="font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">New Status</span>
                            <span style="background: #4f46e5; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${escapeHtml(data.newStatus.replace('_', ' '))}</span>
                        </div>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${env.FRONTEND_URL}/portal" 
                               style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">
                                View in Portal
                            </a>
                        </div>
                    </div>
                `
            }
        });
    }
}

export const emailService = new EmailService();
