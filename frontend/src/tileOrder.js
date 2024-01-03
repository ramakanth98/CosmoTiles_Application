import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import axios from 'axios';
import './report.css';



const initialRowData = [
    { id: 1, size: 'E4402', description: 'Satin Gold Ebbe, Square', quantity: '' },
      { id: 2, size: '4X12', description: 'MYTHOLOGY, Santorini, Undulated- MY90', quantity: '' },
      { id: 3, size: '12X20', description: 'Combo Niche (Take From Shop)', quantity: '' },
      { id: 4, size: '1X3', description: 'Elect, Beige, Herringbone- EL31', quantity: '' },
      { id: 5, size: '12X24', description: 'RESILIENCE, Vitality White- RL20', quantity: '' },
      { id: 6, size: 'GROUT', description: 'Prism Bleached Wood (545)', quantity: '' },
      { id: 7, size: 'CAULK', description: 'Bleached Wood Sanded', quantity: '' },
      { id: 8, size: '3X6', description: 'VITRUVIAN, White,VV10', quantity: '' },
      { id: 9, size: '12x24', description: 'URBANIZE, White, UB02', quantity: '' },
      { id: 10, size: '3X6', description: 'VITRUVIAN, White,VV10', quantity: '' },
      { id: 11, size: '12x24', description: 'URBANIZE, White, UB02', quantity: '' },
      { id: 12, size: 'Grout', description: 'Prism Ash (642)', quantity: '' },
      { id: 13, size: 'CAULK', description: 'ASH Wood Sanded', quantity: '' },
      { id: 14, size: '12x24', description: 'URBANIZE, Grey, UB04', quantity: '' },
      { id: 15, size: '12x12', description: 'MEMOIR, Petal Grey, ME20', quantity: '' },
      { id: 16, size: 'GROUT', description: 'Prism Winter Gray (335)', quantity: '' },
      { id: 17, size: 'GROUT', description: 'Prism Ash (642)', quantity: '' },
      { id: 18, size: 'CAULK', description: 'ASH Wood SANDED', quantity: '' },
      { id: 19, size: 'CAULK', description: 'GRAY Wood SANDED', quantity: '' },
      //need to add sub categories
];




const TileOrderReport = () => {
  const [tables, setTables] = useState(initialTablesData);
  const [kitchenTable, setKitchenTable] = useState(initialKitchenData);
  let { homeId } = useParams();


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


  const downloadPDFDirectly = () => {
          axios.get(`http://localhost:5000/api/homes/${homeId}`)
              .then(response => {
                  if (response.data && response.data.data && response.data.data.invoice_url) {
                      const pdfUrl = response.data.data.invoice_url;
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

  axios.post('http://localhost:5000/generateinvoice-pdf', reportData, {
      responseType: 'blob'
  })
    .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'invoice_report.pdf');
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

export default TileOrderReport;