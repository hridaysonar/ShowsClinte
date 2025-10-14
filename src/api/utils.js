

import axios from "axios";

export async function saveImgCloud(file) {
    const base64 = await fileToBase64(file);
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload-image`, {
        imageBase64: base64,
    });

    return data?.url;
}




function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

