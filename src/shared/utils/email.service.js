const nodemailer = require("nodemailer");
const { config } = require("../config/env");
const { logger } = require("./logger");

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initTransporter();
  }

  initTransporter() {
    // Check if SMTP credentials are configured
    if (!config.smtp.user || !config.smtp.pass) {
      logger.warn("⚠️  SMTP credentials not configured. Email sending disabled.");
      logger.warn("Set SMTP_USER and SMTP_PASS environment variables to enable email.");
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.secure,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });

      this.isConfigured = true;
      logger.info("✅ Email service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize email service:", error);
    }
  }

  async sendVerificationEmail(email, code, name) {
    if (!this.isConfigured) {
      logger.warn(`Email not sent to ${email} - SMTP not configured`);
      // In development, log the code instead of sending email
      if (config.nodeEnv === "development") {
        logger.info(`📧 VERIFICATION CODE for ${email}: ${code}`);
      }
      return { success: true, message: "Email sending disabled in development" };
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #2d3748;
            margin-bottom: 20px;
          }
          .message {
            font-size: 16px;
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .code-container {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .code {
            font-size: 42px;
            font-weight: bold;
            color: white;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
          }
          .code-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-top: 10px;
            font-weight: 500;
          }
          .expiry {
            background-color: #fff5f5;
            border-left: 4px solid #fc8181;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .expiry-text {
            color: #c53030;
            font-size: 14px;
            margin: 0;
            font-weight: 500;
          }
          .footer {
            background-color: #f7fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          .footer-text {
            color: #718096;
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
          }
          .security-note {
            background-color: #faf5ff;
            border-left: 4px solid #9f7aea;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .security-text {
            color: #553c9a;
            font-size: 14px;
            margin: 0;
            line-height: 1.6;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Xác Thực Email</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Xin chào <strong>${name}</strong>,</p>
            
            <p class="message">
              Cảm ơn bạn đã đăng ký tài khoản! Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác thực bên dưới vào trang web:
            </p>
            
            <div class="code-container">
              <div class="code">${code}</div>
              <div class="code-label">MÃ XÁC THỰC CỦA BẠN</div>
            </div>
            
            <div class="expiry">
              <p class="expiry-text">⏰ Mã xác thực có hiệu lực trong 15 phút</p>
            </div>
            
            <div class="security-note">
              <p class="security-text">
                <strong>🛡️ Lưu ý bảo mật:</strong><br/>
                Không chia sẻ mã này với bất kỳ ai. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
              </p>
            </div>
          </div>
          
          <div class="footer">
            <p class="footer-text">
              Email này được gửi tự động, vui lòng không trả lời.<br/>
              © ${new Date().getFullYear()} trinhminhson.com. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Xin chào ${name},

Cảm ơn bạn đã đăng ký tài khoản! 

Mã xác thực của bạn là: ${code}

Mã này có hiệu lực trong 15 phút.

Vui lòng nhập mã này vào trang web để hoàn tất đăng ký.

Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.

--
trinhminhson.com
    `;

    try {
      await this.transporter.sendMail({
        from: config.smtp.from,
        to: email,
        subject: "🔐 Mã Xác Thực Email - trinhminhson.com",
        text: textContent,
        html: htmlTemplate,
      });

      logger.info(`✅ Verification email sent to ${email}`);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      logger.error(`Failed to send email to ${email}:`, error);
      throw new Error("Không thể gửi email xác thực. Vui lòng thử lại sau.");
    }
  }

  async sendPasswordResetEmail(email, resetUrl, name) {
    if (!this.isConfigured) {
      logger.warn(`Password reset email not sent to ${email} - SMTP not configured`);
      if (config.nodeEnv === "development") {
        logger.info(`🔗 PASSWORD RESET URL for ${email}: ${resetUrl}`);
      }
      return { success: true, message: "Email sending disabled in development" };
    }

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content {
            padding: 40px 30px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
          }
          .footer {
            background-color: #f7fafc;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 13px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔑 Đặt Lại Mật Khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào <strong>${name}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Đặt Lại Mật Khẩu</a>
            </p>
            <p style="color: #c53030;">⏰ Link này có hiệu lực trong 1 giờ.</p>
            <p style="font-size: 14px; color: #718096;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          </div>
          <div class="footer">
            Email này được gửi tự động, vui lòng không trả lời.<br/>
            © ${new Date().getFullYear()} trinhminhson.com. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: config.smtp.from,
        to: email,
        subject: "🔑 Đặt Lại Mật Khẩu - trinhminhson.com",
        html: htmlTemplate,
      });

      logger.info(`✅ Password reset email sent to ${email}`);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error("Không thể gửi email. Vui lòng thử lại sau.");
    }
  }
}

// Export singleton instance
module.exports = { emailService: new EmailService() };
