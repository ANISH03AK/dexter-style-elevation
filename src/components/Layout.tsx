import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode; transparentNav?: boolean }) => (
  <div className="min-h-screen flex flex-col bg-background">
    <Navbar />
    <main>{children}</main>
    <Footer />
  </div>
);

export default Layout;
