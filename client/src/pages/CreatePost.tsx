import { Alert, Button, Select, TextInput } from "flowbite-react";
import React, { useState } from "react";
import ReactQuill from "react-quill-new"; // Import react-quill-new
import "react-quill-new/dist/quill.snow.css"; // Import the Quill CSS

export default function CreatePost() {
  const [formData, setFormData] = useState<{
    title?: string;
    category?: string;
    content: string;
  }>({
    title: "",
    category: "",
    content: "", // Initialize content as an empty string
  });
  const [publishError, setPublishError] = useState<string | null>(null);

  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
      [{ direction: "rtl" }], // text direction
      [{ size: ["small", false, "large", "huge"] }], // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"], // remove formatting button
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPublishError(null); // Clear any existing error

    if (!formData.content || formData.content.trim() === "") {
      setPublishError("Content is required.");
      return;
    }

    try {
      const res = await fetch("/api/post/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message || "Failed to create the post.");
        return;
      }

      setFormData({ title: "", category: "", content: "" });
    } catch (error) {
      setPublishError("An unexpected error occurred. Please try again.");
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

        {/* React Quill for rich text content */}
        <ReactQuill
          value={formData.content || ""}
          onChange={(content) => setFormData({ ...formData, content })}
          modules={modules}
          formats={formats}
          placeholder="Start typing your post content here..."
        />

        <Button type="submit" gradientDuoTone="purpleToPink">
          Publish
        </Button>

        {publishError && (
          <Alert className="mt-5" color="failure">
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
