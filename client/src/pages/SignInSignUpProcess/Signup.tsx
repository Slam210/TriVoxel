import { Alert, Spinner } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import OAuth from "../../components/OAuth";
import * as THREE from "three";

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

export default function Signup({ onSwitch }: { onSwitch: () => void }) {
  const [formData, setFormData] = useState<FormData>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

      const data = await res.json();

      if (data.success === false) {
        setErrorMessage(data.message);
      }
      if (res.ok) {
        setErrorMessage(null);
        setLoading(false);
        onSwitch();
      }
    } catch (error: any) {
      const typedError = error as CustomError;
      setErrorMessage(typedError.message || "Unexpected error occurred.");
    } finally {
      // Always stop loading, even if an error occurs
      setLoading(false);
    }
    return;
  };

  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    camera.position.z = 2;

    scene.add(light);
    scene.add(cube);

    // Initialize colors for smooth transition
    const startColor = new THREE.Color(0x0000ff); // Blue
    const endColor = new THREE.Color(0x00ff00); // Green
    let lerpFactor = 0;
    let colorDirection = 1; // 1 means transitioning towards endColor, -1 means transitioning towards startColor

    // Track mouse drag state
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // Handle mouse events for rotation
    const onMouseDown = (event: { clientX: any; clientY: any }) => {
      isDragging = true;
      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onMouseMove = (event: { clientX: number; clientY: number }) => {
      if (!isDragging) return;

      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      cube.rotation.x += deltaY * 0.01; // Adjust rotation sensitivity
      cube.rotation.y += deltaX * 0.01;

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Add event listeners for mouse drag
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Function to update cube's color gradually
    const updateColor = () => {
      // Gradually interpolate color between start and end
      lerpFactor += 0.005 * colorDirection; // Increase or decrease the speed of color transition
      if (lerpFactor > 1) {
        lerpFactor = 1;
        colorDirection = -1; // Reverse direction towards startColor
      } else if (lerpFactor < 0) {
        lerpFactor = 0;
        colorDirection = 1; // Reverse direction towards endColor
      }

      // Lerp between two colors
      material.color.lerpColors(startColor, endColor, lerpFactor);
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update the cube's color gradually
      updateColor();

      // Rotate cube
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
    };
    animate(); // Start the animation loop

    // Cleanup event listeners when the component is unmounted
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="md:mt-20 min-h-screen">
      <div className="flex p-3 max-w-7xl mx-auto flex-col gap-4 md:flex-row md:items-center ">
        {/* Right */}
        <div className="flex-1 w-full">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1 my-2">
              <label htmlFor="username">Your Username</label>{" "}
              <input
                type="text"
                placeholder="Username"
                className="w-full dark:bg-gray-900 rounded-lg max-w-xl"
                id="username"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1 my-2">
              <label htmlFor="email">Your Email</label>{" "}
              <input
                type="email"
                placeholder="Email"
                className="w-full dark:bg-gray-900 rounded-lg max-w-xl"
                id="email"
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-1 my-2">
              <label htmlFor="password">Your Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full dark:bg-gray-900 rounded-lg max-w-xl"
                id="password"
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg text-center max-w-xl">
                <button
                  className="w-full bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg text-center max-w-xl"
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
            <OAuth />
          </form>
          <div className="flex gap-2 text-sm mt-4">
            <span>Have an Account?</span>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={onSwitch}
            >
              Sign In
            </button>
          </div>
          {errorMessage && (
            <Alert className="mt-5" color="failure">
              {errorMessage}
            </Alert>
          )}
        </div>
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
          <div className="max-h-48" ref={mountRef}></div>
        </div>
      </div>
    </div>
  );
}
