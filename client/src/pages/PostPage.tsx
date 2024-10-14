import { Button, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";
import "../css/post.css";

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

export default function PostPage() {
  const { postSlug } = useParams<{ postSlug: string }>(); // Type for useParams
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [post, setPost] = useState<Post | null>(null);
  const [sanitizedContent, setSanitizedContent] = useState<string>("");
  const [recentPosts, setRecentPosts] = useState<Post[] | null>(null);

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
      <div className="flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs">
        <span>{post && new Date(post.created_at).toLocaleDateString()}</span>
        <span className="italic">
          {post && Math.ceil(post.content.length / 250) > 1
            ? `${Math.ceil(post.content.length / 250)} mins read`
            : ">1 min read"}
        </span>
      </div>
      <div
        className="p-3 max-w-2xl mx-auto w-full post-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      ></div>
      <CommentSection postId={post?.id} />
      <div className="flex flex-col justify-center items-center mb-5">
        <h1 className="text-xl mt-5">Recent articles</h1>
        <div className="flex flex-wrap gap-5 mt-5 justify-center">
          {recentPosts &&
            recentPosts.map((recentPost) => (
              <PostCard key={recentPost.id} post={recentPost} />
            ))}
        </div>
      </div>
    </main>
  );
}
