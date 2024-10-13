import { Link } from "react-router-dom";

interface Post {
  slug: string;
  cover_image: string;
  title: string;
  category: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <div className="group relative w-full border border-teal-500 hover:border-2 h-[250px] overflow-hidden rounded-lg sm:w-[250px] transition-all">
      <Link to={`/post/${post.slug}`}>
        <div className="h-[150px] w-full flex justify-center pt-4">
          <img
            src={post.cover_image}
            alt="post cover"
            className="h-full w-auto object-contain transition-all duration-300 z-20"
          />
        </div>
      </Link>
      <div className="p-2 flex flex-col gap-1">
        <p className="text-md font-semibold line-clamp-2">{post.title}</p>
        <span className="italic text-xs">{post.category}</span>
        <Link
          to={`/post/${post.slug}`}
          className="z-10 group-hover:bottom-0 absolute bottom-[-100px] left-0 right-0 border border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-300 text-center py-1 rounded-lg m-1"
        >
          Read article
        </Link>
      </div>
    </div>
  );
}
