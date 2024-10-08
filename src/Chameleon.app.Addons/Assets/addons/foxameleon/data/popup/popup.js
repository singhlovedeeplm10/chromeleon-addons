import { log } from "../../modules/logger.js";
import { SETTINGS_ARRAY, settings} from "../../modules/settings.js";

document.addEventListener("DOMContentLoaded", function () {
  const toggleExtension = document.getElementById("toggle-extension");
  const webglSpoofing = document.getElementById("webgl-spoofing");
  const canvasProtection = document.getElementById("canvas-protection");
  const clientRectsSpoofing = document.getElementById("client-rects-spoofing");
  const fontsSpoofing = document.getElementById("fonts-spoofing");
  const geoSpoofing = document.getElementById("geo-spoofing");
  const timezoneSpoofing = document.getElementById("timezone-spoofing");
  const noiseLevel = document.getElementById("noise-level");
  const statusText = document.getElementById("status-text");
  const blockedCount = document.getElementById("blocked-count");

  // Load saved settings
    toggleExtension.checked = settings.enabled !== false;
    webglSpoofing.checked = settings.webglSpoofing !== false;
    canvasProtection.checked = settings.canvasProtection !== false;
    clientRectsSpoofing.checked = settings.clientRectsSpoofing !== false;
    fontsSpoofing.checked = settings.fontsSpoofing !== false;
    geoSpoofing.checked = settings.geoSpoofing !== false;
    timezoneSpoofing.checked = settings.timezoneSpoofing !== false;
    noiseLevel.value = settings.noiseLevel || "medium";
    blockedCount.textContent = settings.blockedCount || 0;
    updateStatus();

  // Update status text
  function updateStatus() {
    statusText.textContent = toggleExtension.checked ? "Enabled" : "Disabled";
    statusText.style.color = toggleExtension.checked ? "green" : "red";
  }

  // Save settings and update content scripts
  function saveSettings() {
    settings.enabled = toggleExtension.checked;
    settings.webglSpoofing = webglSpoofing.checked;
    settings.canvasProtection = canvasProtection.checked;
    settings.clientRectsSpoofing = clientRectsSpoofing.checked;
    settings.fontsSpoofing = fontsSpoofing.checked;
    settings.geoSpoofing = geoSpoofing.checked;
    settings.timezoneSpoofing = timezoneSpoofing.checked;
    settings.noiseLevel = noiseLevel.value;

    chrome.storage.sync.set(settings, function () {
      log.info("Settings saved");
      updateStatus();
    });
  }

  // Event listeners
  toggleExtension.addEventListener("change", saveSettings);
  webglSpoofing.addEventListener("change", saveSettings);
  canvasProtection.addEventListener("change", saveSettings);
  clientRectsSpoofing.addEventListener("change", saveSettings);
  fontsSpoofing.addEventListener("change", saveSettings);
  geoSpoofing.addEventListener("change", saveSettings);
  timezoneSpoofing.addEventListener("change", saveSettings);
  noiseLevel.addEventListener("change", saveSettings);
});
