import { Alert, Spinner } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../../redux/user/userSlice";
import { useDispatch, useSelector } from "react-redux";
import OAuth from "../../components/OAuth";

// Define an interface for form data
interface FormData {
  email?: string;
  password?: string;
}

interface CustomError {
  message: string;
  statusCode?: number;
}

export default function Signin({ onSwitch }: { onSwitch: () => void }) {
  const [formData, setFormData] = useState<FormData>({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error: errorMessage } = useSelector(
    (state: any) => state.user
  );
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
    dispatch(signInStart());

    if (!formData.password || !formData.email) {
      dispatch(signInFailure("Please fill out all the fields"));
      return;
    }

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));
      }
      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate("/");
      }
    } catch (error: any) {
      const typedError = error as CustomError;
      dispatch(signInFailure(typedError.message));
    }
    return;
  };

  return (
    <div className="md:mt-20 min-h-screen">
      <div className="flex p-3 max-w-7xl mx-auto flex-col gap-4 md:flex-row md:items-center ">
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
            Resume your Journey with the community here.
          </p>
          <p className="text-sm mt-5">
            Sign in with email and password or with google.
          </p>
        </div>
        {/* Right */}
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1 my-2">
              <label htmlFor="email">Your Email</label>{" "}
              <input
                type="email"
                placeholder="email@gmail.com"
                className="w-full bg-white dark:bg-gray-900 rounded-lg max-w-xl"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1 my-2">
              <label htmlFor="password">Your Password</label>
              <input
                type="password"
                placeholder="********"
                className="w-full bg-white dark:bg-gray-900 rounded-lg max-w-xl"
                id="password"
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <div className="bg-gradient-to-tr max-w-xl from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
                <button
                  className="w-full max-w-xl bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" />
                      <span className="pl-3">Loading...</span>
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </div>
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-4">
            <span>Don't Have an Account?</span>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={onSwitch}
            >
              Sign Up
            </button>
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
