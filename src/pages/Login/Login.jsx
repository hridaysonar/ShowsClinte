import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Helmet } from "react-helmet";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import { saveUserInDb } from "../../hooks/useSaveUser";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signInWithGoogle, loading, setLoading } = useAuth();
  const navigate = useNavigate();

  // ✅ Common success handler (both normal + google login)
  const handleLoginSuccess = async (user) => {
    const userData = {
      name: user?.displayName || "Anonymous",
      email: user?.email,
      image: user?.photoURL || "",
    };

    if (user?.email) {
      localStorage.setItem("userEmail", user.email);

      // ✅ Step 1: Generate JWT and set cookie
      await fetch("https://servers003.vercel.app/jwt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
        credentials: "include", // ✅ send cookies
      });

      // ✅ Step 2: Save user in DB
      await saveUserInDb(userData);
    }

    // ✅ Step 3: Sweet Success Alert
    Swal.fire({
      title: "Welcome Back!",
      text: `${user?.displayName || "You"} logged in successfully 🎉`,
      icon: "success",
      confirmButtonColor: "#3085d6",
      background: "#f0f9ff",
      color: "#333",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => navigate("/"));
  };

  // 🔹 Email/Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn(email, password);
      await handleLoginSuccess(result.user);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
      Swal.fire({
        icon: "error",
        title: "Login Failed!",
        text: "Please check your credentials and try again.",
      });
      setLoading(false);
    }
  };

  // 🔹 Google Login (Fixed version)
  const handleGoogleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      const result = await signInWithGoogle();

      if (result?.user?.email) {
        await handleLoginSuccess(result.user);
      } else {
        throw new Error("Google login returned empty user");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed.");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Google login failed! Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-base-100 border rounded-xl p-8 shadow-md transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <h2 className="text-3xl font-bold text-center mb-6">
            Login to Your Account
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {/* Email/Password Login */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                <span className="label-text">Email Address</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="checkbox checkbox-sm" />
                <span>Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                state={{ email }}
                className="link link-hover text-primary"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="divider my-6">OR</div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="btn btn-outline w-full gap-2"
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm">
            Don’t have an account?{" "}
            <Link to="/signup" className="link link-neutral font-bold">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
