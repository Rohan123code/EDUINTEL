import React from 'react';


const Home = () => {
  return (
    <>
     
      <div className="hero">
        <h1>Welcome to EduIntel AI</h1>
        <p>Your intelligent PDF learning companion powered by AI</p>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="icon">📚</div>
          <h3>Upload PDFs</h3>
          <p>Easily upload your educational PDFs and let our AI process them for intelligent querying.</p>
        </div>
        <div className="feature-card">
          <div className="icon">🤖</div>
          <h3>AI-Powered Answers</h3>
          <p>Ask questions about your documents and get accurate, context-aware responses instantly.</p>
        </div>
        <div className="feature-card">
          <div className="icon">⚡</div>
          <h3>Vector Search</h3>
          <p>Lightning-fast semantic search through your entire document library using advanced RAG technology.</p>
        </div>
      </div>
    </>
  );
};

export default Home;