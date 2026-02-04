"use client";

import { useEffect, useState, type FormEvent, type MouseEvent } from "react";
import { useAppDispatch } from "@/store/hooks";
import { login as loginAction } from "@/store/features/authSlice";
import { login } from "@/lib/api/auth";
import { validateEmail, validatePassword } from "@/lib/utils/validation";

interface ModalLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export default function ModalLogin({
  isOpen,
  onClose,
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: ModalLoginProps) {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

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

    setIsLoading(true);

    try {
      const response = await login({ email: normalizedEmail, password });

      // Update Redux state
      dispatch(
        loginAction({
          user: response.user,
          accessToken: response.accessToken,
        }),
      );

      // Reset form and close modal
      setEmail("");
      setPassword("");
      onClose();
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrors({ general: "Invalid email or password" });
      } else if (error.response?.status === 403) {
        setErrors({ general: "Please verify your email before logging in" });
      } else if (error.response?.data?.error?.message) {
        setErrors({ general: error.response.data.error.message });
      } else {
        setErrors({ general: "Login failed. Please try again." });
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
          Welcome Back
        </h2>

        {/* Error message */}
        {errors.general && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-calm-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-field ${errors.email ? "border-red-500" : ""}`}
              placeholder="you@example.com"
              disabled={isLoading}
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
              htmlFor="password"
              className="block text-sm font-medium text-calm-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input-field ${errors.password ? "border-red-500" : ""}`}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Forgot password link */}
          <div className="text-right">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Forgot password?
            </button>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Register link */}
        <div className="mt-6 text-center text-sm text-calm-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
