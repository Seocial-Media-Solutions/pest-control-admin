import React from "react";

const AssignmentInvoice = ({ assignment, invoiceRef }) => {
  if (!assignment) return null;

  const customer = assignment.bookingId?.customerId || {};
  const technician = assignment.technicianId || {};
  const booking = assignment.bookingId || {};
  const subServices = booking.subServiceIds || [];
  const payment = assignment.paymentCollection || {};

  const total =
    payment.amount ||
    subServices.reduce(
      (sum, s) => sum + (s.serviceId?.startingPrice || 0),
      0
    );

  return (
    <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
      <div
        ref={invoiceRef}
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "25px",
          fontFamily: "Arial, sans-serif",
          background: "#ffffff",
          color: "#000000",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "2px solid #000",
            paddingBottom: "10px",
          }}
        >
          <img
            src="/images/pest_control_logo.png"
            alt="logo"
            style={{ height: "100px" }}
          />

          <div style={{ textAlign: "right" }}>
            <h2 style={{ margin: 0 }}>INVOICE</h2>
            <p style={{ margin: 0, fontSize: "12px" }}>
              Booking ID: #{booking._id?.slice(-6)}
            </p>
          </div>
        </div>

        {/* Billing Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <div style={{ width: "48%" }}>
            <strong>Billed To</strong>
            <p style={{ margin: 0 }}>{customer.fullName}</p>
            <p style={{ margin: 0 }}>{customer.email}</p>
            <p style={{ margin: 0 }}>{customer.mobileNo}</p>
          </div>

          <div style={{ width: "48%", textAlign: "right" }}>
            <strong>Service Details</strong>
            <p style={{ margin: 0 }}>
              Technician: {technician.fullName || "N/A"}
            </p>
            <p style={{ margin: 0 }}>
              Category: {booking.serviceId?.title || "Service"}
            </p>
          </div>
        </div>

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={th}>Description</th>
              <th style={th}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {subServices.length > 0 ? (
              subServices.map((sub, i) => (
                <tr key={i}>
                  <td style={td}>{sub.serviceId?.title}</td>
                  <td style={{ ...td, textAlign: "right" }}>
                    ₹{sub.serviceId?.startingPrice}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={td}>Service Charge</td>
                <td style={{ ...td, textAlign: "right" }}>₹{total}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "20px",
          }}
        >
          <div style={{ width: "250px", border: "1px solid #000" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px",
                borderBottom: "1px solid #000",
              }}
            >
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px",
                fontWeight: "bold",
              }}
            >
              <span>Total Paid</span>
              <span>₹{total}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #000",
            padding: "10px",
          }}
        >
          <strong>Payment Method:</strong> {payment.paymentMethod}
          <br />
          <strong>Status:</strong> {payment.paymentStatus}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            fontSize: "11px",
            borderTop: "1px solid #000",
            paddingTop: "10px",
          }}
        >
          Thank you for your business
        </div>
      </div>
    </div>
  );
};

const th = {
  border: "1px solid #000",
  padding: "8px",
  textAlign: "left",
};

const td = {
  border: "1px solid #000",
  padding: "8px",
};

export default AssignmentInvoice;