const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const emailTemplates = {
  orderConfirmation: (username, orderDetails) => ({
    subject: '✅ Order Confirmed - Astra Gains',
    html: `
      <h2>Hello ${username},</h2>
      <p>Your order has been successfully created!</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
        <p><strong>Service:</strong> ${orderDetails.serviceName}</p>
        <p><strong>Quantity:</strong> ${orderDetails.quantity}</p>
        <p><strong>Cost:</strong> $${orderDetails.totalCost.toFixed(2)}</p>
        <p><strong>Status:</strong> ${orderDetails.status}</p>
      </div>
      <p>You can track your order in your dashboard.</p>
      <p>Best regards,<br/>Astra Gains Team</p>
    `
  }),

  orderCompleted: (username, orderDetails) => ({
    subject: '🎉 Order Completed - Astra Gains',
    html: `
      <h2>Hello ${username},</h2>
      <p>Great news! Your order has been completed!</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
        <p><strong>Service:</strong> ${orderDetails.serviceName}</p>
        <p><strong>Quantity Delivered:</strong> ${orderDetails.quantity}</p>
      </div>
      <p>Thank you for using Astra Gains!</p>
      <p>Best regards,<br/>Astra Gains Team</p>
    `
  }),

  depositConfirmation: (username, amount) => ({
    subject: '💰 Deposit Confirmed - Astra Gains',
    html: `
      <h2>Hello ${username},</h2>
      <p>Your deposit has been successfully processed!</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Amount:</strong> ${amount} KSh</p>
        <p><strong>Status:</strong> Completed</p>
      </div>
      <p>Your wallet has been updated. You can now create orders.</p>
      <p>Best regards,<br/>Astra Gains Team</p>
    `
  }),

  paymentRejected: (username, amount, reason) => ({
    subject: '⚠️ Payment Rejected - Astra Gains',
    html: `
      <h2>Hello ${username},</h2>
      <p>Your payment request could not be processed.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Amount:</strong> ${amount} KSh</p>
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>Please try again or contact support if you have questions.</p>
      <p>Best regards,<br/>Astra Gains Team</p>
    `
  }),

  withdrawalRequest: (username, amount) => ({
    subject: '📄 Withdrawal Request Received - Astra Gains',
    html: `
      <h2>Hello ${username},</h2>
      <p>Your withdrawal request has been received and is being processed.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        <p><strong>Status:</strong> Pending</p>
      </div>
      <p>You will receive an email notification once your withdrawal is processed.</p>
      <p>Best regards,<br/>Astra Gains Team</p>
    `
  }),

  welcomeEmail: (username, email) => ({
    subject: '👋 Welcome to Astra Gains SMM Panel!',
    html: `
      <h2>Welcome, ${username}!</h2>
      <p>Thank you for joining Astra Gains, the best SMM panel service.</p>
      <h3>Getting Started:</h3>
      <ol>
        <li>Log in to your dashboard</li>
        <li>Add funds to your wallet via M-Pesa</li>
        <li>Create your first order</li>
        <li>Track your order progress</li>
      </ol>
      <p><strong>Your Account Details:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Dashboard:</strong> https://yoursite.com/dashboard</p>
      </div>
      <p><strong>M-Pesa Payment Details:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Business Name:</strong> ASTRA GAINS</p>
        <p><strong>Paybill Code:</strong> 174379</p>
        <p><strong>Phone:</strong> +254797856232</p>
      </div>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br/>Astra Gains Team</p>
    `
  }),

  paymentPending: (username, amount, reference) => ({
    subject: '⏳ Payment Pending - Action Required',
    html: `
      <h2>Hello ${username},</h2>
      <p>Your payment request has been created. Please complete the M-Pesa payment now.</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Amount to Pay:</strong> ${amount} KSh</p>
        <p><strong>Reference:</strong> ${reference}</p>
        <p><strong>Paybill:</strong> 174379</p>
        <p><strong>Business Name:</strong> ASTRA GAINS</p>
      </div>
      <h3>How to Pay:</h3>
      <ol>
        <li>Open M-Pesa on your phone</li>
        <li>Go to Lipa na M-Pesa Online</li>
        <li>Enter Paybill: <strong>174379</strong></li>
        <li>Enter Reference: <strong>${reference}</strong></li>
        <li>Enter Amount: <strong>${amount}</strong></li>
        <li>Enter PIN and submit</li>
      </ol>
      <p>Once we receive your payment, your wallet will be updated automatically.</p>
      <p>Best regards,<br/>Astra Gains Team</p>
    `
  }),
};

const sendEmail = async (userEmail, templateName, ...args) => {
  try {
    if (!emailTemplates[templateName]) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = emailTemplates[templateName](...args);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      ...emailContent,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, message: error.message };
  }
};

module.exports = { sendEmail };
