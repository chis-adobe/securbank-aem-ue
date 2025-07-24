/**
 * @param {HTMLElement} $block
 */
export default function decorate(block) {
  console.log(block);

  // Ensure S7 is loaded
  if (typeof s7responsiveImage !== 'function') {
    console.error("s7responsiveImage function is not defined, ensure script include is added to head tag");
    return;
  }

  let inputs = block.querySelectorAll('.dynamic-media > div');
  
  let inputsArray = Array.from(inputs);
  if(inputsArray.length < 2) {
    console.log("Missing inputs, expecting 2, ensure both the image and DM URL are set in the dialog");
    return;
  }

  // Get image
  let imageEl = inputs[0].getElementsByTagName("img")[0];
  if(!imageEl) {
    console.error("Image element not found, ensure it is defined in the dialog");
    return;
  }

  let imageSrc = imageEl.getAttribute("src");
  if(!imageSrc) {
    console.error("Image element source not found, ensure it is defined in the dialog");
    return;
  }

  // Get imageName from imageSrc expected in the format /content/dam/<...>/<imageName>.<extension>
  let imageName = imageSrc.split("/").pop().split(".")[0];

  // Get DM Url input
  let dmUrlEl = inputs[1].getElementsByTagName("a")[0];
  if(!dmUrlEl) {
    console.error("DM Url not found, make sure its set in the dialog");
  }
  
  let dmUrl = dmUrlEl.getAttribute("href");

  imageEl.setAttribute("data-src", dmUrl + (dmUrl.endsWith('/') ? "" : "/") + imageName);
  imageEl.setAttribute("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
  imageEl.setAttribute("data-mode", "smartcrop");

  s7responsiveImage(imageEl);
  dmUrlEl.remove();
}
