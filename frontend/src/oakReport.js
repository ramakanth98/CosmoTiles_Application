import React, { useState ,useEffect} from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import axios from 'axios';
//import './report.css';



const initialRowData = [
    // Assuming this structure based on your description
    // Repeat this for each table with appropriate WorkName and Price
    { workName: 'shower wall', sqft: "", price: 10, total: 0 },
        { workName: 'Shower Pan', sqft: "", price: 100, total: 0 },
        { workName: 'Slab Floor', sqft: "", price: 100, total: 0 },
];
const generateInitialData = () => ([
  {
    sectionName: 'Owner bath',
    items: [
      { sNo: 1, description: 'Shower Wall', area: "" },
      { sNo: 2, description: 'Shower Pan', area: "" },
      { sNo: 3, description: 'Slab Floor', area: "" }
    ]
  },
  {
    sectionName: 'Bath 2',
    items: [
      { sNo: 1, description: 'Tub Wall', area: "" },
      { sNo: 2, description: 'Shower Pan', area: "" }, // Replace 0 with the actual value
      { sNo: 3, description: 'Bath Floor', area: "" }
    ]
  },
  {
    sectionName: 'Bath 3',
    items: [
      { sNo: 1, description: 'Shower Wall', area: "" },
      { sNo: 2, description: 'Shower Pan', area: "" },
      { sNo: 3, description: 'Slab Floor', area: "" }
    ]
  },
  {
    sectionName: 'Bath 4',
    items: [
      { sNo: 1, description: 'Tub Wall', area: "" }, // Replace 0 with the actual value
      { sNo: 2, description: 'Bath Floor', area: "" } // Replace 0 with the actual value
    ]
  },
  {
    sectionName: 'Bath 5',
    items: [
      { sNo: 1, description: 'Shower Wall', area: "" }, // Replace 0 with the actual value
      { sNo: 2, description: 'Shower Pan', area: "" }, // Replace 0 with the actual value
      { sNo: 3, description: 'Bath Floor', area: "" } // Replace 0 with the actual value
    ]
  },
  {
    sectionName: 'Laundry',
    items: [
      { sNo: 1, description: 'Floor', area: "" } // Replace 0 with the actual value
    ]
  }
  // Add other sections as required
]);

const initialMaterialsData = [
  { description: 'Perma Base', quantity: "", units: 'Sheets', unitPrice: 11.33, amount: "" },
  { description: 'Fiber Rock', quantity: "", units: 'Sheets', unitPrice: 11.25, amount: "" },
  { description: 'Go Board', quantity: "", units: 'Sheets', unitPrice: 25.00, amount: "" },
  { description: 'sand', quantity: "", units: 'Bags', unitPrice: 2.00, amount: "" },
  { description: 'Cement', quantity: "", units: 'Bags', unitPrice: 15.50, amount: "" },
  { description: 'Gray T-set', quantity: "", units: 'Bag', unitPrice: 6.50, amount: "" },
  { description: 'White T-set', quantity: "", units: 'Bags', unitPrice: 11.70, amount: "" },
  { description: 'Water Proof', quantity: "", units: 'Bucket', unitPrice: 190.00, amount: "" },
  { description: 'Anti- Crack', quantity: "", units: 'Litres', unitPrice: 116.00, amount: "" },
  { description: '4" Fiber Tape', quantity: "", units: 'L/F', unitPrice: 10.00, amount: "" },
  { description: 'Lathe', quantity: "", units: '', unitPrice: 97.00, amount: "" },  // Quantity needs clarification
  { description: 'Roof Wrap', quantity: "", units: '', unitPrice: 'Please Update', amount: "" },  // Quantity and unit price needs clarification
  { description: 'Damn Corners', quantity: "", units: '', unitPrice: 4.50, amount: "" },
  { description: 'Np-1', quantity: "", units: '', unitPrice: 9.00, amount: "" },
  { description: '2" Fiber Tape', quantity: "", units: 'No.', unitPrice: 8.00, amount: "" },
  { description: 'Nails', quantity: "", units: 'Box', unitPrice: 45.00, amount: "" },
  { description: 'Paper', quantity: "", units: 'Box', unitPrice: 43.00, amount: "" },
  { description: 'Mask Tape', quantity: "", units: 'No.', unitPrice: 21.00, amount: "" },
  { description: 'Blue Tape', quantity: "", units: 'No.', unitPrice: 6.00, amount: "" },
  { description: 'Furr Strips', quantity: "", units: '', unitPrice: 'Please Update', amount: "" },  // Needs clarification
  { description: 'Combo Niches', quantity: "", units: '', unitPrice: 50.00, amount: "" },  // Needs clarification
  { description: 'Std Niches', quantity: "", units: '', unitPrice: 27.50, amount: "" },  // Needs clarification
  { description: 'Single Niche', quantity: "", units: '', unitPrice: 'Please Update', amount: "" },  // Needs clarification
  { description: 'Threshholds', quantity: "", units: '', unitPrice: 45.00, amount: "" },
  { description: 'Miscellaneous', quantity: '', units: '', unitPrice: 45.00, amount: "" },// Needs clarification
  // ... Add other items if any more are present in your list
];

//const initialTablesData = new Array(6).fill(null).map(() => generateInitialData.map(row => ({ ...row })));
const numberOfTables = 6; // Set this to however many tables you want to create

const initialTablesData = new Array(numberOfTables).fill(null).map(() => {
  return generateInitialData().map(section => ({
    ...section, // Spread to copy section properties
    items: section.items.map(item => ({ ...item })) // Deep copy of items
  }));
});


//const puppeteer = require('puppeteer');

/*async function printPDF() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/report', { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4' });

  await browser.close();
  return pdf;
}*/


const OakReport = () => {
  //const [tables, setTables] = useState(initialTablesData);
  const [tables, setTables] = useState(generateInitialData());
  const [materials, setMaterials] = useState(initialMaterialsData);
  //const [kitchenTable, setKitchenTable] = useState(initialKitchenData);
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


const calculatePermaBaseQuantity = () => {
    let showerWallArea = 0;
    let tubWallArea = 0;

    // Find the area for Shower Wall and Tub Wall from the tables
    tables.forEach(table => {
      table.items.forEach(item => {
        if (item.description === 'Shower Wall') {
          showerWallArea += Number(item.area);
        } else if (item.description === 'Tub Wall') {
          tubWallArea += Number(item.area);
        }
      });
    });

    // Calculate the new quantity for Perma Base
    return (showerWallArea + tubWallArea) / 15;
  };

  const calculateFiberRockQuantity = () => {
    let bathFloorArea = 0;

    // Find the area for 'Bath Floor' from the tables
    tables.forEach(table => {
      table.items.forEach(item => {
        if (item.description === 'Bath Floor') {
          bathFloorArea += Number(item.area);
        }
      });
    });

    // Calculate the new quantity for 'Fiber Rock'
    return bathFloorArea / 15;
  };

  const calculateSandQuantity = () => {
    let showerPanArea = 0;

    // Find the area for 'Shower Pan' from the tables
    tables.forEach(table => {
      table.items.forEach(item => {
        if (item.description === 'Shower Pan') {
          showerPanArea += Number(item.area);
        }
      });
    });

    // Calculate the new quantity for 'sand'
    return showerPanArea / 4;
  };

  const calculateGrayTSetQuantity = () => {
    let bathFloorArea = 0;
    let floorArea = 0;

    // Find the total area for 'Bath Floor' and 'Floor' from the tables
    tables.forEach(table => {
      table.items.forEach(item => {
        if (item.description === 'Bath Floor') {
          bathFloorArea += Number(item.area);
        }
        if (item.description === 'Floor') {
          floorArea += Number(item.area);
        }
      });
    });

    // Calculate the new quantity for 'Gray T-set'
    return Math.ceil((bathFloorArea + floorArea) / 100);
  };

  const calculateWhiteTSetQuantity = () => {
    let totalArea = 0;

    // Sum all areas
    tables.forEach(table => {
      table.items.forEach(item => {
        totalArea += Number(item.area);
      });
    });

    // Calculate the new quantity for 'White T-set'
    return totalArea / 50;
  };


  const calculateTableTotal = (table) => {
    return table.reduce((acc, row) => acc + parseFloat(row.total || 0), 0).toFixed(2);
  };


const handleAreaChange = (sectionIndex, itemIndex, newArea) => {
  // Update the tables state with the new area
  setTables(tables => {
    return tables.map((section, sIdx) => {
      if (sIdx === sectionIndex) {
        return {
          ...section,
          items: section.items.map((item, iIdx) => {
            if (iIdx === itemIndex) {
              return { ...item, area: newArea };
            }
            return item;
          }),
        };
      }
      return section;
    });
  });
};


  const handleQuantityChange = (index, newQuantity) => {
      const updatedMaterials = materials.map((item, idx) => {
        if (idx === index) {
          const updatedAmount = parseFloat(newQuantity) * item.unitPrice;
          return { ...item, quantity: newQuantity, amount: isNaN(updatedAmount) ? 0 : updatedAmount.toFixed(2) };
        }
        return item;
      });
      setMaterials(updatedMaterials);
    };

    // Function to calculate the total amount for the materials table
    const calculateMaterialsTotal = () => {
      return materials.reduce((acc, item) => acc + parseFloat(item.amount || 0), 0).toFixed(2);
    };


  const calculateGrandTotal = () => {
    // Calculate the total for all Bath tables
    const bathTotal = tables.reduce((acc, table) => {
      return acc + parseFloat(calculateTableTotal(table));
    }, 0);

    // Calculate the total for the materials table
    const materialsTotal = materials.reduce((acc, item) => {
      return acc + parseFloat(item.amount || 0);
    }, 0);

    // Sum the totals
    return (bathTotal + materialsTotal).toFixed(2); // Convert it to a fixed decimal place
  };

  const downloadReportAsPDF = () => {
    // Gather all table data, including bath tables and materials
    const reportData = {
      homeId: homeId,
      grandTotal: calculateMaterialsTotal(),
      bathTables: tables.map(table => {
        return {
          sectionName: table.sectionName,
          items: table.items.map(item => ({
            description: item.description,
            area: item.area
          })),
          // Calculate and add any other relevant data for bath tables
        };
      }),
      materialsTable: {
        rows: materials.map(item => ({
          description: item.description,
          quantity: item.quantity,
          units: item.units,
          unitPrice: item.unitPrice,
          amount: item.amount
        })),
        // Calculate the total for materials if needed
      },
      // Include grandTotal calculation if necessary
    };

    // Send the data to your server endpoint to generate the PDF
    axios.post('http://localhost:5000/generate-oak-pdf', reportData, {
      responseType: 'blob'
    })
      .then(response => {
        // Create a URL for the PDF
        const pdfUrl = window.URL.createObjectURL(new Blob([response.data]));
        // Create a link to download the PDF
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.setAttribute('download', 'report.pdf'); // or any other name you want
        // Append the link to the document and trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        // Clean up by removing the link and revoking the object URL
        document.body.removeChild(downloadLink);
        window.URL.revokeObjectURL(pdfUrl);
      })
      .catch(error => {
        console.error('Error generating report PDF:', error);
        alert('Error generating report PDF.');
      });
  };


  useEffect(() => {
    const newPermaBaseQuantity = calculatePermaBaseQuantity();
    const newFiberRockQuantity = calculateFiberRockQuantity();
    const newSandQuantity = calculateSandQuantity();
    const newGrayTSetQuantity = calculateGrayTSetQuantity();
    const newWhiteTSetQuantity = calculateWhiteTSetQuantity();

    setMaterials(materials => materials.map(item => {
      let newAmount; // Declare newAmount variable once at the top

      switch (item.description) {
        case 'Perma Base':
          newAmount = newPermaBaseQuantity * item.unitPrice;
          return {
            ...item,
            quantity: newPermaBaseQuantity,
            amount: isNaN(newAmount) ? '' : newAmount.toFixed(2)
          };

        case 'Fiber Rock':
          newAmount = newFiberRockQuantity * item.unitPrice;
          return {
            ...item,
            quantity: newFiberRockQuantity,
            amount: isNaN(newAmount) ? '' : newAmount.toFixed(2)
          };

        case 'sand':
          newAmount = newSandQuantity * item.unitPrice;
          return {
            ...item,
            quantity: newSandQuantity,
            amount: isNaN(newAmount) ? '' : newAmount.toFixed(2)
          };

        case 'Gray T-set':
          newAmount = newGrayTSetQuantity * item.unitPrice;
          return {
            ...item,
            quantity: newGrayTSetQuantity,
            amount: isNaN(newAmount) ? '' : newAmount.toFixed(2)
          };

        case 'White T-set':
          newAmount = newWhiteTSetQuantity * item.unitPrice;
          return {
            ...item,
            quantity: newWhiteTSetQuantity,
            amount: isNaN(newAmount) ? '' : newAmount.toFixed(2)
          };

        default:
          return item;
      }
    }));
  }, [tables]);



  return (
      <div className="container mt-3">
      <div className="row">
        {tables.map((section, sectionIndex) => (
          <div key={sectionIndex} className="table-section">
            <h2>{section.sectionName}</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Area (Sq ft)</th>
                </tr>
              </thead>
              <tbody>
                {section.items.map((item, itemIndex) => (
                  <tr key={itemIndex}>
                    <td>{item.description}</td>
                    <td>
                   <input
                             type="number"
                             className="form-control"
                             value={item.area}
                             onChange={(e) => handleAreaChange(sectionIndex, itemIndex, e.target.value)}
                           /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {/* Materials Table */}
              <div className="table-section">
                <h2>Materials</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Units</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                          />
                        </td>
                        <td>{item.units}</td>
                        <td>{item.unitPrice}</td>
                        <td>{item.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="4">Total Amount</td>
                      <td>{calculateMaterialsTotal()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              </div>
        <div className="btn-container" style={{ marginTop: '20px' }}>
          <button onClick={downloadReportAsPDF} className="btn btn-primary">Generate Report</button>
          <button className="btn btn-secondary">Download Existing Report</button>
        </div>

      </div>
    );
  };

export default OakReport;