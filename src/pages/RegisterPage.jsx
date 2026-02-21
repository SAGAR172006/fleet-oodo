import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const ROLES = [
  "Fleet Manager",
  "Dispatcher",
  "Safety Officer",
  "Finance Analyst",
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [businessKey, setBusinessKey] = useState("");
  const [licenseId, setLicenseId] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userIdStatus, setUserIdStatus] = useState("idle");
  const [bizKeyStatus, setBizKeyStatus] = useState("idle");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId.trim()) { setUserIdStatus("idle"); return; }
    setUserIdStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/users/check-id?userId=${userId.trim()}`);
        setUserIdStatus(res.data.available ? "available" : "taken");
      } catch {
        setUserIdStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userId]);

  useEffect(() => {
    if (!businessKey.trim()) { setBizKeyStatus("idle"); return; }
    setBizKeyStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await axios.post("/api/auth/validate-key", { businessKey: businessKey.trim() });
        setBizKeyStatus(res.data.valid ? "valid" : "invalid");
      } catch {
        setBizKeyStatus("idle");
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [businessKey]);

  useEffect(() => {
    if (!confirmPassword) { setPasswordMatch(null); return; }
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const isFormValid =
    username.trim() !== "" &&
    role !== "" &&
    userIdStatus === "available" &&
    bizKeyStatus === "valid" &&
    password.trim().length >= 6 &&
    passwordMatch === true &&
    (role !== "Dispatcher" || (licenseId.trim() !== "" && licenseExpiry !== ""));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setSubmitError("");
    setLoading(true);
    try {
      const payload = {
        username: username.trim(),
        userId: userId.trim(),
        role,
        businessKey: businessKey.trim(),
        password,
      };
      if (role === "Dispatcher") {
        payload.licenseId = licenseId.trim();
        payload.licenseExpiry = licenseExpiry;
      }
      const res = await axios.post("/api/auth/register", payload);
      login(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setSubmitError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">FleetFlow</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your full name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Role</label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select your role</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">User ID</label>
            <input
              type="text"
              className="input-field"
              placeholder="Choose a unique User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            {userIdStatus === "checking" && (
              <p className="text-gray-400 text-xs mt-1">Checking availability…</p>
            )}
            {userIdStatus === "available" && (
              <p className="success-msg">✓ User ID is available</p>
            )}
            {userIdStatus === "taken" && (
              <p className="error-msg">✗ User ID is already taken</p>
            )}
          </div>

          <div>
            <label className="form-label">Business Key</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your organization business key"
              value={businessKey}
              onChange={(e) => setBusinessKey(e.target.value)}
            />
            {bizKeyStatus === "checking" && (
              <p className="text-gray-400 text-xs mt-1">Validating key…</p>
            )}
            {bizKeyStatus === "valid" && (
              <p className="success-msg">✓ Business key is valid</p>
            )}
            {bizKeyStatus === "invalid" && (
              <p className="error-msg">✗ Invalid business key</p>
            )}
          </div>

          {role === "Dispatcher" && (
            <>
              <div>
                <label className="form-label">License ID</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your license ID"
                  value={licenseId}
                  onChange={(e) => setLicenseId(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">License Expiry</label>
                <input
                  type="date"
                  className="input-field"
                  min={new Date().toISOString().split("T")[0]}
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordMatch === false && (
              <p className="error-msg">✗ Passwords do not match</p>
            )}
            {passwordMatch === true && (
              <p className="success-msg">✓ Passwords match</p>
            )}
          </div>

          {submitError && <p className="error-msg">{submitError}</p>}

          <button
            type="submit"
            className={!isFormValid || loading ? "btn-disabled w-full" : "btn-primary w-full"}
            disabled={!isFormValid || loading}
          >
            {loading ? "Registering…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
