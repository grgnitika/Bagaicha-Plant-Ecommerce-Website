// import React, { useEffect, useRef, useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { useSelector } from "react-redux";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import LoadingBar from "react-top-loading-bar";
// import { paymentCheckoutFormSchema } from "@/components/common/Checkout/Form/util.js";


// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Button } from "@/components/ui/button";

// import khaltilogo from "@/assets/khalti.jpg";
// import stripelogo from "@/assets/stripe.svg";

// import { CreditCard, Money } from "@phosphor-icons/react";
// import { codCheckout } from "../../../../lib/http";


// // eslint-disable-next-line react/prop-types


// function PaymentSelect({ setStage, cart_items }) {
//   const items = cart_items ?? JSON.parse(localStorage.getItem("cart_items") || "[]");
//   console.log("✅ Final cart items being used:", items);
//   const [paymentmode, setPaymentmode] = useState(null);
//   const [gatewayselection, setGatewayselection] = useState(null);
//   const loadingRef = useRef(null);

//   const {
//     totalamount,
//     contactFormDetails,
//     shippingAddressFormDetails,
//     billingAddressFormDetails,
//   } = useSelector((state) => state.checkout);

//   // ✅ fallback to localStorage if Redux doesn't have the contact info
// const contact = contactFormDetails || JSON.parse(localStorage.getItem("contactFormDetails")) || {};


//   const form = useForm({
//     resolver: zodResolver(paymentCheckoutFormSchema),
//     mode: "onChange",
//   });

//   const { methods, watch, setValue, clearErrors, setError } = form;

//   const paymentType = watch("paymenttype");
//   const gatewayType = watch("gateway");

//   useEffect(() => {
//     if (paymentType === "cod") {
//       setValue("gateway", undefined);
//       clearErrors("gateway");
//     }

//     if (paymentType === "card" && gatewayType === undefined) {
//       setValue("gateway", "");
//       setError("gateway", {
//         type: "random",
//         message: "Please choose any one payment gateway",
//       });
//     }
//   }, [paymentType, gatewayType, setValue, clearErrors]);

//   async function onSubmit(data) {
//     loadingRef.current.continuousStart();
//     setStage(3);
//     if (paymentType === "card" && gatewayType === "khalti") {
//   try {
//     const response = await fetch(`${import.meta.env.VITE_BACKEND}/payment/khalti/initiate`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         amount: totalamount, // amount in paisa (e.g., Rs. 100 = 10000)
//         order_id: `order_${Date.now()}`,
//         order_name: "Plant Order",
//         return_url: `${window.location.origin}/payment/success`,
//         customer_info: {
//           customer_info: {
//             name: contact.name ?? "Guest",
//             email: contact.email ?? "guest@example.com",
//             phone: contact.phone ?? "9800000000",
//           },
//         },
        
//         products: cart_items.map((item) => ({
//           identity: item._id,
//           name: item.name,
//           total_price: item.price,
//           quantity: item.qty,
//           unit_price: item.price,
//         })),
//       }),
//     });

//     const data = await response.json();
//     if (data.payment_url) {
//       window.location.href = data.payment_url;
//     } else {
//       toast.error("Failed to initiate Khalti payment.");
//     }
//   } catch (err) {
//     toast.error("Error initiating Khalti payment.");
//   } finally {
//     loadingRef.current.complete();
//   }
// } else if (paymentType === "card" && gatewayType === "stripe") {
//   try {
//     console.log("🟢 Sending to Stripe:", cart_items.map((item) => ({
//       name: item.name ?? "Unnamed Product",
//   price: item.price,
//   qty: item.qty ?? item.quantity ?? 1,
// })));

//     const response = await fetch(`${import.meta.env.VITE_BACKEND}/payment/stripe/checkout-session`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//   cart_items: cart_items.map((item) => ({
//     name: item.name,
//     price: item.price,
//     qty: item.qty ?? item.quantity ?? 1, 
//   })),
//   customer_info: {
//     name: contactFormDetails.name,
//     email: contactFormDetails.email,
//     phone: contactFormDetails.phone, 
//   },
// }),


//     });

//     const data = await response.json();
//     if (data.url) {
// localStorage.setItem("contactFormDetails", JSON.stringify(contactFormDetails));
// localStorage.setItem("shippingAddressFormDetails", JSON.stringify(shippingAddressFormDetails));
// localStorage.setItem("billingAddressFormDetails", JSON.stringify(billingAddressFormDetails));
// localStorage.setItem("cart_items", JSON.stringify(cart_items));


//       window.location.href = data.url;
//     } else {
//       toast.error("Failed to initiate Stripe payment.");
//     }
//   } catch (err) {
//     toast.error("Error initiating Stripe payment.");
//   } finally {
//     loadingRef.current.complete();
//   }
// } else if (paymentType === "cod") {
//       console.log("COD AMOUNT ->", totalamount);

//       const coddata = await codCheckout(
//         totalamount,
//         {
//           contact: contactFormDetails,
//           shippingaddress: shippingAddressFormDetails,
//           billingaddress: billingAddressFormDetails,
//           paymentType,
//           gatewayType,
//         },
//         cart_items
//       );
//       window.location.replace(coddata?.redirectUrl);
//     }
//   }

//   return (
//     <React.Fragment>
//       <LoadingBar color="#003E29" ref={loadingRef} shadow={true} />
//       <div className="space-y-5">
//         <button onClick={() => setStage(2)}>Back</button>
//         <FormProvider {...methods} setValue={setValue}>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Payment Method</CardTitle>
//                   <CardDescription>
//                     Add a new payment method to your order.
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="grid gap-6">
//                   {/* eslint-disable-next-line react/prop-types */}
//                   <FormField
//                     control={form.control}
//                     name="paymenttype"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormControl>
//                           <RadioGroup
//                             className="grid grid-cols-3 gap-4"
//                             onValueChange={(value) => {
//                               setPaymentmode(value);
//                               field.onChange(value);
//                             }}
//                             defaultValue={field.value}
//                             {...field}
//                           >
//                             <FormItem>
//                               <FormControl>
//                                 <RadioGroupItem
//                                   value="card"
//                                   id="card"
//                                   className="peer sr-only"
//                                 />
//                               </FormControl>
//                               <FormLabel
//                                 htmlFor="card"
//                                 className="flex flex-col items-center justify-between gap-2 rounded-md border-2 border-muted bg-popover p-4  peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
//                               >
//                                 <CreditCard size={36} color="#121212" />
//                                 Card
//                               </FormLabel>
//                             </FormItem>
//                             <FormItem>
//                               <FormControl>
//                                 <RadioGroupItem
//                                   value="cod"
//                                   id="cod"
//                                   className="peer sr-only"
//                                 />
//                               </FormControl>
//                               <FormLabel
//                                 htmlFor="cod"
//                                 className="flex flex-col items-center justify-between gap-2 rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
//                               >
//                                 <Money size={36} color="#121212" />
//                                 Cash on Delivery
//                               </FormLabel>
//                             </FormItem>
//                           </RadioGroup>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </CardContent>
//               </Card>
//               {paymentmode === "card" && (
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Choose Gateway</CardTitle>
//                   </CardHeader>
//                   <CardContent className="grid gap-6">
//                     {/* eslint-disable-next-line react/prop-types */}
//                     <FormField
//                       control={form.control}
//                       name="gateway"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <RadioGroup
//                               className="flex flex-row gap-3"
//                               onValueChange={(value) => {
//                                 setGatewayselection(value);
//                                 field.onChange(value);
//                               }}
//                               defaultValue={field.value}
//                               {...field}
//                             >
//                               <FormItem>
//                                 <FormControl>
//                                   <RadioGroupItem
//                                     value="khalti"
//                                     id="khalti"
//                                     className="peer sr-only"
//                                   />
//                                 </FormControl>
//                                 <FormLabel
//                                   htmlFor="khalti"
//                                   className="flex flex-col items-center justify-between gap-2 rounded-md border-2 border-muted bg-popover p-4  peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
//                                 >
//                                   <img
//                                     src={khaltilogo}
//                                     alt="Khalti Payment Gateway"
//                                     className="h-10 w-48 bg-cover"
//                                   />
//                                   Khalti Coming Soon
//                                 </FormLabel>
//                               </FormItem>
//                               <FormItem>
//                                 <FormControl>
//                                   <RadioGroupItem
//                                     value="stripe"
//                                     id="stripe"
//                                     className="peer sr-only"
//                                   />
//                                 </FormControl>
//                                 <FormLabel
//                                   htmlFor="stripe"
//                                   className="flex flex-col items-center justify-between gap-2 rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
//                                 >
//                                   <img
//                                     src={stripelogo}
//                                     alt="Stripe Payment Gateway"
//                                     className="h-10 w-48 bg-cover"
//                                   />
//                                   Stripe
//                                 </FormLabel>
//                               </FormItem>
//                             </RadioGroup>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                   </CardContent>
//                 </Card>
//               )}

//               <div className="float-right">
//                 <Button variant="outline" type="submit" disabled={!paymentmode}>
//                   Place Order
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </FormProvider>
//       </div>
//     </React.Fragment>
//   );
// }

// export default PaymentSelect;

import React, { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import LoadingBar from "react-top-loading-bar";
import { paymentCheckoutFormSchema } from "@/components/common/Checkout/Form/util.js";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

import stripelogo from "@/assets/stripe.svg";
import { CreditCard, Money } from "@phosphor-icons/react";
import { codCheckout } from "../../../../lib/http";

function PaymentSelect({ setStage, cart_items }) {
  const items = cart_items ?? JSON.parse(localStorage.getItem("cart_items") || "[]");
  console.log("✅ Final cart items being used:", items);
  const [paymentmode, setPaymentmode] = useState(null);
  const [gatewayselection, setGatewayselection] = useState(null);
  const loadingRef = useRef(null);

  const {
    totalamount,
    contactFormDetails,
    shippingAddressFormDetails,
    billingAddressFormDetails,
  } = useSelector((state) => state.checkout);

  // ✅ fallback to localStorage if Redux doesn't have the contact info
  const contact = contactFormDetails || JSON.parse(localStorage.getItem("contactFormDetails")) || {};

  const form = useForm({
    resolver: zodResolver(paymentCheckoutFormSchema),
    mode: "onChange",
  });

  const { methods, watch, setValue, clearErrors, setError } = form;

  const paymentType = watch("paymenttype");
  const gatewayType = watch("gateway");

  useEffect(() => {
    if (paymentType === "cod") {
      setValue("gateway", undefined);
      clearErrors("gateway");
    }

    if (paymentType === "card" && gatewayType === undefined) {
      setValue("gateway", "");
      setError("gateway", {
        type: "random",
        message: "Please choose a payment gateway",
      });
    }
  }, [paymentType, gatewayType, setValue, clearErrors]);

  async function onSubmit(data) {
    loadingRef.current.continuousStart();
    setStage(3);

    if (paymentType === "card" && gatewayType === "stripe") {
      try {
        console.log("🟢 Stripe customer_info:", contact);

        const response = await fetch(`${import.meta.env.VITE_BACKEND}/payment/stripe/checkout-session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart_items: cart_items.map((item) => ({
              name: item.name,
              price: item.price,
              qty: item.qty ?? item.quantity ?? 1,
            })),
            customer_info: {
              name: contact.name ?? "Guest",
              email: contact.email ?? "guest@example.com",
              phone: contact.phone ?? "9800000000",
            },
          }),
        });

        const data = await response.json();
        if (data.url) {
          localStorage.setItem("contactFormDetails", JSON.stringify(contactFormDetails));
          localStorage.setItem("shippingAddressFormDetails", JSON.stringify(shippingAddressFormDetails));
          localStorage.setItem("billingAddressFormDetails", JSON.stringify(billingAddressFormDetails));
          localStorage.setItem("cart_items", JSON.stringify(cart_items));

          window.location.href = data.url;
        } else {
          toast.error("Failed to initiate Stripe payment.");
        }
      } catch (err) {
        toast.error("Error initiating Stripe payment.");
      } finally {
        loadingRef.current.complete();
      }
    } else if (paymentType === "cod") {
      console.log("COD AMOUNT ->", totalamount);
      const coddata = await codCheckout(
        totalamount,
        {
          contact: contact,
          shippingaddress: shippingAddressFormDetails,
          billingaddress: billingAddressFormDetails,
          paymentType,
          gatewayType,
        },
        cart_items
      );
      window.location.replace(coddata?.redirectUrl);
    }
  }

  return (
    <React.Fragment>
      <LoadingBar color="#003E29" ref={loadingRef} shadow={true} />
      <div className="space-y-5">
        <button onClick={() => setStage(2)}>Back</button>
        <FormProvider {...methods} setValue={setValue}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Choose how you'd like to pay.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="paymenttype"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            className="grid grid-cols-2 gap-4"
                            onValueChange={(value) => {
                              setPaymentmode(value);
                              field.onChange(value);
                            }}
                            defaultValue={field.value}
                            {...field}
                          >
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem
                                  value="card"
                                  id="card"
                                  className="peer sr-only"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor="card"
                                className="flex flex-col items-center justify-between gap-2 rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <CreditCard size={36} color="#121212" />
                                Card
                              </FormLabel>
                            </FormItem>

                            <FormItem>
                              <FormControl>
                                <RadioGroupItem
                                  value="cod"
                                  id="cod"
                                  className="peer sr-only"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor="cod"
                                className="flex flex-col items-center justify-between gap-2 rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Money size={36} color="#121212" />
                                Cash on Delivery
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {paymentmode === "card" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Choose Gateway</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="gateway"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              className="flex flex-row gap-3"
                              onValueChange={(value) => {
                                setGatewayselection(value);
                                field.onChange(value);
                              }}
                              defaultValue={field.value}
                              {...field}
                            >
                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem
                                    value="stripe"
                                    id="stripe"
                                    className="peer sr-only"
                                  />
                                </FormControl>
                                <FormLabel
                                  htmlFor="stripe"
                                  className="flex flex-col items-center justify-between gap-2 rounded-md border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <img
                                    src={stripelogo}
                                    alt="Stripe Payment Gateway"
                                    className="h-10 w-48 bg-cover"
                                  />
                                  Stripe
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              <div className="float-right">
                <Button variant="outline" type="submit" disabled={!paymentmode}>
                  Place Order
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </div>
    </React.Fragment>
  );
}

export default PaymentSelect;
