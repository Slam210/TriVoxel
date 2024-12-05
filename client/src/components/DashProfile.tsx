import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { Alert, Button, Modal, TextInput } from "flowbite-react";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserFailure,
  deleteUserSuccess,
  signoutSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from "react-router-dom";

interface UserState {
  user: {
    currentUser: {
      id: number;
      profile_picture: string;
      username: string;
      email: string;
      roleid: string;
    };
    error: any;
    loading: any;
  };
}

export default function DashProfile(): JSX.Element {
  const { currentUser, error, loading } = useSelector(
    (state: UserState) => state.user
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFileURL, setImageFileURL] = useState<string | null>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState<
    number | null
  >(null);
  const [imageFileUploadError, setImageFileUploadError] = useState<
    string | null
  >(null);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [updateUserSuccess, setUpdateUserSuccess] = useState<string | null>(
    null
  );
  const [updateUserError, setUpdateUserError] = useState<string | null>(null);
  const [imageFileUploading, setImageFileUploading] = useState<Boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageFileURL(URL.createObjectURL(file));
    }
  };

  const uploadImage = () => {
    setImageFileUploadError(null);
    setImageFileUploading(true);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + (imageFile ? imageFile.name : "");
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
          setImageFileUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(
            (downloadURL: SetStateAction<string | null>) => {
              setImageFileURL(downloadURL);
              setFormData({ ...formData, profilePicture: downloadURL });
              setImageFileUploading(false);
            }
          );
        }
      );
    }
    setImageFileUploading(false);
    return;
  };

  const handleChange = (e: { target: { id: any; value: any } }) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);

    if (Object.keys(formData).length === 0) {
      setUpdateUserError("No changes made");
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError("Please wait for image to upload");
      return;
    }
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
      } else {
        dispatch(updateSuccess(data));
        setUpdateUserSuccess("User's profile updated successfully");
      }
    } catch (error: any) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
    }
  };

  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
      } else {
        dispatch(deleteUserSuccess(data));
      }
    } catch (error: any) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
      }
    } catch (error: any) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (imageFile) {
      uploadImage();
    }
  }, [imageFile]);

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-3 w-full">
      <h1 className="my-4 text-center font-semibold text-3xl">Profile</h1>
      <form className="flex flex-col gap-8 w-full" onSubmit={handleSubmit}>
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
          onChange={handleChange}
        />
        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
          className="w-full"
          onChange={handleChange}
        />
        <TextInput
          type="password"
          id="password"
          placeholder="password"
          className="w-full"
          onChange={handleChange}
        />
        <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
          <button
            className="w-full bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg"
            disabled={loading || imageFileUploading}
          >
            {loading ? "Loading..." : "Update"}
          </button>
        </div>
        {currentUser.roleid &&
          (currentUser.roleid === "admin" ||
            currentUser.roleid === "contributor" ||
            currentUser.roleid === "verifieduser") && (
            <Link to={"/create-post"}>
              <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
                <button
                  className="w-full bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg"
                  disabled={loading || imageFileUploading}
                >
                  Create a Post
                </button>
              </div>
            </Link>
          )}
        {currentUser.roleid &&
          (currentUser.roleid === "admin" ||
            currentUser.roleid === "contributor" ||
            currentUser.roleid === "verifieduser") && (
            <Link to={"/create-resume"}>
              <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
                <button
                  className="w-full bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg"
                  disabled={loading || imageFileUploading}
                >
                  Create A Resume
                </button>
              </div>
            </Link>
          )}
      </form>
      <div className="text-red-500 flex justify-between w-full m-5">
        <span
          className="cursor-pointer hover:text-red-700"
          onClick={() => {
            setShowModal(true);
          }}
        >
          Delete Account
        </span>
        <span
          className="cursor-pointer hover:text-red-700"
          onClick={() => {
            handleSignout();
          }}
        >
          Sign Out
        </span>
      </div>
      {updateUserSuccess && (
        <Alert color="success" className="mt-5">
          {updateUserSuccess}
        </Alert>
      )}
      {updateUserError && (
        <Alert color="failure" className="mt-5">
          {updateUserError}
        </Alert>
      )}
      {error && (
        <Alert color="failure" className="mt-5">
          {error}
        </Alert>
      )}
      {
        <Modal
          show={showModal}
          onClose={() => setShowModal(false)}
          popup
          size="md"
        >
          <Modal.Header />
          <Modal.Body>
            <div className="text-center">
              <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto" />
              <h3 className="mb-5 text-lg text-gray-500 dark:text-gray-400">
                Are you sure you want to delete your account?
              </h3>
              <div className="flex justify-center gap-4">
                <Button color="failure" onClick={handleDeleteUser}>
                  Yes, I'm sure
                </Button>
                <Button color="gray" onClick={() => setShowModal(false)}>
                  No, cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      }
    </div>
  );
}
