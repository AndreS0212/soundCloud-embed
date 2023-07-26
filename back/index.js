const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const getSoundCloudId = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  let soundcloudId = "";
  // Seleccionamos todos los elemetos meta de lap agina
  $("meta").each((index, element) => {
    //Extraemos el contenido de los elementos meta
    const content = $(element).attr("content");
    //si el contenido incluye soundcloud:// se extrae el id
    if (content && content.includes("soundcloud://")) {
      soundcloudId = content.split("soundcloud://")[1];
    }
  });
  //Se devuelve el id
  return soundcloudId;
};

app.post("/soundcloud", async (req, res) => {
  try {
    const { url } = req.body;
    //Se obtiene el id de la url
    const soundcloudId = await getSoundCloudId(url);
    //Se obtiene el tipo y el id del id de soundcloud
    let type = soundcloudId.split(":")[0];
    let mediaId = soundcloudId.split(":")[1];
    //se le da el formato requerido https%3A//api.soundcloud.com/playlists/414972590
    //sounds equivale a tracks
    if (type === "sounds") {
      const soundcloudUrl = `https%3A//api.soundcloud.com/tracks/${mediaId}`;
      return res
        .status(200)
        .json({ status: "sucess", url: soundcloudUrl, type: "track" });
      //system-playlists son playlists
    } else if (type === "system-playlists") {
      const soundcloudUrl = `https%3A//api.soundcloud.com/playlists/${mediaId}`;
      return res
        .status(200)
        .json({ status: "sucess", url: soundcloudUrl, type: "playlist" });
    }
    //otros tipos
    const soundcloudUrl = `https%3A//api.soundcloud.com/${type}/${mediaId}`;
    res.status(200).json({
      status: "sucess",
      url: soundcloudUrl,
      type: type,
    });
  } catch (error) {
    //Se devuelve un estado y mensaje de error
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port 3000");
});
