import emailjs from '@emailjs/browser';

// Replace these with your actual EmailJS credentials
// You can get them from https://dashboard.emailjs.com/admin
const SERVICE_ID = 'service_usea81k';
const TEMPLATE_ID = 'template_dxc26g9';
const PUBLIC_KEY = 'ltpjdiuHuWN696rdz';

export const sendOrderConfirmationEmail = async (order) => {
    console.log("Intentando enviar email con params:", order); // DEBUG
    try {
        const templateParams = {
            to_name: order.customer.fullName,
            to_email: order.customer.email,
            email: order.customer.email,
            order_id: order.id,
            order_total: order.total.toFixed(2),
            order_date: order.createdAt.toLocaleDateString(),
            items_summary: order.items.map(item => `${item.name} (x${item.quantity}) - $${(Number(item.price) * item.quantity).toFixed(2)}`).join('\n'), // Conversión segura a Number
            shipping_address: `${order.customer.address}, ${order.customer.city}, ${order.customer.zipCode}`
        };

        console.log("Enviando a EmailJS:", templateParams); // DEBUG

        const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log('SUCCESS!', response.status, response.text);
        alert(`¡Correo enviado con éxito a ${order.customer.email}!`); // DEBUG VISUAL
        return true;
    } catch (error) {
        console.error('FAILED...', error);
        alert(`FALLÓ el envío del correo: ${JSON.stringify(error)}`); // DEBUG VISUAL
        return false;
    }
};
