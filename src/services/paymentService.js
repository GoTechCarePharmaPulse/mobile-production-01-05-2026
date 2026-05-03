// src/services/paymentService.js
import { Platform } from "react-native";
import RazorpayCheckout from "react-native-razorpay";

export const startPayment = async (order) => {
  if (Platform.OS === "web") {
    return startWebPayment(order);
  } else {
    return startMobilePayment(order);
  }
};

const startWebPayment = (order) => {
  const options = {
    key: "rzp_test_xxx",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,
    handler: function (response) {
      console.log("Payment success:", response);
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};


const startMobilePayment = async (order) => {
  const options = {
    key: "rzp_test_xxx",
    amount: order.amount,
    currency: "INR",
    order_id: order.id,
  };

  try {
    const data = await RazorpayCheckout.open(options);
    console.log("Success:", data);
  } catch (err) {
    console.log("Error:", err);
  }
};