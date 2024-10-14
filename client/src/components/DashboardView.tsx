import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  HiAnnotation,
  HiArrowNarrowUp,
  HiDocumentText,
  HiOutlineUserGroup,
  HiArrowNarrowDown,
} from "react-icons/hi";
import { Button, Table } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";

// Define types for the user, comment, and post data
interface User {
  id: string;
  profile_picture: string;
  username: string;
}

interface Comment {
  id: string;
  content: string;
  number_of_likes: number;
}

interface Post {
  id: string;
  cover_image: string;
  title: string;
  category: string;
}

interface CurrentUser {
  roleid: string;
}

// Define the state shape for Redux
interface RootState {
  user: {
    currentUser: CurrentUser;
  };
}

export default function DashboardView() {
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const [totalComments, setTotalComments] = useState<number>(0);
  const [lastMonthUsers, setLastMonthUsers] = useState<number>(0);
  const [lastMonthPosts, setLastMonthPosts] = useState<number>(0);
  const [lastMonthComments, setLastMonthComments] = useState<number>(0);
  const navigate = useNavigate();

  // Use the RootState type to specify the type of state in useSelector
  const { currentUser } = useSelector((state: RootState) => state.user);

  const RenderArrow = ({ value }: { value: number }) => {
    if (value > 0) {
      return (
        <span className="text-green-500 flex items-center">
          <HiArrowNarrowUp />
          {value}
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="text-red-500 flex items-center">
          <HiArrowNarrowDown />
          {value}
        </span>
      );
    } else {
      return <span className="text-gray-500 flex items-center">{value}</span>;
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/user/getusers?limit=5");
        const data = await res.json();
        if (res.ok) {
          setUsers(data.users);
          setTotalUsers(data.totalUsers);
          setLastMonthUsers(data.lastMonthUsers);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/post/getposts?limit=5");
        const data = await res.json();
        if (res.ok) {
          setPosts(data.posts);
          setTotalPosts(data.totalPosts);
          setLastMonthPosts(data.lastMonthPosts);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch("/api/comment/getcomments?limit=5");
        const data = await res.json();
        if (res.ok) {
          setComments(data.comments);
          setTotalComments(data.totalComments);
          setLastMonthComments(data.lastMonthComments);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };

    if (currentUser.roleid === "admin") {
      fetchUsers();
      fetchPosts();
      fetchComments();
    }
  }, [currentUser]);

  return (
    <div className="p-6 md:mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
        {/* Column 1: Users */}
        <div className="flex flex-col col-span-3">
          {/* Total Users Card */}
          <div
            className="cursor-pointer flex flex-col p-5 bg-white dark:bg-slate-800 gap-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onClick={() => {
              navigate("/dashboard?tab=users");
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 text-md font-semibold uppercase">
                  Total Users
                </h3>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
              <HiOutlineUserGroup className="bg-teal-600 text-white rounded-full text-6xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm text-gray-500">
              <RenderArrow value={lastMonthUsers} />
              <span>Last month</span>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="flex flex-col w-full shadow-md p-4 rounded-lg bg-white dark:bg-gray-800 transition-shadow hover:shadow-lg mt-4">
            <div className="flex justify-between p-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
              <h1 className="text-center">Recent Users</h1>
              <Button
                outline
                className="bg-gradient-to-r from-slate-700 to-green-400"
              >
                <Link to={"/dashboard?tab=users"}>See all</Link>
              </Button>
            </div>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>User Image</Table.HeadCell>
                <Table.HeadCell>Username</Table.HeadCell>
              </Table.Head>
              {users.map((user) => (
                <Table.Body key={user.id} className="divide-y">
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      <img
                        src={user.profile_picture}
                        alt="user"
                        className="w-12 h-12 rounded-full bg-gray-500"
                      />
                    </Table.Cell>
                    <Table.Cell>{user.username}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
          </div>
        </div>

        {/* Column 2: Comments */}
        <div className="flex flex-col col-span-3">
          {/* Total Comments Card */}
          <div
            className="flex flex-col p-5 bg-white dark:bg-slate-800 gap-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => {
              navigate("/dashboard?tab=comments");
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 text-md font-semibold uppercase">
                  Total Comments
                </h3>
                <p className="text-3xl font-bold">{totalComments}</p>
              </div>
              <HiAnnotation className="bg-indigo-600 text-white rounded-full text-6xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm text-gray-500">
              <RenderArrow value={lastMonthComments} />
              <span>Last month</span>
            </div>
          </div>

          {/* Recent Comments Table */}
          <div className="flex flex-col w-full shadow-md p-4 rounded-lg bg-white dark:bg-gray-800 transition-shadow hover:shadow-lg mt-4">
            <div className="flex justify-between p-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
              <h1 className="text-center">Recent Comments</h1>
              <Button
                outline
                className="bg-gradient-to-r from-slate-700 to-green-400"
              >
                <Link to={"/dashboard?tab=comments"}>See all</Link>
              </Button>
            </div>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Comment Content</Table.HeadCell>
                <Table.HeadCell>Likes</Table.HeadCell>
              </Table.Head>
              {comments.map((comment) => (
                <Table.Body key={comment.id} className="divide-y">
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell className="w-96">
                      <p className="line-clamp-2">{comment.content}</p>
                    </Table.Cell>
                    <Table.Cell>{comment.number_of_likes}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
          </div>
        </div>

        {/* Column 3: Posts */}
        <div className="flex flex-col col-span-4">
          {/* Total Posts Card */}
          <div
            className="flex flex-col p-5 bg-white dark:bg-slate-800 gap-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
            onClick={() => {
              navigate("/dashboard?tab=posts");
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-gray-600 text-md font-semibold uppercase">
                  Total Posts
                </h3>
                <p className="text-3xl font-bold">{totalPosts}</p>
              </div>
              <HiDocumentText className="bg-lime-600 text-white rounded-full text-6xl p-3 shadow-lg" />
            </div>
            <div className="flex gap-2 text-sm text-gray-500">
              <RenderArrow value={lastMonthPosts} />
              <span>Last month</span>
            </div>
          </div>

          {/* Recent Posts Table */}
          <div className="flex flex-col w-full shadow-md p-4 rounded-lg bg-white dark:bg-gray-800 transition-shadow hover:shadow-lg mt-4">
            <div className="flex justify-between p-3 text-lg font-semibold text-gray-700 dark:text-gray-300">
              <h1 className="text-center">Recent Posts</h1>
              <Button
                outline
                className="bg-gradient-to-r from-slate-700 to-green-400"
              >
                <Link to={"/dashboard?tab=posts"}>See all</Link>
              </Button>
            </div>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Post Image</Table.HeadCell>
                <Table.HeadCell>Post Title</Table.HeadCell>
                <Table.HeadCell>Category</Table.HeadCell>
              </Table.Head>
              {posts.map((post) => (
                <Table.Body key={post.id} className="divide-y">
                  <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell>
                      <img
                        src={post.cover_image}
                        alt="post"
                        className="w-16 h-12 rounded-md bg-gray-500"
                      />
                    </Table.Cell>
                    <Table.Cell className="w-96">{post.title}</Table.Cell>
                    <Table.Cell className="w-20">{post.category}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              ))}
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
