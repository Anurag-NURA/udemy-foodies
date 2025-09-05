"use client";
import { useRef, useState } from "react";
import Image from "next/image";

import classes from "./image-picker.module.css";

export default function ImagePicker({ label, name }) {
  const [preview, setPreview] = useState();
  const imageInputRef = useRef();

  function handlePickImage() {
    imageInputRef.current.click();
  }

  function handleImageChange(event) {
    //event.target.files is a FileList Object
    //we only allow one file, so we access the first item in the list
    //this gives us the File Object
    const file = event.target.files[0];

    if (!file) {
      setPreview(null);
      return;
    }

    //file reader converts the file into a base64-encoded Data URL string
    const fileReader = new FileReader();
    fileReader.onload = () => {
      //image tag expexts a URL(string), not a File Object
      setPreview(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }

  return (
    <div className={classes.picker}>
      <label htmlFor={name}>{label}</label>
      <div className={classes.controls}>
        <div className={classes.preview}>
          {preview && <Image src={preview} alt="Preview" fill />}
          {!preview && <p>No image picked yet.</p>}
        </div>
        <input
          ref={imageInputRef}
          className={classes.input}
          type="file"
          id={name}
          accept="image/png, image/jpeg"
          name={name}
          onChange={handleImageChange}
          required
        />
        <button
          type="button"
          onClick={handlePickImage}
          className={classes.button}
        >
          Pick an image
        </button>
      </div>
    </div>
  );
}
