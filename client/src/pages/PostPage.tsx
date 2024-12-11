import React, { useEffect, useState, useRef } from "react";
import { Button, Spinner } from "flowbite-react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";
import "../css/post.css";
import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

// Define Post interface
interface Post {
  id: any;
  title: string;
  category: string;
  content: string;
  subtitle: string;
  cover_image: string;
  created_at: string;
  slug: string;
}

// Define environment interface for tutorial category
interface Layer {
  id: number;
  parts: {
    text: string;
    editable: boolean;
  }[];
}

interface ResumeContent {
  id: number;
  user_id: string;
  layers: Layer[];
  colors: {
    backgroundColor: string;
    headingTextColor: string;
    headingSubtextColor: string;
  };
  created_at: string;
  updated_at: string;
}

// Dynamic Three.js Component Wrapper
const ThreeJSComponent: React.FC<{ code: string }> = ({ code }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a function to run the Three.js code
    const runThreeJSCode = () => {
      // Clear any existing scene elements
      const existingCanvas = document.querySelector(".webgl");
      if (existingCanvas) {
        existingCanvas.innerHTML = "";
      }

      // Create a function with access to THREE, gsap, and OrbitControls
      const createScene = new Function(
        "THREE",
        "gsap",
        "OrbitControls",
        "canvas",
        `return function() { 
          ${code}
        }`
      );

      // Execute the scene creation function
      const sceneFunction = createScene(
        THREE,
        gsap,
        OrbitControls,
        canvasRef.current
      );
      sceneFunction();
    };

    // Run the Three.js code
    runThreeJSCode();

    // Cleanup function
    return () => {
      // Add any necessary cleanup logic
    };
  }, [code]);

  return (
    <canvas
      ref={canvasRef}
      className="webgl w-full h-full"
      style={{ maxWidth: "100%", maxHeight: "100%" }}
    />
  );
};

export default function PostPage() {
  const { postSlug } = useParams<{ postSlug: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [post, setPost] = useState<Post | null>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string>("");
  const [recentPosts, setRecentPosts] = useState<Post[] | null>(null);
  const [contentObject, setContentObject] = useState<ResumeContent | null>(
    null
  );
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // New state for dynamic code rendering
  const [renderedComponent, setRenderedComponent] =
    useState<React.ReactNode | null>(null);
  const [codeSnippet, setCodeSnippet] = useState<string | null>(null);
  const [isCodeVisible, setIsCodeVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();

        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }

        if (res.ok && data.posts.length > 0) {
          const fetchedPost = data.posts[0];
          setPost(fetchedPost);

          // Extract and remove code snippet from the content
          const codeMatch = fetchedPost.content.match(
            /<pre><code class="language-(javascript|typescript)">([\s\S]*?)<\/code><\/pre>/
          );

          if (codeMatch) {
            const extractedCode = codeMatch[2]
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&amp;/g, "&");

            // Remove the matched code snippet from the content
            const contentWithoutCode = fetchedPost.content.replace(
              /<pre><code class="language-(javascript|typescript)">([\s\S]*?)<\/code><\/pre>/,
              ""
            );

            // Sanitize the content without the code
            const sanitizedContent = DOMPurify.sanitize(contentWithoutCode);
            setSanitizedContent(sanitizedContent);

            // Set the extracted code to state
            setCodeSnippet(extractedCode);

            try {
              // Check if the code is a Three.js scene
              if (extractedCode.includes("new THREE.Scene()")) {
                setRenderedComponent(<ThreeJSComponent code={extractedCode} />);
              } else {
                // Fallback to original dynamic component creation
                const createComponent = new Function(
                  "React",
                  `return function DynamicComponent() { 
                  ${extractedCode}
                }`
                );

                const DynamicComponent = createComponent(React);
                setRenderedComponent(<DynamicComponent />);
              }
            } catch (err) {
              console.error("Failed to execute code:", err);
              setRenderedComponent(null);
            }
          } else {
            // If no code match, sanitize the entire content
            const content = fetchedPost.content
              ? DOMPurify.sanitize(fetchedPost.content)
              : "";
            setSanitizedContent(content);
          }

          setError(false);
        } else {
          setError(true);
        }

        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      if (post) {
        // Ensure post is available before fetching recent posts
        try {
          const res = await fetch(
            `/api/post/getposts?limit=3&postId=${post.id}`
          );
          const data = await res.json();
          if (res.ok) {
            setRecentPosts(data.posts);
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    fetchRecentPosts();
  }, [post]); // Dependency on post to refetch when post changes

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(contentObject?.colors.backgroundColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    if (mountRef.current) {
      mountRef.current.innerHTML = "";
      mountRef.current.appendChild(renderer.domElement);
    }

    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font: any) => {
        const meshes: THREE.Mesh[] = [];
        contentObject?.layers.forEach((layer, layerIndex) => {
          layer.parts.forEach((part, partIndex) => {
            const geometry = new TextGeometry(part.text, {
              font: font,
              size: 0.3,
              height: 0.05,
            });
            geometry.center();

            const material = new THREE.MeshStandardMaterial({
              color:
                partIndex === 0
                  ? contentObject.colors.headingTextColor
                  : contentObject.colors.headingSubtextColor,
              transparent: true,
              opacity:
                layerIndex === currentLayerIndex
                  ? 1
                  : layerIndex <= currentLayerIndex
                  ? 0.1
                  : 0.3,
            });

            const mesh = new THREE.Mesh(geometry, material);
            const verticalSpacing = 0.5;
            mesh.position.set(0, -partIndex * verticalSpacing, -layerIndex * 3);
            meshes.push(mesh);
            scene.add(mesh);
          });
        });

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      }
    );

    const zoomToLayer = () => {
      const targetZ = 5 - currentLayerIndex * 4;
      const animateZoom = () => {
        requestAnimationFrame(animateZoom);
        camera.position.z += (targetZ - camera.position.z) * 0.1;
        if (Math.abs(camera.position.z - targetZ) < 0.01) {
          camera.position.z = targetZ;
          return;
        }
        renderer.render(scene, camera);
      };
      animateZoom();
    };

    zoomToLayer();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, [contentObject, currentLayerIndex]);

  const handleNextLayer = () => {
    if (!contentObject) {
      return;
    }
    if (currentLayerIndex < contentObject?.layers.length - 1) {
      setCurrentLayerIndex(currentLayerIndex + 1);
    }
  };

  const handlePreviousLayer = () => {
    if (currentLayerIndex > 0) {
      setCurrentLayerIndex(currentLayerIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Failed to load the post.</p>
      </div>
    );
  }

  return (
    <main className="p-3 flex flex-col w-full mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 mb-0 pb-0 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post?.title}
      </h1>
      <h6 className="text-3xl mt-2 p-3 text-center font-serif max-w-lg mx-auto lg:text-4xl">
        {post?.subtitle}
      </h6>
      <Link to={`/${post?.category}`} className="self-center mt-5">
        <Button color="gray" pill size="xs">
          {post
            ? post.category.charAt(0).toUpperCase() + post.category.slice(1)
            : "N/A"}
        </Button>
      </Link>
      {post?.cover_image && (
        <img
          src={post.cover_image}
          alt={post.title}
          className="mt-10 p-3 h-auto w-auto object-contain self-center"
        />
      )}
      {post?.category === "tutorials" && (
        <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
          <span>{post && new Date(post.created_at).toLocaleDateString()}</span>
          <span className="italic">
            {post && Math.ceil(post.content.length / 250) > 1
              ? `${Math.ceil(post.content.length / 250)} mins read`
              : ">1 min read"}
          </span>
        </div>
      )}
      {post?.category === "tutorials" && (
        <div
          className="p-3 max-w-2xl mx-auto w-full post-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>
      )}
      {post?.category === "blogs" && (
        <div
          className="p-3 max-w-2xl mx-auto w-full post-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>
      )}
      {post?.category === "resume" && (
        <div className="flex flex-col">
          <div ref={mountRef} className="w-3/4 h-full relative" />
          <div className="mt-4 mx-auto">
            <button
              onClick={handlePreviousLayer}
              className="py-2 px-4 bg-gray-500 text-white mr-2 rounded-lg"
              disabled={currentLayerIndex === 0}
            >
              Previous Layer
            </button>
            <button
              onClick={handleNextLayer}
              className="py-2 px-4 bg-gray-500 text-white rounded-lg"
              disabled={
                contentObject
                  ? currentLayerIndex === contentObject.layers.length - 1
                  : false
              }
            >
              Next Layer
            </button>
          </div>
        </div>
      )}
      {renderedComponent && (
        <div className="p-3 mx-auto w-full flex flex-col justify-center items-center">
          <div className="rendered-component">{renderedComponent}</div>
          {codeSnippet && (
            <div className="code-snippet flex flex-col justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
              <Button
                onClick={() => setIsCodeVisible(!isCodeVisible)}
                size="sm"
                color="blue"
              >
                {isCodeVisible ? "Hide Code" : "Show Code"}
              </Button>
              {isCodeVisible && (
                <pre className=" p-3 mt-2 rounded">
                  <code>{codeSnippet}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      )}
      <CommentSection postId={post?.id} />
      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts &&
            recentPosts.map((recentPost) => (
              <PostCard key={recentPost.id} post={recentPost} />
            ))}
        </div>
      </div>{" "}
    </main>
  );
}
