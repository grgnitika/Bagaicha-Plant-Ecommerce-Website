import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";
import { loginFormSchema } from "../../common/AuthModal/util";
import { jwtDecode } from "jwt-decode"; 

import { useDispatch } from "react-redux";
import { setAdmin } from "../../../features/auth/adminAuthSlices";
import { useNavigate } from "react-router-dom";

// CSRF Helpers
import { fetchCsrfToken, getCsrfHeader } from "@/lib/http";

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
  const navigate = useNavigate();

   // Fetch CSRF token
  useEffect(() => {
    fetchCsrfToken().catch(() =>
      toast.error("Failed to fetch CSRF token")
    );
  }, []);

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
  });

  const otpForm = useForm({
    defaultValues: { otp: "" },
  });

  // Login with Email + Password
  const handleLoginStepOne = async (data) => {
  try {
    const res = await axios.post(`${BASE_URL}login-step1`, data, {
      headers: {
        ...getCsrfHeader(),
      },
      withCredentials: true,
    });

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


  // Verify OTP, Save Token, Decode, Dispatch, Navigate
  const handleLoginStepTwo = async (otpData) => {
  try {
    const res = await axios.post(`${BASE_URL}login-step2`, {
      tempAdminId: tempAdminId,
      otp: otpData.otp,
    }, {
      headers: {
        ...getCsrfHeader(),
      },
      withCredentials: true,
    });

    const { token } = res.data;

    if (token) {
      localStorage.setItem("admin-token", token);
      const decoded = jwtDecode(token);

      dispatch(setAdmin({
        _id: decoded._id,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
      }));

      toast.success("Admin login successful!");
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

