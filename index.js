const sharp = require("sharp");

(async () => {
  const imagePaths = ["images/1.jpg", "images/2.jpg", "images/3.jpg"];
  const imageAttrs = [];

  // 連結する画像の情報取得
  const promises = [];
  const imagePromise = path =>
    new Promise(async resolve => {
      const image = await sharp(path);
      let width = 0,
        height = 0;
      await image
        .metadata()
        .then(meta => ([width, height] = [meta.width, meta.height]));
      const buf = await image.toBuffer();
      resolve({ width, height, buf });
    });
  imagePaths.forEach(path => promises.push(imagePromise(path)));
  await Promise.all(promises).then(values => {
    values.forEach(value => {
      console.log(value);
      imageAttrs.push(value);
    });
  });

  // outputする画像の設定
  const outputImgWidth = imageAttrs.reduce((acc, cur) => acc + cur.width, 0);
  const outputImgHeight = Math.max(...imageAttrs.map(v => v.height));
  let totalLeft = 0;
  const compositeParams = imageAttrs.map(image => {
    const left = totalLeft;
    totalLeft += image.width;
    return {
      input: image.buf,
      gravity: "northwest",
      left: left,
      top: 0
    };
  });

  // 連結処理
  sharp({
    create: {
      width: outputImgWidth,
      height: outputImgHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    }
  })
    .composite(compositeParams)
    .toFile("output.png");
})();
