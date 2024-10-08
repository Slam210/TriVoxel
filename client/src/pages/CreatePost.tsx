import { Alert, Select, TextInput } from "flowbite-react";
import React, { useState } from "react";
import ReactQuill from "react-quill-new"; // Import react-quill-new
import "react-quill-new/dist/quill.snow.css"; // Import the Quill CSS
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage"; // Import Firebase Storage functions
import { app } from "../firebase"; // Import your Firebase app

export default function CreatePost() {
  const navigate = useNavigate(); // Initialize navigation
  const [formData, setFormData] = useState<{
    title?: string;
    category?: string;
    content: string;
    subtitle?: string;
    coverImage?: File | null; // File type for the uploaded image
  }>({
    title: "",
    category: "",
    content: "",
    subtitle: "",
    coverImage: null,
  });

  const [publishError, setPublishError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "align",
    "background",
    "blockquote",
    "bold",
    "code-block",
    "color",
    "font",
    "header",
    "image",
    "italic",
    "link",
    "script",
    "strike",
    "size",
    "underline",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFormData({ ...formData, coverImage: file }); // Get the first file
      setImagePreview(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    const storage = getStorage(app);
    const storageRef = ref(storage, `${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Image upload failed", error);
          reject("Image upload failed");
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              resolve(downloadURL);
            })
            .catch((error) => {
              console.error("Failed to get download URL", error);
              reject("Failed to get image URL");
            });
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPublishError(null); // Clear any existing error

    const { coverImage, ...dataToSubmit } = formData;

    try {
      // Handle the cover image upload
      let coverImageUrl: string | null = null;
      if (coverImage) {
        coverImageUrl = await handleImageUpload(coverImage); // Upload and get URL
      }

      // Include the image URL in the data to submit
      const payload = { ...dataToSubmit, cover_image: coverImageUrl };

      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // Send the JSON payload
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`); // Navigate to the created post
      }
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Create a post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="uncategorized">Select a category</option>
            <option value="tutorials">Tutorial</option>
            <option value="blogs">Blog</option>
            <option value="resume">Resume</option>
          </Select>
        </div>

        <TextInput
          type="text"
          placeholder="Subtitle"
          id="subtitle"
          className="flex-1"
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value })
          }
        />

        {/* Input for cover image */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="rounded"
        />

        {/* Image preview */}
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Cover Preview"
            className="mt-4 border rounded max-w-full h-auto"
          />
        )}

        {/* React Quill for rich text content */}
        <ReactQuill
          value={formData.content || ""}
          onChange={(content) => setFormData({ ...formData, content })}
          modules={modules}
          formats={formats}
          placeholder="Start typing your post content here..."
        />

        <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
          <button
            className="w-full bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg"
            type="submit"
          >
            Publish
          </button>
        </div>

        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
