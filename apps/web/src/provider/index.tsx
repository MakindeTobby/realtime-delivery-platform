import React from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { Toaster } from "react-hot-toast";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // const defaultOpen = getCookie("sidebar_state") !== "false";
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>

      {/* Sonner toasts */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toasterId="default"
        toastOptions={{
          // Define default options
          className: "",
          duration: 5000,
          removeDelay: 1000,
          style: {
            // background: "#363636",
            // color: "#fff",
            fontSize: 13,
          },

          // Default options for specific types
          // success: {
          //   duration: 3000,
          //   iconTheme: {
          //     primary: "green",
          //     secondary: "black",
          //   },
          // },
        }}
      />
    </QueryClientProvider>
  );
}
