import React from "react";

const AssignmentInvoice = ({ assignment, invoiceRef }) => {
  if (!assignment) return null;

  const customer = assignment.bookingId?.customerId || {};
  const technician = assignment.technicianId || {};
  const booking = assignment.bookingId || {};
  const subServices = booking.subServiceIds || [];
  const payment = assignment.paymentCollection || {};
  const treatmentPreparation = assignment.treatmentPreparation || [];
  console.log(treatmentPreparation);
  const total =
    payment.amount ||
    subServices.reduce(
      (sum, s) => sum + (s.serviceId?.startingPrice || 0),
      0
    );

  const amount = total;

  const cgst = amount * 0.09;
  const sgst = amount * 0.09;

  const grandTotal = amount + cgst + sgst;
  const numberToWords = (num) => {
    if (num === 0) return "";

    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
      "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];

    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    if (num < 20) return ones[num];
    if (num < 100)
      return (tens[Math.floor(num / 10)] + " " + numberToWords(num % 10)).trim();
    if (num < 1000)
      return (ones[Math.floor(num / 100)] + " Hundred " + numberToWords(num % 100)).trim();
    if (num < 100000)
      return (numberToWords(Math.floor(num / 1000)) + " Thousand " + numberToWords(num % 1000)).trim();
    if (num < 10000000)
      return (numberToWords(Math.floor(num / 100000)) + " Lakh " + numberToWords(num % 100000)).trim();
  };

  return (
    <div
      ref={invoiceRef}
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "40px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        background: "#ffffff",
        color: "#000000",
        boxSizing: "border-box",
        margin: "0 auto",
        boxShadow: "0 0 20px rgba(0,0,0,0.1)",
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
          paddingTop: "100px",
        }}
      >


        <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
          <h2 style={{ margin: 0, fontWeight: "bold" }}>Pest Control Services</h2>
          <span>59 A kutchery road Ajmer.</span>
          <span><b >Commercial  Pest Control Lic. No. </b>AJ/Pco/RWL/2017/1</span>
          <span><b >pesticides Lic. No. </b>AJ/P.P./Reg 2014-2015/8</span>
          <span><b >State Code : </b>08 Rajsthan ,305001</span>
          <span><b >GST : </b>08ACXPS9273Q1Z0</span>

          <span><b >Phone No. </b>9829070419</span>
          <span><b >Email :</b>pestcontrol_9@yahoo.com</span>
          <span><b>websites : </b><a href="https://pestcontrolonline.in"> pestcontrolonline.in</a></span>

        </div>
        <img
          src="/images/pest_control_logo1.png"
          alt="logo"
          style={{ height: "150px" }}
        />
      </div>
      <div style={{ width: "100%", height: "1px", marginTop: "10px", display: "flex", justifyContent: "center" }}>  <span style={{ fontWeight: "bold", fontSize: "20px", textAlign: "center" }}>INVOICE</span></div>
      {/* Billing Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px",
        }}
      >
        <div style={{ width: "48%" }}>
          <strong>Billing Details</strong>
          <p style={{ margin: 0 }}><strong >Customer Name : </strong> {customer.fullName}</p>
          <p style={{ margin: 0 }}><strong >Email : </strong>{customer.email}</p>
          <p style={{ margin: 0 }}><strong >Mobile No : </strong>{customer.mobileNo}</p>
          <p style={{ margin: 0 }}><strong >Address : </strong>{booking.additionalAddress}</p>
        </div>

        <div style={{ width: "48%", textAlign: "right" }}>

          <p style={{ margin: 0 }}>
            <strong> Invoice No : </strong> {assignment.invoiceNo || "N/A"}
          </p>
          <p style={{ margin: 0 }}>
            <strong> Date : </strong> {new Date(Date.now()).getDate() + "/" + new Date(Date.now()).getMonth() + "/" + new Date(Date.now()).getFullYear() || "N/A"}
          </p>
        </div>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "10px"
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #000", padding: "5px" }}>S.No</th>
            <th style={{ border: "1px solid #000", padding: "5px" }}>Chemicals</th>
            <th style={{ border: "1px solid #000", padding: "5px" }}>Quantity</th>
          </tr>
        </thead>

        <tbody>
          {treatmentPreparation?.map((item, index) => (
            <tr key={item._id}>
              <td style={{ border: "1px solid #000", padding: "5px", textAlign: "center" }}>
                {index + 1}
              </td>
              <td style={{ border: "1px solid #000", padding: "5px" }}>
                {item.chemicals}
              </td>
              <td style={{ border: "1px solid #000", padding: "5px", textAlign: "right" }}>
                {item.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
          border: "1px solid #000",

        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "3fr 3fr 3fr 1fr", fontSize: "14px" }}>

          {/* Bank Details */}
          <div style={{ borderRight: "1px solid #000", textAlign: "left", padding: "5px" }}>
            <p><strong>Bank Details :</strong></p>
            <p><strong>Bank Name :</strong> IDBI Bank</p>
            <p><strong>Branch :</strong> Jaipur Road</p>
            <p><strong>Account No:</strong> 091102000001267</p>
            <p><strong>IFSC Code :</strong> IBKL0000911</p>
          </div>

          {/* Amount in words */}
          <div style={{ borderRight: "1px solid #000", textAlign: "left", padding: "5px" }}>
            <p><strong>Total Invoice Amount in Words :</strong></p>
            <p>{numberToWords(Math.round(grandTotal))} Rupees Only</p>
          </div>

          {/* Labels */}
          <div style={{ borderRight: "1px solid #000", textAlign: "right" }}>
            <p style={{ border: "1px solid #000", padding: "5px" }}>
              <strong>Total Amount Before Tax (₹)</strong>
            </p>
            <p style={{ border: "1px solid #000", padding: "5px" }}>
              <strong>Add CGST (9%) (₹)</strong>
            </p>
            <p style={{ border: "1px solid #000", padding: "5px" }}>
              <strong>Add SGST (9%) (₹)</strong>
            </p>
            <p style={{ border: "1px solid #000", borderBottom: "none", padding: "5px" }}>
              <strong>Grand Total (₹)</strong>
            </p>
          </div>

          {/* Values */}
          <div style={{ textAlign: "right" }}>
            <p style={{ padding: "5px", border: "0.5px solid #000" }}><strong>₹{total.toFixed(2)}</strong></p>
            <p style={{ padding: "5px", border: "0.5px solid #000" }}><strong>₹{cgst.toFixed(2)}</strong></p>
            <p style={{ padding: "5px", border: "0.5px solid #000" }}><strong>₹{sgst.toFixed(2)}</strong></p>
            <p style={{ padding: "5px", border: "0.5px solid #000" }}><strong>₹{grandTotal.toFixed(2)}</strong></p>
          </div>



        </div>
        <div
          style={{

            border: "1px solid #000",
            textAlign: "left",

          }}
        >
          <strong>Terms & Conditions :</strong>
          <ul> <li> Payment should be made within 30 days of the invoice date.</li></ul>

          <br />
          <strong>Note:</strong> (bill for  the month of  January {new Date().getFullYear()})
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: "1px solid #000",
            minHeight: "150px"
          }}
        >
          <div
            style={{
              borderRight: "1px solid #000",
              display: "flex",
              justifyContent: "flex-end",
              padding: "10px"
            }}
          >
            <img src="/images/pest_control_logo1.png" style={{ height: "100px" }} />
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "1px  ",
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <img src="/images/pest_control_logo1.png" style={{ height: "100px" }} />
            <p><strong>Authorized Signatory</strong></p>
          </div>
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