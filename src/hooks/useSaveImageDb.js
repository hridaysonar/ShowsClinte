import { useState } from "react";
import Swal from "sweetalert2";
import { saveImgCloud } from "../api/utils";

const useSaveImageDb = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setUploadError(null);
    setImageUrl(null);

    try {
      const url = await saveImgCloud(file);
      setImageUrl(url);
    } catch (err) {
      console.error("Image upload error:", err);
      setUploadError("Failed to upload image.");
      Swal.fire({
        icon: "error",
        title: "Image Upload Failed",
        text: err.message || "Please try again.",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const resetImageState = () => {
    setImageUrl(null);
    setUploadLoading(false);
    setUploadError(null);
  };

  return {
    handleImageUpload,
    imageUrl,
    uploadLoading,
    uploadError,
    resetImageState,
  };
};

export default useSaveImageDb;
