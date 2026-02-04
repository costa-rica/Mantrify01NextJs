"use client";

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { register } from "@/lib/api/auth";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from "@/lib/utils/validation";

interface ModalRegisterProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function ModalRegister({
  isOpen,
  onClose,
  onSwitchToLogin,
}: ModalRegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setSuccessMessage("");
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    // Validate email
    if (!validateEmail(normalizedEmail)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setErrors({ password: passwordValidation.message });
      return;
    }

    // Validate password match
    const passwordMatchValidation = validatePasswordMatch(
      password,
      confirmPassword,
    );
    if (!passwordMatchValidation.valid) {
      setErrors({ confirmPassword: passwordMatchValidation.message });
      return;
    }

    setIsLoading(true);

    try {
      await register({ email: normalizedEmail, password });

      // Show success message
      setSuccessMessage(
        "Registration successful! Please check your email to verify your account before logging in.",
      );

      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Automatically switch to login after 3 seconds
      timeoutRef.current = setTimeout(() => {
        onSwitchToLogin();
      }, 3000);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrors({ general: "An account with this email already exists" });
      } else if (error.response?.data?.error?.message) {
        setErrors({ general: error.response.data.error.message });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-calm-900/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-calm-400 hover:text-calm-600 transition"
          aria-label="Close modal"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal header */}
        <h2 className="mb-6 text-2xl font-display font-bold text-calm-900">
          Create Account
        </h2>

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error message */}
        {errors.general && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        {/* Register form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label
              htmlFor="register-email"
              className="block text-sm font-medium text-calm-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="register-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field ${errors.email ? "border-red-500" : ""}`}
              placeholder="you@example.com"
              disabled={isLoading || !!successMessage}
              autoComplete="email"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="register-password"
              className="block text-sm font-medium text-calm-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="register-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input-field ${errors.password ? "border-red-500" : ""}`}
              placeholder="••••••••"
              disabled={isLoading || !!successMessage}
              autoComplete="new-password"
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
            <p className="mt-1 text-xs text-calm-500">Minimum 6 characters</p>
          </div>

          {/* Confirm password field */}
          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-calm-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input-field ${errors.confirmPassword ? "border-red-500" : ""}`}
              placeholder="••••••••"
              disabled={isLoading || !!successMessage}
              autoComplete="new-password"
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Register button */}
          <button
            type="submit"
            disabled={isLoading || !!successMessage}
            className="btn-primary w-full"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        {/* Login link */}
        {!successMessage && (
          <div className="mt-6 text-center text-sm text-calm-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
