import { Alert, Spinner } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Define an interface for form data
interface FormData {
  username?: string;
  email?: string;
  password?: string;
}

interface CustomError {
  message: string;
  statusCode?: number;
}

export default function Signup() {
  const [formData, setFormData] = useState<FormData>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleChange = (e: {
    target: {
      id: any;
      value: any;
    };
  }) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.username || !formData.password || !formData.email) {
      setErrorMessage("Please fill out all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("here");
      const data = await res.json();

      if (data.success === false) {
        setErrorMessage(data.message);
      }
      if (res.ok) {
        navigate("/sign-in");
      }
    } catch (error: any) {
      console.log("here");
      const typedError = error as CustomError;
      setErrorMessage(typedError.message || "Unexpected error occurred.");
    } finally {
      // Always stop loading, even if an error occurs
      setLoading(false);
    }
    return;
  };

  return (
    <div className="md:mt-20">
      <div className="flex p-3 max-w-3xl mx-auto flex-col gap-4 md:flex-row md:items-center">
        {/* Left */}
        <div className="hidden md:flex flex-col text-center w-full md:w-1/2 justify-center items-center">
          <div className="flex">
            <Link
              to="/"
              className="text-lg sm:text-2xl md:text-4xl font-bold rounded-lg px-4 py-2 mx-4 my-2 bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 text-white"
            >
              TriVoxel
            </Link>
          </div>
          <p className="text-sm mt-5">
            Join our community today. Start your journey here.
          </p>
          <p className="text-sm mt-5">
            Sign up with email and password or with google.
          </p>
        </div>
        {/* Right */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1 my-2">
              <label htmlFor="username" className="text-white">
                Your Username
              </label>{" "}
              <input
                type="text"
                placeholder="Username"
                className="w-full bg-gray-900 rounded-lg"
                id="username"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1 my-2">
              <label htmlFor="email" className="text-white">
                Your Email
              </label>{" "}
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-gray-900 rounded-lg"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1 my-2">
              <label htmlFor="password" className="text-white">
                Your Password
              </label>
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-gray-900 rounded-lg"
                id="password"
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
                <button
                  className="w-full bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 text-white px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="pl-3">Loading...</span>
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>
            </div>
          </form>
          <div className="flex gap-2 text-sm mt-4">
            <span>Have an Account?</span>
            <Link to="/sign-in" className="text-blue-500 hover:text-blue-700">
              Sign In
            </Link>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
