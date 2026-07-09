import SHA256 from "crypto-js/sha256";


export function generateHash(data){


const hash = SHA256(data).toString();


return hash;


}