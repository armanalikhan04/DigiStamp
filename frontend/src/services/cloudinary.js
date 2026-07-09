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


return result.secure_url;


}