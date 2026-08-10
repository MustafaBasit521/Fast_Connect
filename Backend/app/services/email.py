# import nodemailer from 'nodemailer';
# import { env } from '../config/env.js';

# const isSmtpConfigured = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

# // getTransporter: builds the SMTP transporter when email credentials are configured.
# const getTransporter = () => {
#   if (!isSmtpConfigured) return null;

#   return nodemailer.createTransport({
#     host: env.smtpHost,
#     port: env.smtpPort,
#     secure: env.smtpSecure,
#     auth: {
#       user: env.smtpUser,
#       pass: env.smtpPass
#     }
#   });
# };

# const transporter = getTransporter();

# // sendEmail: sends an email or logs a preview when SMTP is not configured.
# export const sendEmail = async ({ to, subject, text, html }) => {
#   if (!env.mailEnabled || !to) return;

#   if (!transporter) {
#     console.log('[email:preview]', { to, subject, text });
#     return;
#   }

#   try {
#     await transporter.sendMail({
#       from: env.mailFrom,
#       to,
#       subject,
#       text,
#       html
#     });
#   } catch (error) {
#     console.error('Email delivery failed:', error.message);
#   }
# };

# // money: formats numeric values as currency for email copy.
# const money = (value) => `$${Number(value || 0).toFixed(2)}`;
# // orderId: creates a short customer-friendly order reference.
# const orderId = (order) => order._id.toString().slice(-8).toUpperCase();

# // orderLines: formats order items for plain-text emails.
# const orderLines = (items = []) =>
#   items.map((item) => `- ${item.name} x ${item.quantity}: ${money(item.lineTotal)}`).join('\n');

# // orderHtml: builds a simple HTML email body for order notifications.
# const orderHtml = (title, intro, order) => `
#   <div style="font-family:Arial,sans-serif;color:#0b1c3a;line-height:1.5">
#     <h2>${title}</h2>
#     <p>${intro}</p>
#     <p><strong>Order:</strong> #${orderId(order)}</p>
#     <p><strong>Total:</strong> ${money(order.totalAmount)}</p>
#     <ul>
#       ${(order.items || []).map((item) => `<li>${item.name} x ${item.quantity}: <strong>${money(item.lineTotal)}</strong></li>`).join('')}
#     </ul>
#     <p style="color:#5c7093">BazaarX</p>
#   </div>
# `;

# // sendWelcomeEmail: emails users after account creation.
# export const sendWelcomeEmail = (user) =>
#   sendEmail({
#     to: user.email,
#     subject: 'Welcome to BazaarX',
#     text: `Hi ${user.name}, your BazaarX ${user.role} account has been created successfully.`,
#     html: `<p>Hi <strong>${user.name}</strong>, your BazaarX ${user.role} account has been created successfully.</p>`
#   });

# // sendCustomerOrderPlacedEmail: tells customers their order was placed and awaits confirmation.
# export const sendCustomerOrderPlacedEmail = (customer, order) =>
#   sendEmail({
#     to: customer.email,
#     subject: `BazaarX order #${orderId(order)} placed`,
#     text: `Hi ${customer.name}, your order #${orderId(order)} has been placed. Please wait for seller confirmation.\n\n${orderLines(order.items)}\n\nTotal: ${money(order.totalAmount)}`,
#     html: orderHtml('Order placed', `Hi ${customer.name}, your order has been placed. Please wait for seller confirmation.`, order)
#   });

# // sendSellerOrderReceivedEmail: tells sellers a new order arrived.
# export const sendSellerOrderReceivedEmail = (seller, order) =>
#   sendEmail({
#     to: seller.email,
#     subject: `New BazaarX order #${orderId(order)}`,
#     text: `Hi ${seller.name}, you received a new order #${orderId(order)}.\n\n${orderLines(order.items)}\n\nTotal: ${money(order.totalAmount)}`,
#     html: orderHtml('New order received', `Hi ${seller.name}, you received a new order.`, order)
#   });

# // sendCustomerOrderConfirmedEmail: tells customers the seller confirmed their order.
# export const sendCustomerOrderConfirmedEmail = (customer, order) =>
#   sendEmail({
#     to: customer.email,
#     subject: `BazaarX order #${orderId(order)} confirmed`,
#     text: `Hi ${customer.name}, your order #${orderId(order)} has been confirmed by the seller.`,
#     html: orderHtml('Order confirmed', `Hi ${customer.name}, your order has been confirmed by the seller.`, order)
#   });
