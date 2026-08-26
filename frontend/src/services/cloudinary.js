export async function uploadImage(file){


const data = new FormData();


data.append(
"file",
file
);


data.append(
"upload_preset",
import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);



const response = await fetch(

`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,

{

method:"POST",

body:data

}

);


const result = await response.json();

if (!response.ok) {
throw new Error(result?.error?.message || "Cloudinary upload failed.");
}

if (!result.secure_url) {
throw new Error("Cloudinary upload did not return a secure image URL.");
}


return result.secure_url;


}
