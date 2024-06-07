const express = require('express');
const PayOS = require('@payos/node');

const payos = new PayOS('your_client_id', 'your_api_key', 'your_checksum_key');

const app = express();
app.use(express.static('public'));
app.use(express.json());

const YOUR_DOMAIN = 'http://localhost:3000/';
app.post('/create-payment-link', async (req, res) => {
    const order = {
        amount: 10000,
        description: 'Thanh toan my tom',
        orderCode: 10,
        returnUrl: `${YOUR_DOMAIN}/success.html`,
        cancelUrl: `${YOUR_DOMAIN}/cancel.html`
    };
    try {
        const paymentLink = await payos.createPaymentLink(order);
        res.redirect(303, paymentLink.checkoutUrl);
    } catch (error) {
        console.error('Error creating payment link:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
