import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: options.from ?? process.env.EMAIL_FROM ?? "noreply@weddingmarketplace.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("sendEmail failed:", err);
    return false;
  }
}

export function newInquiryEmail(params: {
  vendorName: string;
  coupleName: string;
  message: string;
  dashboardUrl: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Inquiry from ${params.coupleName}</h2>
      <p>You have a new inquiry on your Wedding Marketplace listing.</p>
      <blockquote style="border-left: 3px solid #e5e7eb; padding-left: 16px; color: #6b7280;">
        ${params.message}
      </blockquote>
      <a href="${params.dashboardUrl}" style="display: inline-block; background: #ec4899; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">
        View Inquiry
      </a>
    </div>
  `;
}

export function reviewApprovedEmail(params: {
  coupleName: string;
  vendorName: string;
  rating: number;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Your Review Has Been Published</h2>
      <p>Hi ${params.coupleName}, your ${params.rating}-star review for <strong>${params.vendorName}</strong> is now live.</p>
    </div>
  `;
}
