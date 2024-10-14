import { Button, Select, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostCard from "../components/PostCard";

// Define Post interface
interface Post {
  id: any;
  title: string;
  category: string;
  content: string;
  subtitle: string;
  cover_image: string;
  created_at: string; // Ensure this is a string representing the date
  slug: string;
}

const Resumes: React.FC = () => {
  const [sidebarData, setSidebarData] = useState({
    searchTerm: "",
    sort: "desc",
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm");
    const sortFromUrl = urlParams.get("sort");

    setSidebarData({
      ...sidebarData,
      searchTerm: searchTermFromUrl || "",
      sort: sortFromUrl || "desc",
    });

    const fetchPosts = async () => {
      setLoading(true);
      // Add the default category "resumes" to the query
      const searchQuery = urlParams.toString() + "&category=resume";
      const res = await fetch(`/api/post/getposts?${searchQuery}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      console.log(data);
      setPosts(data.posts);
      setLoading(false);
      setShowMore(data.posts.length === 9);
    };
    fetchPosts();
  }, [location.search]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { id, value } = e.target;

    setSidebarData((prevData) => ({
      ...prevData,
      [id]: value || "",
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("searchTerm", sidebarData.searchTerm);
    urlParams.set("sort", sidebarData.sort);
    const searchQuery = urlParams.toString();
    navigate(`/resumes?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const startIndex = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("startIndex", startIndex.toString());
    // Add the default category "resumes" to the query
    const searchQuery = urlParams.toString() + "&category=resumes";
    const res = await fetch(`/api/post/getposts?${searchQuery}`);
    if (!res.ok) {
      return;
    }
    const data = await res.json();
    setPosts((prevPosts) => [...prevPosts, ...data.posts]);
    setShowMore(data.posts.length === 9);
  };

  // Sort posts by created_at when rendering
  const sortedPosts = [...posts].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sidebarData.sort === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-7 border-b md:border-r md:min-h-screen border-gray-500">
        <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap font-semibold">
              Search Term:
            </label>
            <TextInput
              placeholder="Search..."
              id="searchTerm"
              type="text"
              value={sidebarData.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-semibold">Sort:</label>
            <Select onChange={handleChange} value={sidebarData.sort} id="sort">
              <option value="">Select an option</option>
              <option value="desc">Latest</option>
              <option value="asc">Oldest</option>
            </Select>
          </div>
          <Button
            type="submit"
            outline
            className="bg-gradient-to-r from-slate-700 to-green-400"
          >
            Apply Filters
          </Button>
        </form>
      </div>
      <div className="w-full">
        <h1 className="text-3xl font-semibold sm:border-b border-gray-500 p-3 mt-5 ">
          Resumes results:
        </h1>
        <div className="p-7 flex flex-wrap gap-4">
          {!loading && sortedPosts.length === 0 && (
            <p className="text-xl text-gray-500">No posts found.</p>
          )}
          {loading && <p className="text-xl text-gray-500">Loading...</p>}
          {!loading &&
            sortedPosts.map((post) => <PostCard key={post.id} post={post} />)}
          {showMore && (
            <button
              onClick={handleShowMore}
              className="text-teal-500 text-lg hover:underline p-7 w-full bg-gradient-to-r from-slate-700 to-green-400"
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resumes;
