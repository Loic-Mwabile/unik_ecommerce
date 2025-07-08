const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function sendOrderConfirmation(to, orderDetails) {
  console.log('[EMAIL] Sending order confirmation to:', to);
  return sgMail.send({
    to,
    from: process.env.FROM_EMAIL,
    subject: 'Order Confirmation - Unik Commerce',
    text: orderDetails,
    html: `<pre>${orderDetails}</pre>`
  }).then(() => {
    console.log('[EMAIL] Order confirmation sent to:', to);
  }).catch(err => {
    console.error('[EMAIL ERROR] Customer email:', err.response ? err.response.body : err);
    throw err;
  });
}

function sendAdminNotification(orderDetails) {
  console.log('[EMAIL] Sending admin notification to:', process.env.ADMIN_EMAIL);
  return sgMail.send({
    to: process.env.ADMIN_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: 'New Order Received - Unik Commerce',
    text: orderDetails,
    html: `<pre>${orderDetails}</pre>`
  }).then(() => {
    console.log('[EMAIL] Admin notification sent to:', process.env.ADMIN_EMAIL);
  }).catch(err => {
    console.error('[EMAIL ERROR] Admin email:', err.response ? err.response.body : err);
    throw err;
  });
}

module.exports = { sendOrderConfirmation, sendAdminNotification }; 