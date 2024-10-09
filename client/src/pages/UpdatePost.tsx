import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
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

interface UserState {
  user: {
    currentUser: {
      id: string;
      roleid: string;
    };
  };
}

interface PostData {
  id: Number;
  title: string;
  category: string;
  content: string;
  subtitle: string;
  cover_image: string;
}

export default function UpdatePost() {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const { postId } = useParams<{ postId: string }>();

  const [editorInstance, setEditorInstance] = useState<any>(null); // State for the editor instance

  const [formData, setFormData] = useState<{
    id: Number | null;
    title?: string;
    category?: string;
    content: string;
    subtitle?: string;
    coverImage?: File | null;
  }>({
    id: null,
    title: "",
    category: "",
    content: "",
    subtitle: "",
    coverImage: null,
  });

  const { currentUser } = useSelector((state: UserState) => state.user);
  const [publishError, setPublishError] = useState<string | null | undefined>(
    null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, coverImage: file }));
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

  const submitPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { coverImage, ...dataToSubmit } = formData;

    try {
      let coverImageUrl: string | null = null;
      if (coverImage) {
        coverImageUrl = await handleImageUpload(coverImage);
      }

      const payload = { ...dataToSubmit, cover_image: coverImageUrl };
      payload.content = editorInstance.getData();
      if (!payload.content || payload.content === "<p><br></p>") {
        setPublishError("Content cannot be empty.");
        return;
      }

      const res = await fetch(
        `/api/post/updatepost/${formData.id}/${currentUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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
          setEditorInstance(editor); // Store the editor instance in state
        })
        .catch((error) => {
          console.error("There was a problem initializing the editor", error);
        });
    }

    return () => {
      if (editorInstance) {
        editorInstance.destroy().catch((error: any) => {
          console.error("Error during editor destruction", error);
        });
      }
    };
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data: { posts: PostData[]; message?: string } = await res.json();

        if (!res.ok) {
          console.log(data.message);
          setPublishError(data.message);
          return;
        }

        setPublishError(null);
        setFormData(data.posts[0]);
        if (editorInstance) {
          editorInstance.setData(data.posts[0].content); // Set editor content here
        }
        if (data.posts[0].cover_image) {
          setImagePreview(data.posts[0].cover_image);
        }
      } catch (error) {
        setPublishError("Error fetching post data");
        console.error("Error fetching post:", error);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, editorInstance]);

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update Post</h1>
      <form className="flex flex-col gap-4" onSubmit={submitPost}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title"
            required
            id="title"
            className="flex-1 "
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            value={formData.title}
          />
          <Select
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
            required
            value={formData.category}
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
            setFormData((prev) => ({ ...prev, subtitle: e.target.value }))
          }
          required
          value={formData.subtitle}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white dark:bg-black dark:text-gray-400 focus:outline-none dark:border-gray-600 placeholder-white dark:placeholder-black "
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
            Update
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
