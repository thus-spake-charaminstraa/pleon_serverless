const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const sharp = require('sharp');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

async function downloadImageByUrl(url){
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data, 'binary');
}

async function cropImageByProportionBox(
  image,
  imageKey,
  proportionBox,
) {
  const imageSharp = sharp(Buffer.from(image.buffer), { failOn: 'truncated' });
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: imageKey,
    ACL: 'public-read',
    Body: await imageSharp
      .extract({
        left: Math.round(proportionBox[0]),
        top: Math.round(proportionBox[1]),
        width: Math.round(proportionBox[2] - proportionBox[0]),
        height: Math.round(proportionBox[3] - proportionBox[1]),
      })
      .toBuffer(),
  };
  const ret = await s3.send(new PutObjectCommand(uploadParams));
  console.log(ret);
  return {
    url:
      'https://' +
      process.env.AWS_S3_BUCKET_NAME +
      '.s3.amazonaws.com/' +
      imageKey,
  };
}

exports.handler = async (
  event,
  context,
  callback,
) => {
  console.log(event);
  if (!event.success) {
    return event;
  }
  const imageBuffers = await Promise.all([
    ...event.data.symptoms.map((s) =>
      downloadImageByUrl(s.image_url),
    ),
  ]);
  const croppedImagesUrl = await Promise.all([
    ...imageBuffers.map((imageBuffer, index) =>
      cropImageByProportionBox(
        imageBuffer,
        event.data.symptoms[index].image_key,
        event.data.symptoms[index].box,
      ),
    ),
  ]);
  event.data.symptoms.forEach((s, index) => {
    s.image_url = croppedImagesUrl[index].url;
    delete s.image_key;
    delete s.box;
  });
  return event;
};
