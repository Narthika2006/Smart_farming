const nodemailer = require("nodemailer");

class AlertService {
  constructor(emailUser, emailPass) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });
    this.emailUser = emailUser;
  }

  async sendEmail(message) {
    await this.transporter.sendMail({
      from: this.emailUser,
      to: this.emailUser,
      subject: "Smart Farm Alert",
      text: message,
    });
    return { message: "Email sent successfully" };
  }
}

module.exports = AlertService;
