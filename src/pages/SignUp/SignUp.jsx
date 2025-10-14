import { useState } from "react";
import { Link, useNavigate } from "react-router"; // fixed path
import { Helmet } from "react-helmet";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../hooks/useAuth";
import { saveImgCloud } from "../../api/utils";
import { axiosSecure } from "../../hooks/useAxiosSecure";
import { saveUserInDb } from "../../hooks/useSaveUser";


const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // const [photoURL, setPhotoURL] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { createUser, updateUserProfile } = useAuth()

    const navigate = useNavigate();

    const validateForm = () => {
        const validations = [
            { rule: /(?=.*\d)/, message: "Must include at least one number" },
            { rule: /(?=.*[a-z])/, message: "Must include a lowercase letter" },
            { rule: /(?=.*[A-Z])/, message: "Must include an uppercase letter" },
            { rule: /.{6,}/, message: "Minimum 6 characters" },
        ];
        for (const v of validations) {
            if (!v.rule.test(password)) {
                setError(v.message);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const image = e.target.image.files[0]

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!validateForm()) return;

        setLoading(true);
        try {

            const imgUrl = await saveImgCloud(image)
            // setPhotoURL(imgUrl)
            // console.log(photoURL);

            await createUser(email, password, name);

            const UserData = {
                name: name,
                email: email,
                image: imgUrl

            }
            // console.log(UserData);

            await saveUserInDb(UserData)


            await updateUserProfile(name, imgUrl)
            Swal.fire("Success", "Registration successful", "success");


            navigate("/");
        } catch (error) {
            setError(error.message || "Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Register</title>
            </Helmet>
            <div className="min-h-screen flex items-center justify-center  px-4">
                <div className="   rounded-xl p-8 
w-full max-w-md bg-base-100  border border-neutral/20 
        shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent-content   cursor-pointer
                
                ">
                    <h2 className="text-center text-3xl font-bold text-primary mb-1">
                        Create Account
                    </h2>
                    <p className="text-center text-sm text-base-content/70 mb-5">
                        Join With Us
                    </p>

                    {error && (
                        <div className="alert alert-error mb-4 text-sm">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="label-text">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Your name"
                                className="input input-bordered w-full"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="label-text">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Your email"
                                className="input input-bordered w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="photoURL" className="label-text">
                                Profile Photo URL (optional)
                            </label>
                            {/* <input
                                id="photoURL"
                                type="url"
                                placeholder="Image URL"
                                className="input input-bordered w-full"
                                value={photoURL}
                                onChange={(e) => setPhotoURL(e.target.value)}
                            /> */}
                            <input
                                type="file"
                                name="image"
                                className="file-input file-input-sm w-full" />

                        </div>

                        <div>
                            <label htmlFor="password" className="label-text ">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create password"
                                    className="input input-bordered w-full pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-base-content/60"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="label-text">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Confirm password"
                                    className="input input-bordered w-full pr-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-base-content/60"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-base-content/70">
                        Already have an account?{" "}
                        <Link to="/login" className="link link-primary font-semibold">
                            Login here
                        </Link>
                    </p>
                </div>
            </div >
        </>
    );
};

export default SignUp;