import nodemailer, { Transporter } from 'nodemailer';
import { getRuntimeConfig } from 'src/common/config/app-config';

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  variables?: Record<string, string | number>;
}
const runtimeConfig = getRuntimeConfig();

const transporter: Transporter = nodemailer.createTransport({
  host: runtimeConfig.smtp.host,
  port: runtimeConfig.smtp.port,
  secure: runtimeConfig.smtp.secure,
  auth: {
    user: runtimeConfig.smtp.user,
    pass: runtimeConfig.smtp.pass,
  },
});

const parseTemplate = (
  template: string,
  variables: Record<string, string | number> = {},
): string => {
  let parsed = template;

  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    parsed = parsed.replace(regex, String(variables[key]));
  });

  return parsed;
};

export const sendEmail = async ({
  to,
  subject,
  template,
  variables = {},
}: SendEmailOptions): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> => {
  try {
    const html = parseTemplate(template, variables);

    const info = await transporter.sendMail({
      from: `"${runtimeConfig.smtp.fromName}" <${runtimeConfig.smtp.user}>`,
      to,
      subject,
      html,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('Email error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// export const sendOTPEmail = async (email: string, otp: string) => {
//   const template = `
//     <div style="font-family: Arial;">
//       <h2>Your OTP Code</h2>
//       <p>Your verification code is:</p>
//       <h1 style="letter-spacing: 5px;">{{otp}}</h1>
//       <p>This expires in 5 minutes.</p>
//     </div>
//   `;

//   return sendEmail({
//     to: email,
//     subject: 'OTP Verification',
//     template,
//     variables: { otp },
//   });
// };
