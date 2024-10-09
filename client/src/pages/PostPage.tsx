import { Button, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";

// Define Post interface
interface Post {
  id: number;
  title: string;
  category: string;
  content: string;
  subtitle: string;
  cover_image: string;
  created_at: string; // Added missing 'created_at' property
}

export default function PostPage() {
  const { postSlug } = useParams<{ postSlug: string }>(); // Type for useParams
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [post, setPost] = useState<Post | null>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string>("");

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
          setPost(data.posts[0]);
          setSanitizedContent(
            data.posts[0].content
              ? DOMPurify.sanitize(data.posts[0].content)
              : ""
          );
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
    <main className="p-3 flex flex-col max-w-6xl mx-auto min-h-screen">
      <h1 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post?.title}
      </h1>
      <h6 className="text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl">
        {post?.title}
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
      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <span>{post && new Date(post.created_at).toLocaleDateString()}</span>
        <span className="italic">
          {post &&
            ((post.content.length / 250).toFixed(0) === "0"
              ? ">1"
              : (post.content.length / 250).toFixed(0))}{" "}
          mins read
        </span>
      </div>
      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      ></div>
    </main>
  );
}
