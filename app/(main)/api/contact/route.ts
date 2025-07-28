// app/api/contact/route.ts
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, company, message, inquiryType } = await request.json();

    // Validate required fields - only name and email are necessary
    if (!name || !email) {
      return Response.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'automicaai@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });

    // Format selected services (if any)
    const selectedServices = inquiryType && inquiryType.length > 0 ? inquiryType.map((service: string) => {
      const serviceNames: { [key: string]: string } = {
        'signature-verification': 'Signature Verification',
        'qr-extract': 'QR Extract',
        'id-crop': 'ID Crop',
        'qr-masking': 'QR Masking',
        'face-verify': 'Face Verify',
        'face-cropping': 'Face Cropping',
        'custom-requirement': 'Custom Requirement'
      };
      return serviceNames[service] || service;
    }).join(', ') : 'No services selected';

// Email content with improved CSS
const mailOptions = {
  from: 'automicaai@gmail.com',
  to: 'sales@automica.ai',
  subject: `New Contact Form Submission - ${name}`,
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
        
        <!-- Header Section -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 0 0 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🚀 New Contact Form Submission
          </h1>
          <p style="color: #e8eaff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
            Someone is interested in your AI services
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Contact Information Card -->
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #3b82f6; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              👤 Contact Information
            </h2>
            <div style="display: grid; gap: 12px;">
              <div style="display: flex; align-items: center; padding: 8px 0;">
                <span style="color: #64748b; font-weight: 600; width: 80px; font-size: 14px;">Name:</span>
                <span style="color: #1e293b; font-weight: 500; font-size: 16px;">${name}</span>
              </div>
              <div style="display: flex; align-items: center; padding: 8px 0;">
                <span style="color: #64748b; font-weight: 600; width: 80px; font-size: 14px;">Email:</span>
                <span style="color: #3b82f6; font-weight: 500; font-size: 16px;">
                  <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a>
                </span>
              </div>
              ${company ? `
              <div style="display: flex; align-items: center; padding: 8px 0;">
                <span style="color: #64748b; font-weight: 600; width: 80px; font-size: 14px;">Company:</span>
                <span style="color: #1e293b; font-weight: 500; font-size: 16px;">${company}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <!-- Services of Interest Card (only show if services are selected) -->
          ${inquiryType && inquiryType.length > 0 ? `
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #8b5cf6; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              🎯 Services of Interest
            </h2>
            <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${inquiryType.map((service: string) => {
                  const serviceNames: { [key: string]: string } = {
                    'signature-verification': 'Signature Verification',
                    'qr-extract': 'QR Extract',
                    'id-crop': 'ID Crop',
                    'qr-masking': 'QR Masking',
                    'face-verify': 'Face Verify',
                    'face-cropping': 'Face Cropping',
                    'custom-requirement': 'Custom Requirement'
                  };
                  const serviceName = serviceNames[service] || service;
                  return `<span style="background: linear-gradient(135deg, #8b5cf6, #a855f7); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-block;">${serviceName}</span>`;
                }).join('')}
              </div>
            </div>
          </div>
          ` : ''}

          <!-- Message Card (only show if message exists) -->
          ${message ? `
          <div style="background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              💬 Project Details
            </h2>
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.6;">
              <p style="color: #374151; margin: 0; white-space: pre-wrap; font-size: 15px; line-height: 1.7;">${message}</p>
            </div>
          </div>
          ` : `
          <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #6b7280; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
            <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              💬 Project Details
            </h2>
            <div style="background: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.6;">
              <p style="color: #6b7280; margin: 0; font-style: italic; font-size: 15px;">No specific project details provided</p>
            </div>
          </div>
          `}

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 0 10px 10px 0; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
              📧 Reply to ${name}
            </a>
            <a href="mailto:${email}?subject=Re: Your AI Services Inquiry" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 0 10px 10px 0; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;">
              💼 Send Quote
            </a>
          </div>

        </div>

        <!-- Footer Section -->
        <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; text-align: center; border-radius: 0 0 0 0;">
          <div style="border-top: 1px solid #374151; padding-top: 20px;">
            <p style="color: #9ca3af; margin: 0 0 10px 0; font-size: 14px;">
              <strong style="color: #f3f4f6;">Submitted:</strong> ${new Date().toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              This email was automatically generated by your contact form system.
            </p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `,
};

    // Send email
    await transporter.sendMail(mailOptions);

    return Response.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return Response.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}