import { Navigate, createBrowserRouter } from "react-router-dom";
import { PublicOnlyRoute } from "@/features/auth/PublicOnlyRoute";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { AuthenticatedAppLayout } from "@/layouts/AuthenticatedAppLayout/AuthenticatedAppLayout";
import { AuthLayout } from "@/layouts/AuthLayout/AuthLayout";
import { HomePage } from "@/pages/HomePage/HomePage";
import { LoginPage } from "@/pages/LoginPage/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage/RegisterPage";

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/login",
            element: <LoginPage />,
          },
          {
            path: "/register",
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthenticatedAppLayout />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate replace to="/" />,
  },
]);
