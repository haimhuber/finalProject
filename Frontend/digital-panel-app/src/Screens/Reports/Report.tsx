import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getLiveData } from "../../Types/CombinedData";

const Report = () => {
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<any[]>([]);

  const fetchAlerts = async () => {
    try {
      const response = await getLiveData();
      setData(response ?? []);
      console.log(response);
      
    } catch (err) {
      console.error("Failed to fetch alerts", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const generatePDF = () => {
    const element = reportRef.current;
    if (!element) return;

    html2canvas(element, { scrollY: -window.scrollY }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("report.pdf");
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        ref={reportRef}
        style={{
          padding: 20,
          background: "#403b3bff",
          borderRadius: 8,
          width: "100%",
          maxWidth: 600,

          // ⭐ Fix: allow scrolling ⭐
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {data.map((curr, index) => (
          <div key={index}>
            <p>Alert ID: {curr}</p>
          </div>
        ))}
      </div>

      <br />

      <button onClick={generatePDF} style={{ padding: "10px 20px" }}>
        Download PDF
      </button>
    </div>
  );
};

export default Report;
