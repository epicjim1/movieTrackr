import Navbar from "./Navbar";
import PropTypes from "prop-types";
import { Analytics } from "@vercel/analytics/react";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>
        {children}
        <Analytics />
      </main>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
