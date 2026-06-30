const axios = require('axios');

const CHEAPGAIN_API_KEY = process.env.CHEAPGAIN_API_KEY;
const CHEAPGAIN_API_URL = process.env.CHEAPGAIN_API_URL;

const cheapgainAPI = {
  // Get all services
  getServices: async () => {
    try {
      const response = await axios.post(CHEAPGAIN_API_URL, {
        key: CHEAPGAIN_API_KEY,
        action: 'services'
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch services: ' + error.message);
    }
  },

  // Create order
  createOrder: async (serviceId, link, quantity) => {
    try {
      const response = await axios.post(CHEAPGAIN_API_URL, {
        key: CHEAPGAIN_API_KEY,
        action: 'add',
        service: serviceId,
        link: link,
        quantity: quantity
      });

      if (response.data.error) {
        return { success: false, message: response.data.error };
      }

      return {
        success: true,
        orderId: response.data.order,
        serviceName: 'Social Media Service',
        rate: response.data.rate || 0.5,
        totalCost: (quantity * (response.data.rate || 0.5)) / 1000
      };
    } catch (error) {
      throw new Error('Failed to create order: ' + error.message);
    }
  },

  // Get order status
  getOrderStatus: async (orderId) => {
    try {
      const response = await axios.post(CHEAPGAIN_API_URL, {
        key: CHEAPGAIN_API_KEY,
        action: 'status',
        order: orderId
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to get order status: ' + error.message);
    }
  }
};

module.exports = cheapgainAPI;
