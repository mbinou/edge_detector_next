"use client";

import { EdgeDetectionMethod, process_image_wasm } from "edge_detector_wasm";
import Image from "next/image";
import { useState } from "react";

export default function ImageProcessor() {
  const [image, setImage] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [method, setMethod] = useState<"Sobel" | "Canny">("Sobel");

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImage(event.target.files[0]);
      setOutputImage(null);
    }
  };

  const processImage = async () => {
    if (!image) {
      alert("Please select an image first.");
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(image);
    reader.onload = async function () {
      const inputData = new Uint8Array(reader.result as ArrayBuffer);

      // エッジ検出方法を設定
      const wasmMethod =
        method === "Sobel"
          ? EdgeDetectionMethod.Sobel
          : EdgeDetectionMethod.Canny;

      // WASM で画像処理を実行
      const outputData = process_image_wasm(inputData, wasmMethod);

      // 結果を Blob に変換し、画像を表示
      const blob = new Blob([outputData], { type: "image/png" });
      setOutputImage(URL.createObjectURL(blob));
    };
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <h1 className="text-2xl font-bold">Edge Detector (WASM)</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value as "Sobel" | "Canny")}
      >
        <option value="Sobel">Sobel</option>
        <option value="Canny">Canny</option>
      </select>
      <button
        onClick={processImage}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Process Image
      </button>
      <div className="flex space-x-4 mt-4">
        {image && (
          <Image
            src={URL.createObjectURL(image)}
            alt="Input Image"
            className="mt-4 border rounded"
            width={500}
            height={500}
          />
        )}
        {outputImage && (
          <Image
            src={outputImage}
            alt="Processed Output"
            className="mt-4 border rounded"
            width={500}
            height={500}
          />
        )}
      </div>
    </div>
  );
}
