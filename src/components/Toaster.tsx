"use client";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* App-wide toast host. Styling is driven by the same tokens as the rest of
   the UI so notifications look native rather than bolted on. */
export default function Toaster() {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={2600}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
      />
      <style jsx global>{`
        .Toastify__toast {
          border-radius: 8px;
          font-family: var(--font-sans);
          font-size: 14px;
          min-height: 52px;
          box-shadow: 0 8px 24px rgba(43, 52, 69, 0.18);
        }
        .Toastify__toast-body {
          color: var(--color-heading);
          font-weight: 500;
        }
        .Toastify__toast--success .Toastify__toast-icon svg {
          fill: #16a34a;
        }
        .Toastify__toast--error .Toastify__toast-icon svg {
          fill: var(--color-primary);
        }
      `}</style>
    </>
  );
}
