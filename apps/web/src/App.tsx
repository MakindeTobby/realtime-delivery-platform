// routes/index.tsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { RestaurantAreaGuard } from "@/pages/restaurants/dashboard/RestaurantAreaGuard";
import { RestaurantDashboardLayout } from "@/pages/restaurants/dashboard/RestaurantDashboardLayout";
import { AdminAreaGuard } from "@/pages/admin/AdminAreaGuard";
import NotFound from "@/pages/404";
import Forbidden from "@/pages/403";

const PartnerPage = lazy(() => import("@/pages/partner"));
const RestaurantPage = lazy(() => import("@/pages/restaurants"));
const DriverPage = lazy(() => import("@/pages/drivers"));
const LoginPage = lazy(() => import("@/pages/login"));
const RoleLandingPage = lazy(() => import("@/pages/dashboard/RoleLandingPage"));
const CustomerPortalPage = lazy(() => import("@/pages/dashboard/CustomerPortalPage"));
const RestaurantOverviewPage = lazy(() => import("@/pages/restaurants/dashboard/RestaurantOverviewPage"));
const RestaurantOrdersPage = lazy(() => import("@/pages/restaurants/dashboard/RestaurantOrdersPage"));
const RestaurantMenuPage = lazy(() => import("@/pages/restaurants/dashboard/RestaurantMenuPage"));
const RestaurantProfilePage = lazy(() => import("@/pages/restaurants/dashboard/RestaurantProfilePage"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <span className="loader"></span>
        </div>
      }
    >
      <Routes>
        <Route index element={<PartnerPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="dashboard" element={<RoleLandingPage />} />
        <Route path="customer" element={<CustomerPortalPage />} />
        <Route path="admin" element={<AdminAreaGuard />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
        <Route path="restaurant" element={<RestaurantAreaGuard />}>
          <Route element={<RestaurantDashboardLayout />}>
            <Route path="dashboard" element={<RestaurantOverviewPage />} />
            <Route path="orders" element={<RestaurantOrdersPage />} />
            <Route path="menu" element={<RestaurantMenuPage />} />
            <Route path="profile" element={<RestaurantProfilePage />} />
          </Route>
        </Route>
        <Route path="partner" element={<Outlet />}>
          <Route path="restaurants" element={<RestaurantPage />} />
          <Route path="drivers" element={<DriverPage />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="/403" element={<Forbidden />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
