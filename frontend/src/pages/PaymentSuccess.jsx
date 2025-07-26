// // import React, { useEffect, useState, useRef } from "react";
// // import { useSearchParams, useNavigate } from "react-router-dom";
// // import { useDispatch } from "react-redux";
// // import { toast } from "sonner";
// // import { cartReduxActions } from "../features/shop/cartSlices";

// // function PaymentSuccess() {
// //   const [searchParams] = useSearchParams();
// //   const session_id = searchParams.get("session_id");
// //   const navigate = useNavigate();
// //   const dispatch = useDispatch();
// //   const [status, setStatus] = useState("Verifying payment...");
// //   const hasRun = useRef(false); // 🛡️ Prevent multiple execution

// //   useEffect(() => {
// //     if (hasRun.current) return;
// //     hasRun.current = true;

// //     const verifyPayment = async () => {
// //       if (!session_id) {
// //         setStatus("Missing session ID.");
// //         return;
// //       }

// //       const contact = JSON.parse(localStorage.getItem("contactFormDetails")) || {};
// //       const shipping = JSON.parse(localStorage.getItem("shippingAddressFormDetails")) || {};
// //       const billing = JSON.parse(localStorage.getItem("billingAddressFormDetails")) || {};
// //       const cart = JSON.parse(localStorage.getItem("cart_items")) || [];

// //       if (!contact.email || !shipping.address || !billing.address || cart.length === 0) {
// //         setStatus("Missing order details. Cannot proceed.");
// //         toast.error("Missing form or cart data.");
// //         return;
// //       }

// //       try {
// //         const res = await fetch(
// //           `${import.meta.env.VITE_BACKEND}/payment/stripe/verify?session_id=${session_id}`
// //         );
// //         const data = await res.json();

// //         if (data.success) {
// //           toast.success("Payment successful!");
// //           setStatus("Payment Verified ✅");

// //           const saveRes = await fetch(`${import.meta.env.VITE_BACKEND}/payment/stripe/save`, {
// //             method: "POST",
// //             headers: { "Content-Type": "application/json" },
// //             body: JSON.stringify({
// //               sessionId: session_id,
// //               formdetails: {
// //                 contact,
// //                 shippingaddress: shipping,
// //                 billingaddress: billing,
// //                 paymentType: "card",
// //                 gatewayType: "stripe",
// //               },
// //               cart_items: cart,
// //             }),
// //           });

// //           const saveData = await saveRes.json();

// //           if (saveData.success && saveData.redirectUrl) {
// //             // ✅ Clear cart and form data
// //             localStorage.removeItem("contactFormDetails");
// //             localStorage.removeItem("shippingAddressFormDetails");
// //             localStorage.removeItem("billingAddressFormDetails");
// //             localStorage.removeItem("cart_items");

// //             // ✅ Clear Redux cart
// //             dispatch(cartReduxActions.reset());

// //             // ✅ Redirect
// //             window.location.href = saveData.redirectUrl;
// //           } else {
// //             setStatus("Order saving failed.");
// //             toast.error("Failed to save order.");
// //           }
// //         } else {
// //           setStatus("Payment verification failed.");
// //           toast.error("Payment verification failed.");
// //         }
// //       } catch (err) {
// //         setStatus("Error verifying payment.");
// //         toast.error("Error verifying payment.");
// //       }
// //     };

// //     verifyPayment();
// //   }, [session_id, navigate, dispatch]);

// //   return (
// //     <div className="min-h-screen flex items-center justify-center flex-col text-center px-4">
// //       <h2 className="text-2xl font-semibold mb-2">{status}</h2>
// //       <p className="text-gray-600">You’ll be redirected shortly if successful.</p>
// //     </div>
// //   );
// // }

// // export default PaymentSuccess;

// import { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { cartReduxActions } from "@/features/shop/cartSlices";
// import { checkoutReduxActions } from "@/features/shop/checkoutSlices";
// import { toast } from "sonner";

// function PaymentSuccess() {
//   const [searchParams] = useSearchParams();
//   const session_id = searchParams.get("session_id");
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [status, setStatus] = useState("Verifying payment...");

//   useEffect(() => {
//     const verifyAndSaveOrder = async () => {
//       if (!session_id) {
//         toast.error("Session ID not found.");
//         return navigate("/");
//       }

//       const isAlreadyProcessed = localStorage.getItem(`payment_done_${session_id}`);
//       if (isAlreadyProcessed) {
//         // ✅ Already processed, so skip saving again
//         console.log("Payment already handled. Skipping.");
//         return;
//       }

//       try {
//         // 1. Verify Stripe Payment
//         const verifyRes = await fetch(`${import.meta.env.VITE_BACKEND}/payment/stripe/verify?session_id=${session_id}`);
//         const verifyData = await verifyRes.json();

//         if (!verifyData.success) {
//           toast.error("Payment verification failed.");
//           return setStatus("Payment failed.");
//         }

//         // 2. Save order to backend
//         const contact = JSON.parse(localStorage.getItem("contactFormDetails")) || {};
//         const shipping = JSON.parse(localStorage.getItem("shippingAddressFormDetails")) || {};
//         const billing = JSON.parse(localStorage.getItem("billingAddressFormDetails")) || {};
//         const cart = JSON.parse(localStorage.getItem("cart_items")) || [];

//         const saveRes = await fetch(`${import.meta.env.VITE_BACKEND}/payment/stripe/save`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             sessionId: session_id,
//             formdetails: {
//               contact,
//               shippingaddress: shipping,
//               billingaddress: billing,
//               paymentType: "card",
//               gatewayType: "stripe",
//             },
//             cart_items: cart,
//           }),
//         });

//         const saveData = await saveRes.json();

//         if (saveData.success && saveData.redirectUrl) {
//           // ✅ Mark payment as done (prevents re-saving)
//           localStorage.setItem(`payment_done_${session_id}`, "true");

//           // ✅ Clear cart data and form info
//           localStorage.removeItem("contactFormDetails");
//           localStorage.removeItem("shippingAddressFormDetails");
//           localStorage.removeItem("billingAddressFormDetails");
//           localStorage.removeItem("cart_items");

//           // ✅ Clear Redux store
//           dispatch(cartReduxActions.reset());
//           dispatch(checkoutReduxActions.reset());

//           // ✅ Redirect to final success page
//           window.location.href = saveData.redirectUrl;
//         } else {
//           toast.error("Order saving failed.");
//           setStatus("Saving failed.");
//         }

//       } catch (err) {
//         console.error("Error verifying/saving:", err);
//         toast.error("Something went wrong.");
//         setStatus("Error occurred.");
//       }
//     };

//     verifyAndSaveOrder();
//   }, [session_id, dispatch, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center flex-col text-center px-4">
//       <h2 className="text-2xl font-semibold mb-2">{status}</h2>
//       <p className="text-gray-600">Please wait while we confirm your payment...</p>
//     </div>
//   );
// }

// export default PaymentSuccess;

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
