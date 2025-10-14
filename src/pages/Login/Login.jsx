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

  // ✅ Common function: save email in localStorage and save user to DB
  const handleLoginSuccess = async (user) => {
    const userData = {
      name: user?.displayName || "Anonymous",
      email: user?.email,
      image: user?.photoURL || "",
    };

    if (user?.email) {
      // ✅ Save email locally for Cart system
      localStorage.setItem("userEmail", user.email);
    }

    // ✅ Save in DB
    await saveUserInDb(userData);

    Swal.fire({
      title: "Login Successful!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });

    navigate("/");
  };

  // 🔹 Email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signIn(email, password);
      await handleLoginSuccess(result.user);
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password.");
      Swal.fire({ title: "Login Failed!", icon: "error" });
      setLoading(false);
    }
  };

  // 🔹 Google login
  const handleGoogleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      await handleLoginSuccess(result.user);
    } catch (err) {
      console.error("Google login error:", err);
      setError("Google login failed.");
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Google login failed!",
      });
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
          <h2 className="text-3xl font-bold text-center mb-6">Login Please</h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="label" htmlFor="email">
                <span className="label-text">Email Address</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="input input-bordered w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  id="password"
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

            {/* Remember + Forgot */}
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

            {/* Submit */}
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
            Don't have an account?{" "}
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
