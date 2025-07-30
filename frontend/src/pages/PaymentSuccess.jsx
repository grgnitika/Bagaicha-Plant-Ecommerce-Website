import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { cartReduxActions } from "@/features/shop/cartSlices";
import { checkoutReduxActions } from "@/features/shop/checkoutSlices";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const session_id = searchParams.get("session_id");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [status, setStatus] = useState("Verifying payment...");
  const hasRunRef = useRef(false); // prevent double-run

  useEffect(() => {
    const verifyPayment = async () => {
      if (!session_id || hasRunRef.current) return;
      hasRunRef.current = true;

      const contact = JSON.parse(localStorage.getItem("contactFormDetails")) || {};
      const shipping = JSON.parse(localStorage.getItem("shippingAddressFormDetails")) || {};
      const billing = JSON.parse(localStorage.getItem("billingAddressFormDetails")) || {};
      const cart = JSON.parse(localStorage.getItem("cart_items")) || [];

      if (!contact.email || !shipping.address || !billing.address || cart.length === 0) {
        setStatus("Missing order details. Cannot proceed.");
        toast.error("Missing form or cart data.");
        return;
      }

      try {
        // Verify Stripe payment
        const res = await fetch(`${import.meta.env.VITE_BACKEND}/payment/stripe/verify?session_id=${session_id}`);
        const data = await res.json();

        if (data.success) {
          toast.success("Payment successful!");
          setStatus("Payment Verified ✅");

          // Save the order
          const saveRes = await fetch(`${import.meta.env.VITE_BACKEND}/payment/stripe/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: session_id,
              formdetails: {
                contact,
                shippingaddress: shipping,
                billingaddress: billing,
                paymentType: "card",
                gatewayType: "stripe",
              },
              cart_items: cart,
            }),
          });

          const saveData = await saveRes.json();

          if (saveData.success && saveData.redirectUrl) {
            // ✅ Clear Redux cart and checkout data
            dispatch(cartReduxActions.reset());
            dispatch(checkoutReduxActions.reset());

            // ✅ Clear localStorage cart and form data
            localStorage.removeItem("contactFormDetails");
            localStorage.removeItem("shippingAddressFormDetails");
            localStorage.removeItem("billingAddressFormDetails");
            localStorage.removeItem("cart_items");

            // ✅ Redirect
            window.location.href = saveData.redirectUrl;
          } else {
            setStatus("Order saving failed.");
            toast.error("Failed to save order.");
          }
        } else {
          setStatus("Payment verification failed.");
          toast.error("Payment verification failed.");
        }
      } catch (err) {
        setStatus("Error verifying payment.");
        toast.error("Error verifying payment.");
      }
    };

    verifyPayment();
  }, [session_id, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col text-center px-4">
      <h2 className="text-2xl font-semibold mb-2">{status}</h2>
      <p className="text-gray-600">You’ll be redirected shortly if successful.</p>
    </div>
  );
}

export default PaymentSuccess;
