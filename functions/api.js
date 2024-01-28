const cloudinary = require("cloudinary").v2;
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const app = express();
app.use(cors());
const router = express.Router();

cloudinary.config({
  cloud_name: "dfkjpkbys",
  api_key: "721784373271373",
  api_secret: "ANlhSCj9XsV5MvRxIYKMtjknvaA",
  secure: true,
});

const findCoverUrl = (item, data) => {
  return data.find((i) => {
    return (
      i.public_id
        .toLowerCase()
        .includes(
          item.public_id
            .slice(
              item.public_id.lastIndexOf("/") + 1,
              item.public_id.length - 6
            )
            .toLowerCase()
        ) && i.resource_type !== "raw"
    );
  })?.secure_url;
};

const processResponse = (data = []) => {
  let response = [];
  for (let i = 0; i < data.length; i++) {
    const item = data.at(i);
    if (item.resource_type === "raw") {
      const obj = {
        url: item.secure_url,
        coverURL: findCoverUrl(item, data),
        title: item.public_id.slice(
          item.public_id.lastIndexOf("/") + 1,
          item.public_id.length - 5
        ),
      };
      response.push(obj);
    }
  }
  return response;
};

router.get("/", async (_, res) => {
  let array = [];
  const rawFilesPromise = cloudinary.api.resources({
    resource_type: "raw",
    max_results: 100,
  });

  const imagesPromise = cloudinary.api.resources({
    resource_type: "image",
    max_results: 100,
  });

  const [rawFiles, images] = await Promise.allSettled([
    rawFilesPromise,
    imagesPromise,
  ]);

  array = [...rawFiles.value.resources, ...images.value.resources];
  res.send(processResponse(array));
});

app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
