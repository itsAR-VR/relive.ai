import { Resend } from "resend"

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY)

// Admin email for notifications
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ar@soramedia.co"
// Using subdomain: support.giftingmoments.com (verified in Resend)
export const FROM_EMAIL = process.env.FROM_EMAIL || "Gifting Moments <hello@support.giftingmoments.com>"

interface SupportTicketEmailData {
  ticketId: string
  name: string
  email: string
  subject: string
  message: string
  orderId?: string | null
}

interface OrderConfirmationEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  tierName: string
  tierPrice: number
  currency?: string
}

/**
 * Send confirmation email to customer when they submit a support ticket
 */
export async function sendCustomerConfirmationEmail(data: SupportTicketEmailData) {
  const { ticketId, name, email, subject } = data

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `We received your message - Ticket #${ticketId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f0eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f0eb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #3d3632; padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #f5f0eb; font-size: 24px; font-weight: 600;">Gifting Moments</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <h2 style="margin: 0 0 16px; color: #3d3632; font-size: 22px; font-weight: 600;">Hi ${name},</h2>
                      <p style="margin: 0 0 24px; color: #5c5552; font-size: 16px; line-height: 1.6;">
                        Thank you for reaching out! We've received your support request and our team will get back to you within 24-48 hours.
                      </p>
                      
                      <!-- Ticket Info Box -->
                      <div style="background-color: #f5f0eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <p style="margin: 0 0 8px; color: #8a8280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Ticket Reference</p>
                        <p style="margin: 0 0 16px; color: #3d3632; font-size: 18px; font-weight: 600; font-family: monospace;">#${ticketId.slice(0, 8)}</p>
                        <p style="margin: 0 0 8px; color: #8a8280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</p>
                        <p style="margin: 0; color: #3d3632; font-size: 16px;">${subject}</p>
                      </div>
                      
                      <p style="margin: 0 0 8px; color: #5c5552; font-size: 14px; line-height: 1.6;">
                        In the meantime, feel free to reply to this email if you have any additional information to share.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; border-top: 1px solid #e8e3de; text-align: center;">
                      <p style="margin: 0; color: #8a8280; font-size: 12px;">
                        © ${new Date().getFullYear()} Gifting Moments. Give the gift of a relived memory.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to send customer confirmation email:", error)
    return { success: false, error }
  }
}

/**
 * Send notification email to admin when a new support ticket is created
 */
export async function sendAdminNotificationEmail(data: SupportTicketEmailData) {
  const { ticketId, name, email, subject, message, orderId } = data

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🎫 New Support Ticket: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #0f172a; padding: 24px; text-align: center;">
                      <h1 style="margin: 0; color: #f8fafc; font-size: 20px; font-weight: 600;">🎫 New Support Ticket</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <!-- Ticket Details -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Ticket ID</span><br>
                            <span style="color: #0f172a; font-size: 14px; font-family: monospace; font-weight: 600;">${ticketId}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">From</span><br>
                            <span style="color: #0f172a; font-size: 14px; font-weight: 500;">${name}</span>
                            <span style="color: #64748b; font-size: 14px;"> &lt;${email}&gt;</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span><br>
                            <span style="color: #0f172a; font-size: 14px; font-weight: 500;">${subject}</span>
                          </td>
                        </tr>
                        ${orderId ? `
                        <tr>
                          <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Related Order</span><br>
                            <span style="color: #0f172a; font-size: 14px; font-family: monospace;">${orderId}</span>
                          </td>
                        </tr>
                        ` : ''}
                      </table>
                      
                      <!-- Message -->
                      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                        <p style="margin: 0; color: #0f172a; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                      </div>
                      
                      <!-- CTA Button -->
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://www.giftingmoments.com'}/dashboard" 
                         style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
                        View in Admin Dashboard
                      </a>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 16px 32px; border-top: 1px solid #e2e8f0; text-align: center;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        Gifting Moments Admin Notification
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to send admin notification email:", error)
    return { success: false, error }
  }
}

/**
 * Send order confirmation email to customer after successful purchase
 */
export async function sendOrderConfirmationEmail(data: OrderConfirmationEmailData) {
  const { orderId, customerName, customerEmail, tierName, tierPrice, currency = "USD" } = data
  const formattedPrice = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(tierPrice)
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://www.giftingmoments.com"}/dashboard`

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order Confirmed! Your Gifting Moments Order #${orderId.slice(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f0eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f0eb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #3d3632; padding: 32px; text-align: center;">
                      <h1 style="margin: 0; color: #f5f0eb; font-size: 24px; font-weight: 600;">Gifting Moments</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 32px;">
                      <div style="text-align: center; margin-bottom: 32px;">
                        <div style="width: 64px; height: 64px; background-color: #d4edda; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 32px;">✓</span>
                        </div>
                        <h2 style="margin: 0 0 8px; color: #3d3632; font-size: 24px; font-weight: 600;">Thank You for Your Order!</h2>
                        <p style="margin: 0; color: #5c5552; font-size: 16px;">
                          Hi ${customerName || "there"}, we're excited to bring your memory to life.
                        </p>
                      </div>
                      
                      <!-- Order Details Box -->
                      <div style="background-color: #f5f0eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                        <p style="margin: 0 0 16px; color: #3d3632; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e8e3de; padding-bottom: 12px;">Order Details</p>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                          <tr>
                            <td style="padding: 8px 0; color: #8a8280;">Order ID</td>
                            <td style="padding: 8px 0; color: #3d3632; font-weight: 600; text-align: right; font-family: monospace;">#${orderId.slice(0, 8)}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #8a8280;">Package</td>
                            <td style="padding: 8px 0; color: #3d3632; font-weight: 500; text-align: right;">${tierName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #8a8280;">Amount Paid</td>
                            <td style="padding: 8px 0; color: #3d3632; font-weight: 600; text-align: right;">${formattedPrice}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- Important: Save Order ID -->
                      <div style="background-color: #fff3cd; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #ffc107;">
                        <p style="margin: 0; color: #856404; font-size: 14px;">
                          <strong>💡 Save your Order ID:</strong> #${orderId.slice(0, 8)}<br>
                          <span style="font-size: 12px;">You'll need this if you contact support.</span>
                        </p>
                      </div>
                      
                      <!-- What's Next -->
                      <div style="margin-bottom: 24px;">
                        <p style="margin: 0 0 12px; color: #3d3632; font-size: 16px; font-weight: 600;">What's Next?</p>
                        <ol style="margin: 0; padding-left: 20px; color: #5c5552; font-size: 14px; line-height: 1.8;">
                          <li>Complete your Director Interview to tell us about the memory</li>
                          <li>Our team will craft your personalized memory film</li>
                          <li>You'll receive your finished gift within 24-48 hours</li>
                        </ol>
                      </div>
                      
                      <!-- CTA Button -->
                      <a href="${dashboardUrl}" 
                         style="display: block; width: 100%; background-color: #3d3632; color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; text-align: center; box-sizing: border-box;">
                        View Your Order →
                      </a>
                      
                      <p style="margin: 16px 0 0; color: #8a8280; font-size: 12px; text-align: center;">
                        Questions? Visit our <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://www.giftingmoments.com"}/support" style="color: #3d3632;">support page</a> or reply to this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 24px 32px; border-top: 1px solid #e8e3de; text-align: center;">
                      <p style="margin: 0; color: #8a8280; font-size: 12px;">
                        © ${new Date().getFullYear()} Gifting Moments. Give the gift of a relived memory.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to send order confirmation email:", error)
    return { success: false, error }
  }
}
