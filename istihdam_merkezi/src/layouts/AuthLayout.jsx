import { Outlet } from "react-router-dom";
import { ToastContainer } from "../components/ui";
import { PageWrapper } from "../components/common";

/**
 * Auth Layout
 * Used for authentication pages (login, register, forgot password)
 * Pages now have their own full-screen layouts, so this is minimal
 */
const AuthLayout = () => {
  return (
    <>
      <PageWrapper>
        <Outlet />
      </PageWrapper>
      <ToastContainer />
    </>
  );
};

export default AuthLayout;
