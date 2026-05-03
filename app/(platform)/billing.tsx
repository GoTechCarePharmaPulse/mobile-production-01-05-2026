import { View, Text, TouchableOpacity, Platform, Alert } from "react-native";
import { useEffect } from "react";
import { api } from "@/src/api/api";

// ✅ Load Razorpay script (WEB ONLY)
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (Platform.OS !== "web") return resolve(false);

    if (document.getElementById("razorpay-script")) {
      return resolve(true);
    }

    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export default function Billing() {
  useEffect(() => {
    if (Platform.OS === "web") {
      loadRazorpay();
    }
  }, []);

  const handlePayment = async () => {
    try {
      const res = await api.post("/payments/create-order", {
        amount: 500,
      });

      const order = res.data;

      // 🌐 WEB
      if (Platform.OS === "web") {
        const loaded = await loadRazorpay();
        if (!loaded) {
          alert("Razorpay failed");
          return;
        }

        const options = {
          key: "rzp_test_xxxxxxxxxx",
          amount: order.amount,
          currency: "INR",
          order_id: order.id,

          handler: async (response) => {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert("Payment Success ✅");
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }

      // 📱 MOBILE
      else {
        const RazorpayCheckout = require("react-native-razorpay").default;

        const options = {
          key: "rzp_test_xxxxxxxxxx",
          amount: order.amount,
          currency: "INR",
          order_id: order.id,
        };

        try {
          const data = await RazorpayCheckout.open(options);

          await api.post("/payments/verify", {
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
          });

          Alert.alert("Payment Success ✅");
        } catch (err) {
          Alert.alert("Payment Failed", err?.description || "Error");
        }
      }
    } catch (err) {
      console.log("❌ PAYMENT ERROR", err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Upgrade Plan</Text>

      <TouchableOpacity onPress={handlePayment}>
        <Text style={{ marginTop: 20 }}>Pay ₹500</Text>
      </TouchableOpacity>
    </View>
  );
}