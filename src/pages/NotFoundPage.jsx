import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <div>
      <h2>404 - Page Not Found</h2>
      <p>Sorry, the page you're looking for doesn't exist.</p>

      <div>
        <h3>Try these options:</h3>
        <ul>
          <li>
            <Link to='/'>Go to Home</Link>
          </li>
          <li>
            <Link to='/todos'>View Todos</Link>
          </li>
          <li>
            <Link to='/about'>Learn About This App</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default NotFoundPage;
