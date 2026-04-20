export const getPosition = async () => {
    let latitude = 36;
    let longitude = 41;
    let city = "Samsun";

    if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    }

    const apiURL = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`;

    const response = await fetch(apiURL);
    if (!response.ok) {
        throw new Error("API isteği başarısız oldu.");
    }

    const data = await response.json();
    city = data.principalSubdivision;
    const currentPosition = {
        longitude,
        latitude,
        city
    };

    return currentPosition;

};

// Kullanım örneği
// (async () => {
//     try {
//         const position = await getPosition();
//         console.log("Konum Bilgisi:", position);
//     } catch (error) {
//         console.error("Hata:", error);
//     }
// })();
