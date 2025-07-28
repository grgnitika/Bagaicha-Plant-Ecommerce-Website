// // import React, { useEffect } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useNavigate } from "react-router-dom";
// // import { useForm, FormProvider } from "react-hook-form";
// // import { zodResolver } from "@hookform/resolvers/zod";

// // import { loginFormSchema } from "../../common/AuthModal/util";

// // import { adminLogin } from "@/features/auth/adminauthSlices";

// // import {
// //   Form,
// //   FormControl,
// //   FormField,
// //   FormItem,
// //   FormLabel,
// //   FormMessage,
// // } from "@/components/ui/form";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";

// // import DestructiveCallout from "../../Callout/DestructiveCallout";

// // import { ArrowClockwise } from "@phosphor-icons/react";
// // import { PasswordInput } from "../../inputfield/PasswordInput";
// // import { toast } from "sonner";

// // let buttonContent;

// // function AdminAuthForm() {
// //   const form = useForm({
// //     resolver: zodResolver(loginFormSchema),
// //     mode: "onChange",
// //   });

// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();

// //   const { methods, setValue } = form;

// //   const { adminData, isLoading, isError, isSuccess, message } = useSelector(
// //     (state) => state.adminAuth
// //   );

// //   useEffect(() => {
// //     if (adminData?.isAdmin && isSuccess) {
// //       navigate("/admin/dashboard");
// //     }
// //   }, [
// //     adminData,
// //     isSuccess,
// //     message,
// //     isLoading,
// //     navigate,
// //     adminLogin,
// //     dispatch,
// //   ]);

// //   async function onSubmit(data) {
// //     try {
// //       const promiseResult = await dispatch(
// //         adminLogin({ email: data.email, password: data.password })
// //       ).unwrap();

// //       if (promiseResult) {
// //         toast.success("Successful Signed in!");
// //       }
// //     } catch (error) {
      
// //     }
// //   }

// //   if (isLoading) {
// //     buttonContent = (
// //       <Button className="w-full" disabled>
// //         <ArrowClockwise
// //           size={32}
// //           color="#003E29"
// //           className="mr-2 animate-spin"
// //         />
// //         Signing in
// //       </Button>
// //     );
// //   } else {
// //     buttonContent = (
// //       <Button className="w-full" type="submit">
// //         Sign in
// //       </Button>
// //     );
// //   }

// //   return (
// //     <FormProvider {...methods} setValue={setValue}>
// //       {isError && <DestructiveCallout title="Error" message={message} />}
// //       <Form {...form}>
// //         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
// //           <div className="grid gap-4">
// //             <div className="grid gap-2">
// //               <FormField
// //                 control={form.control}
// //                 name="email"
// //                 render={({ field }) => (
// //                   <FormItem>
// //                     <FormLabel>Email</FormLabel>
// //                     <FormControl>
// //                       <Input
// //                         placeholder="m@example.com"
// //                         {...field}
// //                         value={field.value || ""}
// //                         type="email"
// //                       />
// //                     </FormControl>
// //                     <FormMessage />
// //                   </FormItem>
// //                 )}
// //               />
// //             </div>
// //             <div className="grid gap-2">
// //               <FormField
// //                 control={form.control}
// //                 name="password"
// //                 render={({ field }) => (
// //                   <FormItem>
// //                     <FormLabel>Password</FormLabel>
// //                     <FormControl>
// //                       <PasswordInput
// //                         id="password"
// //                         {...field}
// //                         value={field.value || ""}
// //                       />
// //                     </FormControl>
// //                     <FormMessage />
// //                   </FormItem>
// //                 )}
// //               />
// //             </div>
// //           </div>
// //           {buttonContent}
// //         </form>
// //       </Form>
// //     </FormProvider>
// //   );
// // }

// // export default AdminAuthForm;

// import React, { useEffect, useState } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";
// import { toast } from "sonner";
// import { loginFormSchema } from "../../common/AuthModal/util";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { PasswordInput } from "../../inputfield/PasswordInput";

// // ✅ Set API base URL from .env
// const BASE_URL = import.meta.env.VITE_ADMIN_AUTH_API_URL;

// function AdminAuthForm() {
//   const [step, setStep] = useState(1);
//   const [adminEmail, setAdminEmail] = useState("");

//   const form = useForm({
//     resolver: zodResolver(loginFormSchema),
//     mode: "onChange",
//   });

//   const otpForm = useForm({
//     defaultValues: { token: "" },
//   });

//   const handleLoginStepOne = async (data) => {
//     try {
//       await axios.post(`${BASE_URL}login-step1`, data); // ✅ Fixed
//       setAdminEmail(data.email);
//       setStep(2);
//       toast.success("OTP sent to your authenticator app.");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed.");
//     }
//   };

//   const handleLoginStepTwo = async (otpData) => {
//     try {
//       const response = await axios.post(`${BASE_URL}login-step2`, {
//         email: adminEmail,
//         token: otpData.token,
//       });

//       const { token } = response.data;
//       localStorage.setItem("adminToken", token);
//       toast.success("Admin login successful!");
//       window.location.href = "/admin/dashboard";
//     } catch (error) {
//       toast.error(error.response?.data?.message || "OTP verification failed.");
//     }
//   };

//   return (
//     <>
//       {step === 1 && (
//         <FormProvider {...form}>
//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit(handleLoginStepOne)}
//               className="space-y-4"
//             >
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input type="email" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <PasswordInput {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <Button type="submit" className="w-full">
//                 Continue to OTP
//               </Button>
//             </form>
//           </Form>
//         </FormProvider>
//       )}

//       {step === 2 && (
//         <FormProvider {...otpForm}>
//           <Form {...otpForm}>
//             <form
//               onSubmit={otpForm.handleSubmit(handleLoginStepTwo)}
//               className="space-y-4"
//             >
//               <FormField
//                 control={otpForm.control}
//                 name="token"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Enter OTP</FormLabel>
//                     <FormControl>
//                       <Input placeholder="6-digit code" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <Button type="submit" className="w-full">
//                 Verify & Login
//               </Button>
//             </form>
//           </Form>
//         </FormProvider>
//       )}
//     </>
//   );
// }

// export default AdminAuthForm;

// import React, { useEffect, useState } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";
// import { toast } from "sonner";
// import { loginFormSchema } from "../../common/AuthModal/util";

// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { PasswordInput } from "../../inputfield/PasswordInput";

// // ✅ Set API base URL from .env
// const BASE_URL = import.meta.env.VITE_ADMIN_AUTH_API_URL;

// function AdminAuthForm() {
//   const [step, setStep] = useState(1);
//   const [tempAdminId, setTempAdminId] = useState(""); // ✅ Store tempAdminId

//   const form = useForm({
//     resolver: zodResolver(loginFormSchema),
//     mode: "onChange",
//   });

//   const otpForm = useForm({
//     defaultValues: { otp: "" },
//   });

//   // ✅ Step 1: Email + Password
//   const handleLoginStepOne = async (data) => {
//     try {
//       const res = await axios.post(`${BASE_URL}login-step1`, data);
//       setTempAdminId(res.data.tempAdminId); // ✅ Capture admin ID
//       setStep(2);
//       toast.success("OTP sent to your authenticator app.");
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Login failed.");
//     }
//   };

//   // ✅ Step 2: OTP Verification
//   const handleLoginStepTwo = async (otpData) => {
//     try {
//       const response = await axios.post(`${BASE_URL}login-step2`, {
//         tempAdminId: tempAdminId,
//         otp: otpData.otp, // ✅ Correct key name
//       });

//       const { token } = response.data;
//       localStorage.setItem("adminToken", token);
//       toast.success("Admin login successful!");
//       window.location.href = "/admin/dashboard";
//     } catch (error) {
//       toast.error(error.response?.data?.message || "OTP verification failed.");
//     }
//   };

//   return (
//     <>
//       {step === 1 && (
//         <FormProvider {...form}>
//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit(handleLoginStepOne)}
//               className="space-y-4"
//             >
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email</FormLabel>
//                     <FormControl>
//                       <Input type="email" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <PasswordInput {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <Button type="submit" className="w-full">
//                 Continue to OTP
//               </Button>
//             </form>
//           </Form>
//         </FormProvider>
//       )}

//       {step === 2 && (
//         <FormProvider {...otpForm}>
//           <Form {...otpForm}>
//             <form
//               onSubmit={otpForm.handleSubmit(handleLoginStepTwo)}
//               className="space-y-4"
//             >
//               <FormField
//                 control={otpForm.control}
//                 name="otp"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Enter OTP</FormLabel>
//                     <FormControl>
//                       <Input placeholder="6-digit code" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <Button type="submit" className="w-full">
//                 Verify & Login
//               </Button>
//             </form>
//           </Form>
//         </FormProvider>
//       )}
//     </>
//   );
// }

// export default AdminAuthForm;


import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { loginFormSchema } from "../../common/AuthModal/util";
import { jwtDecode } from "jwt-decode"; // ✅ Added

// Redux
import { useDispatch } from "react-redux";
import { setAdmin } from "../../../features/auth/adminAuthSlices";
import { useNavigate } from "react-router-dom"; // ✅ Added

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "../../inputfield/PasswordInput";

const BASE_URL = import.meta.env.VITE_ADMIN_AUTH_API_URL;

function AdminAuthForm() {
  const [step, setStep] = useState(1);
  const [tempAdminId, setTempAdminId] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Used for redirection

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
  });

  const otpForm = useForm({
    defaultValues: { otp: "" },
  });

  // ✅ Step 1: Login with Email + Password
  const handleLoginStepOne = async (data) => {
    try {
      const res = await axios.post(`${BASE_URL}login-step1`, data);
      if (res.data.tempAdminId) {
        setTempAdminId(res.data.tempAdminId);
        setStep(2);
        toast.success("OTP sent to your authenticator app.");
      } else {
        toast.error("Login response missing admin ID.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed.");
    }
  };

  // ✅ Step 2: Verify OTP, Save Token, Decode, Dispatch, Navigate
  const handleLoginStepTwo = async (otpData) => {
    try {
      const res = await axios.post(`${BASE_URL}login-step2`, {
        tempAdminId: tempAdminId,
        otp: otpData.otp,
      });

      const { token } = res.data;

      if (token) {
        // ✅ Save token
        localStorage.setItem("admin-token", token);

        // ✅ Decode token
        const decoded = jwtDecode(token);

        // ✅ Dispatch decoded data to Redux
        dispatch(setAdmin({
          _id: decoded._id,
          email: decoded.email,
          isAdmin: decoded.isAdmin,
        }));

        toast.success("Admin login successful!");

        // ✅ Redirect using navigate
        navigate("/admin/dashboard");
      } else {
        toast.error("No token received from server.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed.");
    }
  };

  return (
    <>
      {step === 1 && (
        <FormProvider {...form}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLoginStepOne)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Continue to OTP
              </Button>
            </form>
          </Form>
        </FormProvider>
      )}

      {step === 2 && (
        <FormProvider {...otpForm}>
          <Form {...otpForm}>
            <form
              onSubmit={otpForm.handleSubmit(handleLoginStepTwo)}
              className="space-y-4"
            >
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enter OTP</FormLabel>
                    <FormControl>
                      <Input placeholder="6-digit code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Verify & Login
              </Button>
            </form>
          </Form>
        </FormProvider>
      )}
    </>
  );
}

export default AdminAuthForm;

