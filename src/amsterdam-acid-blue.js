async function init() {
  const video_blue = document.getElementById("videoPlayer");

  const ui_config_blue = video_blue["ui"];



  ui_config_blue.configure(config_blue);

  $(".shaka-overflow-menu-button").html("settings");
  $(".shaka-back-to-overflow-button .material-icons-round").html(
    "arrow_back_ios_new"
  );
}

document.addEventListener("shaka-ui-loaded", init);
