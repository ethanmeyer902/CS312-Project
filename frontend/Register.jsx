import "./Register.css";

export default function Register() {
  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form className="auth-form">
        <input placeholder="Name" />
        <input placeholder="Email" />
        <input placeholder="User ID" />
        <input type="password" placeholder="Password" />
        <button>Register</button>
      </form>
    </div>
  );
}

