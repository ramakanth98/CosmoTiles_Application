import React, { useState } from 'react';

import './report.css';


const initialRowData = [
    // Assuming this structure based on your description
    // Repeat this for each table with appropriate WorkName and Price
    { workName: 'shower wall', sqft: "", price: 100, total: 0 },
        { workName: 'Accent/2nd Gount', sqft: "", price: 100, total: 0 },
        { workName: 'Bench Seat', sqft: "", price: 100, total: 0 },
        { workName: 'Better Bench', sqft: "", price: 100, total: 0 },
        { workName: 'Corner Shelf', sqft: "", price: 100, total: 0 },
        { workName: 'Single Niche', sqft: "0", price: 100, total: 0 },
        { workName: 'Combo Niche', sqft: "0", price: 100, total: 0 },
        { workName: 'XL Niche', sqft: "", price: 100, total: 0 },
        { workName: 'Shower Floor', sqft: "", price: 100, total: 0 },
        { workName: 'Shower Drain Grind', sqft: "", price: 100, total: 0 },
        { workName: 'Floor Tile', sqft: "", price: 100, total: 0 },
        { workName: 'Windows/Jambs', sqft: "", price: 100, total: 0 },
];

const initialTablesData = new Array(6).fill(null).map(() => initialRowData.map(row => ({ ...row })));

const Report = () => {
  const [tables, setTables] = useState(initialTablesData);

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

  return (
    <div className="row">
      {tables.map((table, tableIndex) => (
        <React.Fragment key={tableIndex}>
          <table style={{ width: '48%', marginRight: '2%', marginBottom: '20px', boxSizing: 'border-box' }}>
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
          {(tableIndex % 2 === 1) && <div style={{ flexBasis: '100%' }}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Report;