'use strict';

/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({
  strapi
}) => ({
  async create(ctx) {
    const {
      orderId, cart, totalPrice, deliveryType, fullName,
      phoneNumber, paymentType, email, fullAddress, orderStatus
    } = ctx.request.body;
    if (!cart) {
      ctx.response.status = 400;
      return {
        error: "Cart not found in request body"
      }
    }
    try {
       await strapi.service("api::order.order").create({
         data: {
           products: cart,
           orderId,
           totalPrice,
           deliveryType,
           fullName,
           phoneNumber,
           paymentType,
           email,
           fullAddress,
           orderStatus
         }
       });

      // Construct HTML email content
      const htmlContent = `
    <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
      <p style="font-weight: bold;">שלום ${fullName}, הזמנתך (#${orderId}) אושרה:</p>
      <ul style="list-style-type: none; padding: 0;">
        ${cart.map(product => `<li>${product?.attributes?.title}: <br /><span style="font-weight: bold;">${product?.attributes?.price}</span> x ${product.amount}</li>`).join('')}
      </ul>
      ${paymentType === 'bit' ? `
      <p>לינק לתשלום מהיר בביט יישלח במייל ובwhatsapp ברגע שנאשר את הזמנתך</p>
      ` : ''}
      <hr />
      <p style="font-weight: bold;">מחיר כולל: ₪${totalPrice}</p>
      <hr />
      <p>נציג מטעמנו ייצור איתך קשר לגבי ההזמנה שלך</p>
      <p> תודה שקנית אצלנו! https://zero-games.netlify.app/</p>
    </div>
`;

      await strapi.plugins['email'].services.email.send({
        to: email,
        from: 'zzrerogames@gmail.com',
        subject: 'אישור הזמנה',
        text: 'אישור הזמנה',
        html: htmlContent
      });

      await strapi.plugins['email'].services.email.send({
        to: 'zzrerogames@gmail.com',
        from: 'zzrerogames@gmail.com',
        subject: 'התקבלה הזמנה חדשה',
        text: 'התקבלה הזמנה חדשה',
        html: htmlContent
      });

      // Return success response
      return {
        message: `הזמנה התקבלה בהצלחה! מספר הזמנה: #${orderId}`,
        success: true
      };
    } catch (error) {
      console.log(error);
      ctx.response.status = 500;
    }
  },
  async get(ctx) {
      try {
        const { orderId, phoneNumber } = ctx.query;

        // Your logic to fetch order status based on orderId and phoneNumber
        // For example:
        const orderStatus = await strapi.query('order').findOne({ orderId, phoneNumber });

        if (!orderStatus) {
          ctx.response.status = 404;
          return {
            error: "Order not found"
          }
        }

        return {
          orderStatus
        };
      } catch (error) {
        console.log(error);
        ctx.response.status = 500;
      }
    }
}
));
