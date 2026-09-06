
// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       await login(email, password);
//       navigate("/");
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="auth-page">

//       {/* Background video */}
//       <video
//         className="auth-background-video"
//         autoPlay
//         muted
//         loop
//         playsInline
//       >
//         <source src="/shift-market-bg.mp4" type="video/mp4" />
//       </video>

//       {/* Dark overlay */}
//       <div className="auth-video-overlay"></div>

//       {/* Branding */}
//       <div className="auth-brand">
//         <div className="auth-logo">
//           Shift<span>.</span>
//         </div>

//         <div className="auth-tagline">
//           SIGNALS THAT MATTER
//         </div>
//       </div>

//       {/* Login card */}
//       <form onSubmit={handleSubmit} className="auth-form">

//         <div className="auth-heading">
//           <h2>Welcome back</h2>
//           <p>Sign in to your watchlist</p>
//         </div>

//         {error && <p className="error">{error}</p>}

//         <div className="auth-field">
//           <label>Email</label>
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//         </div>

//         <div className="auth-field">
//           <label>Password</label>
//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />
//         </div>

//         <button type="submit" disabled={loading}>
//           {loading ? "Logging in..." : "Log in"}
//         </button>

//         <p className="auth-register">
//           No account? <Link to="/register">Create one</Link>
//         </p>

//       </form>

//     </div>
//   );
// };

// export default Login;
















import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      {/* Background video */}
      <video
        className="auth-background-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/shift-market-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="auth-video-overlay"></div>

      {/* Branding */}
      <div className="auth-brand">
        <div className="auth-logo">
          Shift<span>.</span>
        </div>

        <div className="auth-tagline">
          SIGNALS THAT MATTER
        </div>
      </div>

      {/* Login card */}
      <form onSubmit={handleSubmit} className="auth-form">

        <div className="auth-heading">
          <h2>Welcome back</h2>
          <p>Sign in to your watchlist</p>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="auth-register">
          No account? <Link to="/register">Create one</Link>
        </p>

      </form>

    </div>
  );
};

export default Login;