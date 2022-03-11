window.onload = async () => {
  const video = document.getElementById("video");
  const maskImageCount = 100;
  const noMaskImageCount = 100;
  const incorrectImageCount = 150;
  const trainImagesContainer = document.querySelector(".train-images");

  // Load mobilenet module
  const mobilenetModule = await mobilenet.load({ version: 2, alpha: 1 });
  // Add mask images to the DOM and give them a class of `mask-img`
  for (let i = 1; i <= maskImageCount; i++) {
    const newImage = document.createElement("IMG");
    newImage.setAttribute("src", `images/with_mask/with_mask_${i}.jpg`);
    console.log(`load image with mask ${i}`);
    newImage.classList.add("mask-img");
    newImage.setAttribute("width", "150px");
    newImage.setAttribute("height", "100px");
    trainImagesContainer.appendChild(newImage);
  }
  // Add no mask images to the DOM and give them a class of `no-mask-img`
  for (let i = 1; i <= noMaskImageCount; i++) {
    const newImage = document.createElement("IMG");
    newImage.setAttribute("src", `images/without_mask/without_mask_${i}.jpg`);
    console.log(`load image without mask ${i}`);
    newImage.classList.add("no-mask-img");
    newImage.setAttribute("width", "150px");
    newImage.setAttribute("height", "100px");
    trainImagesContainer.appendChild(newImage);
  }
  // add incorrect mask to the dom and give them a class of "incorrect-mask-img"
  for (let i = 1; i <= incorrectImageCount; i++) {
    const newImage = document.createElement("IMG");
    if (i <= 9) {
      newImage.setAttribute(
        "src",
        `images/incorrect_mask/0000${i}_Mask_Mouth_Chin.jpg`
      );
    } else if (i <= 99) {
      newImage.setAttribute(
        "src",
        `images/incorrect_mask/000${i}_Mask_Mouth_Chin.jpg`
      );
    } else if (i >= 100) {
      newImage.setAttribute(
        "src",
        `images/incorrect_mask/00${i}_Mask_Mouth_Chin.jpg`
      );
    }
    console.log(`load image incorrect mask ${i}`);
    newImage.classList.add("no-mask-img");
    newImage.setAttribute("width", "150px");
    newImage.setAttribute("height", "100px");
    trainImagesContainer.appendChild(newImage);
  }
  console.log("load doneeeeee");
  async function trainClassifier(mobilenetModule) {
    // Create a new KNN Classifier
    const classifier = knnClassifier.create();
    // Train using mask images
    const maskImages = document.querySelectorAll(".mask-img");
    maskImages.forEach((img, index) => {
      console.log(`trainclassifier infer image with mask ${index}`);
      const tfImg = tf.browser.fromPixels(img);
      const logits = mobilenetModule.infer(tfImg, "conv_preds");
      classifier.addExample(logits, 0); // has mask
    });
    // Train using no mask images
    const noMaskImages = document.querySelectorAll(".no-mask-img");
    noMaskImages.forEach((img, index) => {
      console.log(`trainclassifier infer image without mask ${index}`);
      const tfImg = tf.browser.fromPixels(img);
      const logits = mobilenetModule.infer(tfImg, "conv_preds");
      classifier.addExample(logits, 1); // no mask
    });
    // // Train using incorrect mask images
    // const incorrectMaskImages = document.querySelectorAll(".no-mask-img");
    // incorrectMaskImages.forEach((img, index) => {
    //   console.log(`trainclassifier infer image incorrect mask ${index}`);
    //   const tfImg = tf.browser.fromPixels(img);
    //   const logits = mobilenetModule.infer(tfImg, "conv_preds");
    //   classifier.addExample(logits, 1); // incorrect mask
    // });
    return classifier;
  }
  console.log("load balze face");
  const model = await blazeface.load();
  console.log("load blaze face done ... trainclassifier");
  const classifier = await trainClassifier(mobilenetModule);
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
  video.addEventListener("play", async () => {
    setInterval(async () => {
      let results = [];
      const predictions = await model.estimateFaces(video, false);
      console.log(predictions);
      if (predictions)
        predictions.forEach((prediction) => {
          const start = prediction.topLeft;
          const end = prediction.bottomRight;
          const canvasFace = cutFace(
            start[0],
            start[1],
            end[0] - start[0],
            end[1] - start[1],
            null
          );
          detectMask(canvasFace).then((rs) => results.push(rs));
        });
      console.log(results);
      // const start = predictions[0].topLeft;
      // const end = predictions[0].bottomRight;
      // const canvasFace = cutFace(
      //   start[0],
      //   start[1],
      //   end[0] - start[0],
      //   end[1] - start[1]
      // );
      // detectMask(canvasFace);
    }, 100);
  });
  async function detectMask(canvas) {
    const logits = mobilenetModule.infer(canvas, "conv_preds");
    const prediction = await classifier.predictClass(logits);
    console.log(prediction.confidences);
    const confidenceMask = prediction.confidences["0"].toFixed(2);
    const confidenceNoMask = prediction.confidences["1"].toFixed(2);
    if (confidenceMask == 0.67 && confidenceNoMask == 0.33) {
      console.log("incorrect maskkkkkkkkkkkkk");
    } else {
      console.log(confidenceMask, confidenceNoMask);
    }
    // Add a border to the test image to display the prediction result
    if (prediction.label == 1) {
      // no mask - red border
      return "no maskkkkk";
      console.log("no maskkkk");
    } else if (prediction.label == 0) {
      // has mask - green border
      return "maskkkk";
      // console.log("maskkkk");
    }
  }
  function cutFace(dx, dy, dWidth, dHeight, loadDataSet) {
    const imageFace = document.getElementById("imageFace");
    var canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 480;
    var ctx = canvas.getContext("2d");
    // ctx.drawImage(video, dx, dy, dWidth, dHeight);
    ctx.drawImage(
      video,
      dx - 70,
      dy - 70,
      dWidth + 100,
      dHeight + 100,
      0,
      0,
      dWidth + 100,
      dHeight + 100
    );
    var img = new Image();
    img.src = canvas.toDataURL();
    if (loadDataSet) return img.src;
    imageFace.setAttribute("src", img.src);
    return canvas;
  }
};
