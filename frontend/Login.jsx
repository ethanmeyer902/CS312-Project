import "./Login.css";

export default function Login() {
  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form">
        <input placeholder="User ID" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
      </form>
    </div>
  );
}
