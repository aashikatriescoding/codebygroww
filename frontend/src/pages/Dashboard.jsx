import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header>
        <h1>Watchlist</h1>
        <div>
          <span>{user?.email}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </header>
      <p>Feed goes here — next step.</p>
    </div>
  );
};

export default Dashboard;