// Home page component that lists all available demos
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ marginBottom: 48 }}>
        <h1>Web Programming Demos</h1>
        <p style={{ fontSize: 18, color: '#666' }}>
          Explore full-stack features demonstrating FastAPI and React integration
          for classroom-ready demos and hands-on labs.
        </p>
      </header>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <DemoCard
          title="Retrying Echo Service"
          description="Learn about retry patterns and error handling in web applications. See how the frontend gracefully handles transient failures."
          link="/echo"
          emoji="🔄"
        />

        <DemoCard
          title="Lesson Outline Builder"
          description="Generate structured lesson outlines from a short topic. Useful for planning course content."
          link="/lesson-outline"
          emoji="📚"
        />

        <DemoCard
          title="Teaching Assistant"
          description="Interactive assistant that maintains conversation context. Ask questions about web programming topics."
          link="/chatbot"
          emoji="�"
          highlight
        />
      </div>
    </div>
  );
}

function DemoCard({ title, description, link, emoji, highlight }) {
  return (
    <Link
      to={link}
      style={{
        display: 'block',
        padding: 24,
        border: highlight ? '2px solid #007bff' : '1px solid #ddd',
        borderRadius: 8,
        textDecoration: 'none',
        color: 'inherit',
        backgroundColor: highlight ? '#f0f8ff' : '#fff',
        transition: 'all 0.2s',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>{emoji}</div>
      <h2 style={{ marginBottom: 12, color: '#333' }}>{title}</h2>
      <p style={{ color: '#666', lineHeight: 1.6 }}>{description}</p>
      <div style={{ marginTop: 16, color: '#007bff', fontWeight: 'bold' }}>
        Explore →
      </div>
    </Link>
  );
}
