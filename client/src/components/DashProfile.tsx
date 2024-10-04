import { TextInput } from "flowbite-react";
import { useSelector } from "react-redux";

interface UserState {
  user: {
    currentUser: {
      profile_picture: string;
      username: string;
      email: string;
    };
  };
}

export default function DashProfile(): JSX.Element {
  const { currentUser } = useSelector((state: UserState) => state.user);

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-3 w-full">
      <h1 className="my-4 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-8 w-full">
        <div className="w-32 h-32 mx-auto cursor-pointer shadow-md overflow-hidden rounded-full">
          <img
            src={currentUser.profile_picture}
            alt="Profile Picture"
            className="rounded-full w-full h-full border-8 border-[lightgray] object-cover"
          />
        </div>
        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
          className="w-full"
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          className="w-full"
        />
        <TextInput
          type="password"
          id="password"
          placeholder="password"
          className="w-full"
        />
        <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
          <button className="w-full bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg">
            Update
          </button>
        </div>
      </form>
      <div className="text-red-500 flex justify-between w-full m-5">
        <span className="cursor-pointer hover:text-red-700">
          Delete Account
        </span>
        <span className="cursor-pointer hover:text-red-700">Sign Out</span>
      </div>
    </div>
  );
}
