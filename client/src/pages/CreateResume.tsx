import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

type CreateResumeProps = {};

const CreateResume: React.FC<CreateResumeProps> = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [textTabActive, setTextTabActive] = useState(true);
  const [layers, setLayers] = useState([
    {
      id: 1,
      parts: [{ text: "Default Layer Section", editable: true }],
    },
  ]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);

  // State for color customization
  const [pendingBackgroundColor, setPendingBackgroundColor] =
    useState("#000000");
  const [pendingHeadingTextColor, setPendingHeadingTextColor] =
    useState("#FFFFFF");
  const [pendingHeadingSubtextColor, setPendingHeadingSubtextColor] =
    useState("#FFFFFF");
  const [pendingLayers, setPendingLayers] = useState([...layers]);
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [headingTextColor, setHeadingTextColor] = useState("#FFFFFF");
  const [headingSubtextColor, setHeadingSubtextColor] = useState("#FFFFFF");

  const applyColors = () => {
    setBackgroundColor(pendingBackgroundColor);
    setHeadingTextColor(pendingHeadingTextColor);
    setHeadingSubtextColor(pendingHeadingSubtextColor);

    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(pendingBackgroundColor);
    }
  };

  const applyTextChanges = () => {
    setLayers([...pendingLayers]);
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    partIndex: number
  ) => {
    const newLayers = [...layers]; // Ensure we're using the latest layers
    newLayers[currentLayerIndex].parts[partIndex].text = e.target.value;
    setPendingLayers(newLayers); // Update layers directly
  };

  const fontRef = useRef<any | null>(null);

  useEffect(() => {
    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font: any) => {
        fontRef.current = font;
      }
    );
  }, []);

  const addLayerToScene = (
    layer: { id?: number; parts: any },
    layerIndex: number
  ) => {
    if (!sceneRef.current || !fontRef.current) return;

    const scene = sceneRef.current;
    const font = fontRef.current;

    layer.parts.forEach((part: { text: any }, partIndex: number) => {
      const geometry = new TextGeometry(part.text, {
        font,
        size: 0.3,
        height: 0.05,
      });
      geometry.center();

      // Apply subheading text color to all parts except partIndex === 0
      const material = new THREE.MeshStandardMaterial({
        color: partIndex === 0 ? headingTextColor : headingSubtextColor,
        transparent: true,
        opacity:
          layerIndex === currentLayerIndex
            ? 1
            : layerIndex <= currentLayerIndex
            ? 0.1
            : 0.3,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const verticalSpacing = 0.5;
      mesh.position.set(0, -partIndex * verticalSpacing, -layerIndex * 3);
      scene.add(mesh);
    });
  };

  const handleAddLayer = () => {
    const newLayer = {
      id: layers.length + 1, // Ensure each new layer has a unique ID
      parts: [{ text: "New Layer Section", editable: true }],
    };

    setLayers((prevLayers) => {
      const updatedLayers = [...prevLayers, newLayer];
      addLayerToScene(newLayer, updatedLayers.length - 1);
      return updatedLayers;
    });

    setPendingLayers((prevLayers) => {
      const updatedLayers = [...prevLayers, newLayer];
      addLayerToScene(newLayer, updatedLayers.length - 1);
      return updatedLayers;
    });

    setCurrentLayerIndex(layers.length); // Set the current layer index to the newly added layer's index
  };

  const handleAddSection = () => {
    const newLayers = [...layers];
    newLayers[currentLayerIndex].parts.push({
      text: "New Section",
      editable: true,
    });
    setLayers(newLayers);
    setPendingLayers(newLayers);
  };

  const handleDeleteLayer = () => {
    if (layers.length > 1) {
      const newLayers = layers.filter(
        (_, index) => index !== currentLayerIndex
      );
      setLayers(newLayers);
      if (currentLayerIndex > 0) {
        setCurrentLayerIndex(currentLayerIndex - 1);
      }
    } else {
      alert("You must have at least one layer.");
    }
  };

  const handleDeletePart = (partIndex: number) => {
    if (layers[currentLayerIndex].parts.length > 1) {
      const newLayers = [...layers];
      newLayers[currentLayerIndex].parts = newLayers[
        currentLayerIndex
      ].parts.filter((_, index) => index !== partIndex);
      setLayers(newLayers);
    }
  };

  useEffect(() => {
    if (!mountRef.current || !fontRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    if (mountRef.current) {
      mountRef.current.innerHTML = "";
      mountRef.current.appendChild(renderer.domElement);
    }

    const fontLoader = new FontLoader();
    fontLoader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font: any) => {
        const meshes: THREE.Mesh[] = [];
        layers.forEach((layer, layerIndex) => {
          layer.parts.forEach((part, partIndex) => {
            const geometry = new TextGeometry(part.text, {
              font: font,
              size: 0.3,
              height: 0.05,
            });
            geometry.center();

            const material = new THREE.MeshStandardMaterial({
              color: partIndex === 0 ? headingTextColor : headingSubtextColor,
              transparent: true,
              opacity:
                layerIndex === currentLayerIndex
                  ? 1
                  : layerIndex <= currentLayerIndex
                  ? 0.1
                  : 0.3,
            });

            const mesh = new THREE.Mesh(geometry, material);
            const verticalSpacing = 0.5;
            mesh.position.set(0, -partIndex * verticalSpacing, -layerIndex * 3);
            meshes.push(mesh);
            scene.add(mesh);
          });
        });

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        const animate = () => {
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      }
    );

    const zoomToLayer = () => {
      const targetZ = 5 - currentLayerIndex * 4;
      const animateZoom = () => {
        requestAnimationFrame(animateZoom);
        camera.position.z += (targetZ - camera.position.z) * 0.1;
        if (Math.abs(camera.position.z - targetZ) < 0.01) {
          camera.position.z = targetZ;
          return;
        }
        renderer.render(scene, camera);
      };
      animateZoom();
    };

    zoomToLayer();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, [
    layers,
    currentLayerIndex,
    backgroundColor,
    headingTextColor,
    headingSubtextColor,
  ]);

  const handleNextLayer = () => {
    if (currentLayerIndex < layers.length - 1) {
      setCurrentLayerIndex(currentLayerIndex + 1);
    }
  };

  const handlePreviousLayer = () => {
    if (currentLayerIndex > 0) {
      setCurrentLayerIndex(currentLayerIndex - 1);
    }
  };

  return (
    <div className="flex relative">
      <div ref={mountRef} className="w-3/4 h-full relative" />
      <div className={`w-1/4 p-4 translate-x-0 h-full`}>
        <h2 className="text-xl font-bold mb-4">Customize</h2>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setTextTabActive(true)}
            className={`py-2 px-4 rounded ${
              textTabActive ? "bg-blue-500 text-white" : ""
            }`}
          >
            Text
          </button>
          <button
            onClick={() => setTextTabActive(false)}
            className={`py-2 px-4 rounded ${
              !textTabActive ? "bg-blue-500 text-white" : ""
            }`}
          >
            Customization
          </button>
        </div>
        {textTabActive ? (
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6">
              Layer {currentLayerIndex + 1}
            </h3>

            {layers[currentLayerIndex] &&
              layers[currentLayerIndex].parts &&
              layers[currentLayerIndex].parts.map((_part, partIndex) => (
                <div
                  key={partIndex}
                  className="flex justify-between items-center mb-4"
                >
                  <div className="w-full mr-4">
                    <div className="flex flex-row justify-between">
                      <h4 className="text-xl font-semibold text-gray-200">
                        Part {partIndex + 1}
                      </h4>
                      {layers[currentLayerIndex].parts.length > 1 && (
                        <button
                          onClick={() => handleDeletePart(partIndex)}
                          className="text-red-500 hover:text-red-700 transition duration-200"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                    <textarea
                      value={
                        pendingLayers[currentLayerIndex] &&
                        pendingLayers[currentLayerIndex].parts &&
                        pendingLayers[currentLayerIndex].parts[partIndex]?.text
                      }
                      onChange={(e) => handleTextChange(e, partIndex)}
                      className="w-full h-24 bg-gray-700 text-white rounded-md p-3 mt-2"
                    />
                  </div>
                </div>
              ))}

            <div className="mb-4">
              <button
                onClick={handleAddSection}
                className="text-blue-500 hover:text-blue-700 transition duration-200"
              >
                + Add Section
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={applyTextChanges}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
              >
                Apply
              </button>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <button
                onClick={handleDeleteLayer}
                className="w-full py-2 px-4 text-white bg-red-500 rounded-md hover:bg-red-600 transition duration-200"
                disabled={layers.length <= 1}
              >
                Delete Layer
              </button>

              <button
                onClick={handleAddLayer}
                className="w-full py-2 px-4 text-white bg-green-500 rounded-md hover:bg-green-600 transition duration-200"
              >
                Add Layer
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-bold mb-4">Colors</h3>
            <div className="mb-4">
              <label className="font-semibold">Background Color</label>
              <input
                type="color"
                value={pendingBackgroundColor}
                onChange={(e) => setPendingBackgroundColor(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold">Heading Text Color</label>
              <input
                type="color"
                value={pendingHeadingTextColor}
                onChange={(e) => setPendingHeadingTextColor(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <label className="font-semibold">Heading Subtext Color</label>
              <input
                type="color"
                value={pendingHeadingSubtextColor}
                onChange={(e) => setPendingHeadingSubtextColor(e.target.value)}
                className="w-full"
              />
            </div>
            <button
              onClick={applyColors}
              className="bg-green-500 text-white py-2 px-4 rounded"
            >
              Apply
            </button>
          </div>
        )}
        <div className="mt-4">
          <button
            onClick={handlePreviousLayer}
            className="py-2 px-4 bg-gray-500 text-white mr-2"
            disabled={currentLayerIndex === 0}
          >
            Previous Layer
          </button>
          <button
            onClick={handleNextLayer}
            className="py-2 px-4 bg-gray-500 text-white"
            disabled={currentLayerIndex === layers.length - 1}
          >
            Next Layer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateResume;
