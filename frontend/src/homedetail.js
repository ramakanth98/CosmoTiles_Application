import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate} from 'react-router-dom';
import logo from './Cos_NoBG.png'

const HomeDetail = () => {
  const [homeDetails, setHomeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const handleHome = async () => navigate(`/updatePost/${homeId}`);
  const handleSC = async () => navigate(`/report/${homeId}`);
  const handleInvoice = async () => navigate(`/invoiceReport/${homeId}`);

  const handleOakReport=async()=>navigate(`/oakReport/${homeId}`);
  let { homeId } = useParams(); // This assumes you're using a route like "/home/:homeId"

  useEffect(() => {
    const fetchHomeDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/homes/${homeId}`);
        setHomeDetails(response.data.data);
      } catch (err) {
        setError('Failed to fetch home details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeDetails();
  }, [homeId]);

  const navigate = useNavigate()

  const handleDelete = async () => {
      try {
        await axios.delete(`http://localhost:5000/api/homes/${homeId}`);
        // Redirect to home list or another appropriate page after deletion
        navigate('/');
    // Adjust the path as needed
      } catch (err) {
        console.error("Error deleting home", err);
        setError('Failed to delete home.');
      }
    };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }



//  return (
//    <div>
//      <Link to="/">
//        <img src={logo} alt="Cosmo Tiles Logo" className="logo" /> {/* Logo only appears once */}
//      </Link>
//
//      {homeDetails ? (
//        <div>
//          <center>
//            <h2 className='home-name'>Home Name: {homeDetails.home}</h2>
//            <h3 className="home-address">Address: {homeDetails.address}</h3>
//
//            {homeDetails.pdf_url && (
//              <a href={homeDetails.pdf_url} target="_blank" rel="noopener noreferrer" download className="accent-btn">
//                Download PDF
//              </a>
//            )}
//          </center>
//
//          <div>
//            <Link to={`/report/${homeId}`} className="accent-btn"> SC Report </Link>
//            <Link to={`/invoiceReport/${homeId}`} className="accent-btn">Invoice Report</Link>
//            <Link to={`/oakReport/${homeId}`} className="accent-btn">Oak Report</Link>
//            <button type="button" className="accent-btn">Report4</button>
//          </div>
//        </div>
//      ) : (
//        <div>Home not found.</div>
//      )}
//    </div>
//  );
//      }

return (
    <div>
      <Link to="/">
        <img src={logo} alt="Cosmo Tiles Logo" className="logo" /> {/* Logo only appears once */}
      </Link>

      {homeDetails ? (
        <div>
          <center>
            <h2 style={{display:'block'}} className='home-name'>Home Name: {homeDetails.home}</h2>
            <h3 className="home-address">Address: {homeDetails.address}</h3>

            {homeDetails.pdf_url && (
              <div>
                <br/>
                <a href={homeDetails.pdf_url} target="_blank" style={{}} rel="noopener noreferrer" download className="accent-btn">
                Download PDF
              </a>
              </div>

            )}
          </center>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <div style={{textAlign:'center'}}>
          {/* <Link to={/updatePost/${homeId}} className="accent-btn"> Update Home</Link> */}
          <button type='button' style={{display:'inline'}} className="accent-btn"  onClick={handleHome}>Update Home</button>

          <button type='button' style={{display:'inline'}} onClick={handleDelete} className="accent-btn">Delete Home</button>
          </div>
          <div style={{textAlign:'center'}}>
            <br/>
            <br></br>
            {/* <Link to={/report/${homeId}} className="accent-btn"> SC Report </Link>
            <Link to={/invoiceReport/${homeId}} className="accent-btn">Invoice Report</Link> */}
            <button type='button' style={{display:'inline'}} className="accent-btn"  onClick={handleSC}> SC Report </button>
            <button type='button' style={{display:'inline'}} className="accent-btn"  onClick={handleInvoice}> Invoice Report </button>
            <button type="button" style={{display:'inline'}} className="accent-btn" onClick={handleOakReport}>Oak Report</button>
            <button type="button" style={{display:'inline'}} className="accent-btn">Report4</button>
          </div>
        </div>
      ) : (
        <div>Home not found.</div>
      )}
    </div>
  );
      }
export default HomeDetail;
