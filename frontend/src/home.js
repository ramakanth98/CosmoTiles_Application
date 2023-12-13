import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import './styles.css'; // Adjust the path to your styles.css file


const Home = () => {
    const MAX_LENGTH = 50; // Maximum length of the blog content shown
    const PAGE_LIMIT = 12; // Number of blogs per page
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchKey, setSearchKey] = useState('');
    const [error, setError] = useState('');

    // Fetch posts
    const getPosts = async () => {
        try {
            const url = `http://localhost:3000/posts?q=${searchKey}&_page=${currentPage}&_limit=${PAGE_LIMIT}&_sort=date&_order=desc`;
            const response = await fetch(url);
            const data = await response.json();
            setPosts(data);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle page change
    const switchPage = (newPage) => {
        setCurrentPage(newPage);
    };

    // Handle search change
    const handleSearch = async (event) => {
            setSearchKey(event.target.value);
            setCurrentPage(1);
        };

    useEffect(() => {
        getPosts();
    }, [currentPage, searchKey]);

    return (
        <>
          <header>
            <Link to="/"><h1>DEV Circle</h1></Link>
            <div className="search-bar">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input
                type="search"
                placeholder="search"
                value={searchKey}
                onChange={handleSearch}
              />
            </div>
            <Link to="/new" className="accent-btn">
              <FontAwesomeIcon icon={faPenToSquare} /> Write
            </Link>
          </header>
          <main>
            {/* Notification, articles, and pagination will go here */}
          </main>
        </>
      );
};

export default Home;
