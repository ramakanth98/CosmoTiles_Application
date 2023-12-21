import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import axios from 'axios';
import './report.css';



const initialRowData = [
    // Assuming this structure based on your description
    // Repeat this for each table with appropriate WorkName and Price
    { workName: 'shower wall', sqft: "", price: 10, total: 0 },
        { workName: 'Accent/2nd Gount', sqft: "", price: 100, total: 0 },
        { workName: 'Bench Seat', sqft: "", price: 100, total: 0 },
        { workName: 'Better Bench', sqft: "", price: 100, total: 0 },
        { workName: 'Corner Shelf', sqft: "", price: 100, total: 0 },
        { workName: 'Single Niche', sqft: "", price: 100, total: 0 },
        { workName: 'Combo Niche', sqft: "", price: 100, total: 0 },
        { workName: 'XL Niche', sqft: "", price: 100, total: 0 },
        { workName: 'Shower Floor', sqft: "", price: 100, total: 0 },
        { workName: 'Shower Drain Grind', sqft: "", price: 100, total: 0 },
        { workName: 'Floor Tile', sqft: "", price: 100, total: 0 },
        { workName: 'Windows/Jambs', sqft: "", price: 100, total: 0 },
];

const initialKitchenData = [
  { workName: 'Material Handling Fees', sqft: "", price: 150, total: 0 },
  { workName: 'Great Room FirePlace', sqft: "", price: 120, total: 0 },
  { workName: 'Laundry', sqft: "", price: 150, total: 0 },
  { workName: 'Extra:', sqft: "", price: 120, total: 0 },

];

const initialTablesData = new Array(6).fill(null).map(() => initialRowData.map(row => ({ ...row })));

//const puppeteer = require('puppeteer');

/*async function printPDF() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/report', { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();
  return pdf;
}*/


const Report = () => {
  const [tables, setTables] = useState(initialTablesData);
  const [kitchenTable, setKitchenTable] = useState(initialKitchenData);
  let { homeId } = useParams();

  const handleSqftChange = (tableIndex, rowIndex, value) => {
    const updatedTables = tables.map((table, tIndex) => {
      if (tIndex === tableIndex) {
        return table.map((row, rIndex) => {
          if (rIndex === rowIndex) {
            const total = parseFloat(value) * row.price;
            return { ...row, sqft: value, total: isNaN(total) ? 0 : total.toFixed(2) };
          }
          return row;
        });
      }
      return table;
    });
    setTables(updatedTables);
  };

  const calculateTableTotal = (table) => {
    return table.reduce((acc, row) => acc + parseFloat(row.total || 0), 0).toFixed(2);
  };

  const handleKitchenSqftChange = (rowIndex, value) => {
    const updatedKitchenTable = kitchenTable.map((row, rIndex) => {
      if (rIndex === rowIndex) {
        const total = parseFloat(value) * row.price;
        return { ...row, sqft: value, total: isNaN(total) ? 0 : total.toFixed(2) };
      }
      return row;
    });
    setKitchenTable(updatedKitchenTable);
  };

  const calculateKitchenTableTotal = () => {
    return kitchenTable.reduce((acc, row) => acc + parseFloat(row.total || 0), 0).toFixed(2);
  };

  const calculateGrandTotal = () => {
    // Calculate the total for all Bath tables
    const bathTotal = tables.reduce((acc, table) => {
      return acc + parseFloat(calculateTableTotal(table));
    }, 0);

    // Calculate the total for the Kitchen table
    const kitchenTotal = parseFloat(calculateKitchenTableTotal());

    // Calculate the grand total
    const grandTotal = bathTotal + kitchenTotal;

    return grandTotal.toFixed(2); // Convert it to a fixed decimal place
  };

  /*const downloadReportAsPDF = () => {
    html2canvas(document.body, {
      scale: 2, // Increase or decrease scale to fit the content
      useCORS: true // This can help with images, if you have any
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: 'a4'
      });
      pdf.addImage(imgData, 'JPEG', 0, 0);
      pdf.save('report.pdf');
    });
  };*/

  const downloadPDFDirectly = () => {
          axios.get(`http://localhost:5000/api/homes/${homeId}`)
              .then(response => {
                  if (response.data && response.data.data && response.data.data.screport_url) {
                      const pdfUrl = response.data.data.screport_url;
                      window.open(pdfUrl, '_blank');
                  } else {
                      alert("No PDF available for download.");
                  }
              })
              .catch(error => {
                  console.error('Error fetching PDF URL:', error);
                  alert("Error fetching PDF URL.");
              });
      };

  const downloadReportAsPDF = () => {

    const reportData = {
      homeId,
      bathTables: tables.map(table => {
          return {
              rows: table.map(row => ({
                  workName: row.workName,
                  sqft: row.sqft,
                  price: row.price,
                  total: row.total
              })),
              tableTotal: calculateTableTotal(table)
          };
      }),
      kitchenTable: {
          rows: kitchenTable.map(row => ({
              workName: row.workName,
              sqft: row.sqft,
              price: row.price,
              total: row.total
          })),
          tableTotal: calculateKitchenTableTotal()
      },
      grandTotal: calculateGrandTotal()
  };

  axios.post('http://localhost:5000/generate-pdf', reportData, {
      responseType: 'blob'
  })
    .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'report.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    })
    .catch(error => console.error('Error:', error));
};



  return (
    <div className="container mt-3">
      <div className="row">
        {tables.map((table, tableIndex) => (
          <div key={tableIndex} className="col-lg-6 table-container">
          <h2 className="table-heading">Bath {tableIndex + 1}</h2>
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>WorkName</th>
                  <th>SQFT</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{row.workName}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={row.sqft}
                        onChange={(e) => handleSqftChange(tableIndex, rowIndex, e.target.value)}
                      />
                    </td>
                    <td>{row.price}</td>
                    <td>{row.total}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3">Table Total</td>
                  <td>{calculateTableTotal(table)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
      </div>
       {/* New kitchen table */}
          <div className="row">
            <div className="col-lg-12 table-container">
              <h2 className="table-heading">Additional Charges</h2>
              <table className="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>WorkName</th>
                    <th>SQFT</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {kitchenTable.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{row.workName}</td>
                      <td>
                        <input
                          type="number"
                          className="form-control"
                          value={row.sqft}
                          onChange={(e) => handleKitchenSqftChange(rowIndex, e.target.value)}
                        />
                      </td>
                      <td>{row.price}</td>
                      <td>{row.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3">Table Total</td>
                    <td>{calculateKitchenTableTotal()}</td>
                  </tr>
                  <div className="col-12">
                          <h2 className="grand-total-heading">Grand Total</h2>
                          <div className="grand-total">{calculateGrandTotal()}</div>
                        </div>
                </tfoot>
              </table>
            </div>
          </div>
      <div className="btn-container">
          <button onClick={downloadReportAsPDF} className="btn btn-primary">
              Generate Report
          </button>

          <button onClick={downloadPDFDirectly} className="btn btn-secondary">
              Download Existing Report
          </button>
      </div>
    </div>
  );
};

export default Report;