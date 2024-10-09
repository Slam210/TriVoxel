import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TextInput, Select, Alert } from "flowbite-react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Font,
  Paragraph,
  Heading,
  Strikethrough,
  Subscript,
  Superscript,
  Code,
  Indent,
  CodeBlock,
  BlockQuote,
  Link,
  AutoImage,
  AutoLink,
  Image,
  ImageCaption,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  LinkImage,
  List,
  TodoList,
  ImageUpload,
  Base64UploadAdapter,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import "../css/ckeditor.css";
import "../css/choosefile.css";

interface UserState {
  user: {
    currentUser: {
      roleid: string;
    };
  };
}

export default function CreatePost() {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement | null>(null); // Create a ref for the editor container

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
  const { currentUser } = useSelector((state: UserState) => state.user);

  const [publishError, setPublishError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFormData({ ...formData, coverImage: file });
      setImagePreview(URL.createObjectURL(file));
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
    setPublishError(null);

    const { coverImage, ...dataToSubmit } = formData;

    try {
      let coverImageUrl: string | null = null;
      if (coverImage) {
        coverImageUrl = await handleImageUpload(coverImage);
      }

      const contentIsEmpty =
        !formData.content || formData.content === "<p><br></p>";
      if (contentIsEmpty) {
        setPublishError("Content cannot be empty.");
        return;
      }

      const payload = { ...dataToSubmit, cover_image: coverImageUrl };

      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError("Something went wrong");
    }
  };

  useEffect(() => {
    let editorInstance: any = null;

    if (editorRef.current) {
      ClassicEditor.create(editorRef.current, {
        plugins: [
          Essentials,
          Bold,
          Italic,
          Font,
          Paragraph,
          Heading,
          Strikethrough,
          Subscript,
          Superscript,
          Code,
          Indent,
          CodeBlock,
          BlockQuote,
          Link,
          AutoImage,
          AutoLink,
          Image,
          ImageToolbar,
          ImageCaption,
          ImageStyle,
          ImageResize,
          ImageUpload,
          LinkImage,
          List,
          TodoList,
          Base64UploadAdapter,
        ],
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "fontfamily",
            "fontsize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "bold",
            "italic",
            "strikethrough",
            "subscript",
            "superscript",
            "code",
            "|",
            "link",
            "insertImage",
            "blockQuote",
            "codeBlock",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
            "|",
            "linkImage",
          ],
          shouldNotGroupWhenFull: true,
        },
        image: {
          toolbar: [
            "imageStyle:block",
            "imageStyle:side",
            "|",
            "toggleImageCaption",
            "imageTextAlternative",
            "|",
            "linkImage",
          ],
          insert: {
            type: "auto",
          },
        },
      })
        .then((editor) => {
          editorInstance = editor; // Save the editor instance for cleanup
          console.log("Editor was initialized", editor);
        })
        .catch((error) => {
          console.error("There was a problem initializing the editor", error);
        });
    }

    // Cleanup on unmount
    return () => {
      if (editorInstance) {
        editorInstance.destroy().catch((error: any) => {
          console.error("Error during editor destruction", error);
        });
      }
    };
  }, []);

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
            className="flex-1 "
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <Select
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
          >
            <option value="">Select a category</option>
            {(currentUser.roleid === "admin" ||
              currentUser.roleid === "contributor") && (
              <option value="tutorials">Tutorial</option>
            )}
            {(currentUser.roleid === "admin" ||
              currentUser.roleid === "contributor" ||
              currentUser.roleid === "verifieduser") && (
              <option value="blogs">Blog</option>
            )}
            {(currentUser.roleid === "admin" ||
              currentUser.roleid === "contributor" ||
              currentUser.roleid === "verifieduser" ||
              currentUser.roleid === "user") && (
              <option value="resume">Resume</option>
            )}
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
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white dark:bg-black dark:text-gray-400 focus:outline-none dark:border-gray-600 placeholder-white dark:placeholder-black "
          required
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Cover Preview"
            className="mt-4 border dark:border-[#4b5563] rounded max-w-full h-auto p-4"
          />
        )}

        {/* CKEditor 5 */}
        <div ref={editorRef} id="editor" className="editor-container"></div>

        <div className="bg-gradient-to-tr from-red-400 via-blue-400 to-green-400 bg-transparent p-0.5 rounded-lg">
          <button
            className="w-full bg-white dark:bg-black hover:bg-gradient-to-tr hover:from-red-400 hover:via-blue-400 hover:to-green-400 px-4 py-2 rounded-lg "
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
