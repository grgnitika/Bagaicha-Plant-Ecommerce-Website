import React, { useState } from "react";
import zxcvbn from "zxcvbn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState(null);

  const getStrengthLabel = (score) => {
    switch (score) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    const evaluation = zxcvbn(value);
    setStrength(evaluation.score);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New and confirm passwords do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}update-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });


      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStrength(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto py-10">
      <div>
        <Label>Current Password</Label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>New Password</Label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => handlePasswordChange(e.target.value)}
          required
        />
        {newPassword && (
          <p className="text-sm mt-1">
            Strength:{" "}
            <span
              className={
                strength >= 3 ? "text-green-600" : "text-red-500"
              }
            >
              {getStrengthLabel(strength)}
            </span>
          </p>
        )}
      </div>
      <div>
        <Label>Confirm New Password</Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Update Password</Button>
    </form>
  );
}

export default UpdatePassword;
