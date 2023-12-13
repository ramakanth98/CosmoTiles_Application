import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const NewPost = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState('');

  const submitPost = async () => {
    const id = await getNextID();
    const post = {
      id,
      title,
      author,
      date: new Date().toISOString(),
      profile: "images/default.jpeg",
      content: '' // If you had a content field, you would manage it in state as well
    };
    try {
      const response = await fetch("http://localhost:3000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(post)
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      await response.json();
      // Redirect or handle the response upon success
    } catch (err) {
      notifyError(err);
    }
  };

  const getNextID = async () => {
    try {
      const response = await fetch("http://localhost:3000/posts");
      const posts = await response.json();
      return Math.max(0, ...posts.map(post => post.id)) + 1;
    } catch (err) {
      notifyError(err);
    }
  };

  const notifyError = (err) => {
    setError(err.message);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    await submitPost();
  };

  return (
    <>
      <header className="flex-row">
        {/* ... */}
      </header>
      <main>
        {error && (
          <div className="notification-container">
            <div className="notification">{error}</div>
            <button type="button" className="close" onClick={() => setError('')}>&times;</button>
          </div>
        )}
        <div className="form-container">
          <form onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="title">Home Name</label>
              <input
                id="title"
                type="text"
                minLength="3"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="author">Address</label>
              <input
                id="author"
                type="text"
                minLength="3"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            {/* ... Other input fields ... */}
            <Link to="/report" className="accent-btn"> SC Report </Link>
            <button type="submit" className="accent-btn">Report2</button>
            <button type="submit" className="accent-btn">Report3</button>
            <button type="submit" className="accent-btn">Report4</button>
          </form>
        </div>
      </main>
    </>
  );
};

export default NewPost;
