import { View, Text, TouchableOpacity } from "react-native";
import api from "@/src/api/api";

export default function BillingScreen() {

  const handlePayment = async () => {
    try {
      const { data } = await api.post("/billing/create-order", {
        amount: 500,
      });

      const options = {
        key: "YOUR_RAZORPAY_KEY",
        amount: data.amount,
        currency: "INR",
        order_id: data.id,

        handler: async function (response) {
          await api.post("/billing/verify", response);
          alert("Payment Successful");
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.log("Payment Error:", err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>💳 Billing</Text>

      <TouchableOpacity
        onPress={handlePayment}
        style={{ backgroundColor: "blue", padding: 12, marginTop: 20 }}
      >
        <Text style={{ marginTop: 10, color: "#fff" }}>Pay ₹500, Plan details, renewal date, payment history will appear here.</Text>
      </TouchableOpacity>
    </View>
  );
}
