import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children, transparentNav = false }: { children: ReactNode; transparentNav?: boolean }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className={transparentNav ? "" : "pt-24"}>{children}</main>
    <Footer />
  </div>
);

export default Layout;
