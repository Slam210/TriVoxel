import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";

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

const Home: React.FC = () => {
  const [tutorials, setTutorials] = useState<Post[]>([]);
  const [blogs, setBlogs] = useState<Post[]>([]);
  const [resumes, setResumes] = useState<Post[]>([]);

  // Fetch posts based on category
  const fetchPosts = async (category: string) => {
    const res = await fetch(`/api/post/getPosts?category=${category}`);
    const data = await res.json();
    return data.posts;
  };

  useEffect(() => {
    const fetchAllPosts = async () => {
      const fetchedTutorials = await fetchPosts("tutorials");
      const fetchedBlogs = await fetchPosts("blogs");
      const fetchedResumes = await fetchPosts("resume");

      setTutorials(fetchedTutorials);
      setBlogs(fetchedBlogs);
      setResumes(fetchedResumes);
    };

    fetchAllPosts();
  }, []);

  return (
    <div>
      <div className="flex flex-col gap-6 pt-20 px-3 max-w-6xl mx-auto text-center ">
        <h1 className="text-xl font-bold lg:text-3xl">
          Welcome to the TriVoxel Community
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm">
          Here you'll find a wealth of resources dedicated to 3D JavaScript
          development. Whether you're a seasoned developer or just starting out,
          TriVoxel is your hub for tutorials, blogs, and a supportive community.
          Discover your place, help others, and enhance your skills in the world
          of 3D animations.
        </p>
        <Link
          to="/search"
          className="text-xs sm:text-sm text-teal-500 font-bold hover:underline"
        >
          View all posts
        </Link>
      </div>

      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7 justify-center">
        {/* Recent Tutorials Section */}
        {tutorials && tutorials.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-center">
              Recent Tutorials
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {tutorials.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Link
              to={"/tutorials"}
              className="text-lg text-teal-500 hover:underline text-center"
            >
              View all tutorials
            </Link>
          </div>
        )}

        {/* Recent Blogs Section */}
        {blogs && blogs.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-center">Recent Blogs</h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {blogs.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Link
              to={"/blogs"}
              className="text-lg text-teal-500 hover:underline text-center"
            >
              View all blogs
            </Link>
          </div>
        )}

        {/* Recent Resumes Section */}
        {resumes && resumes.length > 0 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold text-center">
              Recent Resumes
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              {resumes.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <Link
              to={"/esume"}
              className="text-lg text-teal-500 hover:underline text-center"
            >
              View all resumes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
