import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// ✅ অবশ্যই react-router-dom থেকে নিবেন
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Routes";

import AuthProvider from "./providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
