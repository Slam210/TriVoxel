import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, TextInput } from "flowbite-react";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileURL, setImageFileURL] = useState<string | null>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState<
    number | null
  >(null);
  const [imageFileUploadError, setImageFileUploadError] = useState<
    string | null
  >(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageFileURL(URL.createObjectURL(file));
    }
  };

  const uploadImage = () => {
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + (imageFile ? imageFile.name : ""); // Correctly calling getTime()
    const storageRef = ref(storage, fileName);
    const uploadTask = imageFile
      ? uploadBytesResumable(storageRef, imageFile)
      : null;
    if (uploadTask) {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageFileUploadProgress(Math.round(progress));
        },

        (_error) => {
          setImageFileUploadError(
            "Could not upload image (File must be less than 2MB)"
          );
          setImageFileUploadProgress(null);
          setImageFile(null);
          setImageFileURL(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(
            (downloadURL: SetStateAction<string | null>) => {
              setImageFileURL(downloadURL);
            }
          );
        }
      );
    }

    return;
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-3 w-full">
      <h1 className="my-4 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-8 w-full">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="w-32 h-32 mx-auto cursor-pointer shadow-md overflow-hidden rounded-full relative"
          onClick={() => filePickerRef.current?.click()}
        >
          {imageFileUploadProgress !== null &&
            imageFileUploadProgress < 100 && (
              <CircularProgressbar
                value={imageFileUploadProgress || 0}
                text={`${imageFileUploadProgress}%`}
                strokeWidth={5}
                styles={{
                  root: {
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                  },
                  path: {
                    stroke: `rgba(50, 150, 255, ${
                      imageFileUploadProgress / 100
                    })`,
                  },
                }}
              />
            )}
          <img
            src={imageFileURL || currentUser.profile_picture}
            alt="Profile Picture"
            className={`${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              "opacity-60"
            } rounded-full w-full h-full border-8 border-[lightgray] object-cover`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color="failure">{imageFileUploadError}</Alert>
        )}
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
