import { useState } from "react";
import soundCloudIcon from "./assets/soundcloudicon.svg";
import "./App.css";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

function App() {
  const [searchValue, setSearchValue] = useState("");
  const [showSoundPlayer, setShowSoundPlayer] = useState(false);
  const [soundCloud, setSoundCloud] = useState({});

  //Visual cambia la aparencia del reproductor
  //auto_play reproduce automaticamente al cargar
  //hide_related oculta los tracks relacionados
  //show_comments muestra los comentarios
  //show_user muestra el usuario
  //show_reposts muestra los reposts
  //buying muestra el boton de comprar
  //download muestra el boton de descargar
  //sharing muestra el boton de compartir
  //show_playcount muestra el contador de reproducciones
  //show_artwork muestra la imagen del album
  //start_track indica el track inicial
  //color indica el color de los botones
  let optionsSoundCloud =
    "&amp&auto_play=false&hide_related=false&show_comments=false&show_reposts=false&buying=false&download=false&sharing=false&show_user=true&show_teaser=true&visual=false";

  const { mutate } = useMutation(
    ["soundCloud", searchValue],
    async () => {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/soundcloud`,
        { url: searchValue },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_BACKEND_TOKEN}`,
          },
        }
      );
      return data;
    },
    {
      onSuccess: (data) => {
        setSoundCloud(data);
        setShowSoundPlayer(true);
      },
      onError: (error) => {
        console.log(error);
      },
      staleTime: 1000 * 60 * 60 * 24 * 7,
      enabled: false,
    }
  );
  //Si se presiona enter se envia la peticion a nuestro backend
  const handleOnKeyDown = async (e) => {
    if (e.key === "Enter") {
      mutate();
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };
  //Dependiendo del tipo de contenido que se recibe se cambia el tamaño del reproductor
  const heightPlayer = () => {
    if (soundCloud.status === "error") {
      return "140";
    } else if (soundCloud.type === "track") {
      return "140";
    } else if (
      soundCloud.type === "playlist" ||
      soundCloud.type === "album" ||
      soundCloud.type === "artist" ||
      soundCloud.type === "users"
    ) {
      return "390";
    }
  };

  return (
    <>
      {!showSoundPlayer ? (
        <div className="flex flex-row w-[390px] rounded-lg shadow-xl">
          <img
            src={soundCloudIcon}
            alt="soundCloud Icon"
            className="h-[30px] mb-1"
          />
          <input
            className=" flex mx-3 max-w-[85%] w-[85%] outline-none "
            type="text"
            placeholder="URL de SoundCloud"
            onKeyDown={handleOnKeyDown}
            onChange={handleSearchChange}
            value={searchValue}
          />
        </div>
      ) : (
        <div>
          <iframe
            className="rounded-xl shadow-lg"
            width="390"
            height={heightPlayer()}
            allow="autoplay"
            src={
              "https://w.soundcloud.com/player/?url=" +
              soundCloud.url +
              optionsSoundCloud
            }
          ></iframe>
        </div>
      )}
    </>
  );
}

export default App;
