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

interface UserState {
  user: {
    currentUser: {
      roleid: string;
    };
  };
}

export default function CreatePost() {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement | null>(null); // Ref for the editor container
  const [editorInstance, setEditorInstance] = useState<any>(null); // Editor instance

  const [formData, setFormData] = useState<{
    title?: string;
    category?: string;
    content: string;
    subtitle?: string;
    coverImage?: File | null;
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

  const [contentUpdated, setContentUpdated] = useState(false); // Track content update

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPublishError(null);

    if (editorInstance) {
      const editorData = editorInstance.getData(); // Ensure the editor instance is available
      setFormData((prevFormData) => ({
        ...prevFormData,
        content: editorData,
      }));
    } else {
      setPublishError("Editor is not initialized properly.");
    }

    setContentUpdated(true); // Indicate content is being updated
  };

  useEffect(() => {
    const contentIsEmpty =
      !formData.content || formData.content === "<p><br></p>";

    if (contentUpdated) {
      // Check if content is empty during submission
      if (contentIsEmpty) {
        setPublishError("Content cannot be empty.");
        setContentUpdated(false);
        return;
      }

      submitPost(); // Proceed with submission logic
      setContentUpdated(false); // Reset for next submission
    }
  }, [formData.content]);

  const submitPost = async () => {
    const { coverImage, ...dataToSubmit } = formData;

    try {
      let coverImageUrl: string | null = null;
      if (coverImage) {
        coverImageUrl = await handleImageUpload(coverImage);
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
    // Destroy the current editor instance if it exists
    if (editorInstance) {
      editorInstance.destroy().catch((error: any) => {
        console.error("Error during editor destruction", error);
      });
    }

    // Initialize the new editor based on the category
    if (formData.category && editorRef.current) {
      const isTutorial = formData.category === "tutorials";

      const plugins = isTutorial
        ? [
            Essentials,
            Bold,
            Italic,
            Font,
            Paragraph,
            Heading,
            Strikethrough,
            Code,
            Indent,
            BlockQuote,
            Link,
            AutoImage,
          ]
        : [
            Essentials,
            Bold,
            Italic,
            Font,
            Paragraph,
            Heading,
            Strikethrough,
            Code,
            Indent,
            BlockQuote,
            Link,
            AutoImage,
            CodeBlock,
            ImageUpload,
            Base64UploadAdapter,
          ];

      const toolbarItems = [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "strikethrough",
        "link",
      ];

      if (isTutorial) {
        toolbarItems.push(
          "insertImage",
          "codeBlock",
          "|",
          "bulletedList",
          "numberedList"
        );
      }

      // Create the new editor based on category
      ClassicEditor.create(editorRef.current, {
        plugins: isTutorial
          ? [
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
            ]
          : plugins,
        toolbar: {
          items: isTutorial
            ? [
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
              ]
            : toolbarItems,
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
          setEditorInstance(editor); // Update the state with the new editor instance
        })
        .catch((error) => {
          console.error("There was a problem initializing the editor", error);
        });
    }

    // Cleanup function: Destroy the editor instance when the component unmounts or category changes
    return () => {
      if (editorInstance) {
        editorInstance.destroy().catch((error: any) => {
          console.error("Error during editor destruction", error);
        });
      }
    };
  }, [formData.category]);

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

        {formData.category === "tutorials" && (
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
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white dark:bg-black dark:text-gray-400 focus:outline-none dark:border-gray-600 placeholder-white dark:placeholder-black "
          required
        />

        {imagePreview && (
          <div className="w-64 mx-auto">
            <img src={imagePreview} alt="Preview" className="rounded-lg mt-3" />
          </div>
        )}

        {(formData.category === "tutorials" ||
          formData.category === "blogs") && (
          <div ref={editorRef} className="mt-4"></div>
        )}
        {publishError && <Alert>{publishError}</Alert>}
        <div className="flex gap-2 justify-center mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg"
          >
            Publish
          </button>
          <button
            type="reset"
            className="bg-gray-300 text-black py-2 px-4 rounded-lg"
            onClick={() => setFormData({ ...formData, content: "" })}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
