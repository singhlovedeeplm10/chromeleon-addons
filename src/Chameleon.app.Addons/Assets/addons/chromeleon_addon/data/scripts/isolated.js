const SETTINGS_ARRAY = [
  "enabled",
  "webglSpoofing",
  "canvasProtection",
  "clientRectsSpoofing",
  "fontsSpoofing",
  "dAPI",
  "eMode",
  "dMode",
  "noiseLevel",
  "debug"
];

let settings = {
  enabled: true,
  webglSpoofing: true,
  canvasProtection: true,
  clientRectsSpoofing: true,
  fontsSpoofing: false,
  geoSpoofing: true,
  timezoneSpoofing: true,
  dAPI: true,
  eMode: "disable_non_proxied_udp",
  dMode: "default_public_interface_only",
  noiseLevel: "medium",
  debug: 3,
};

// timezone addon

const port = document.createElement('span');
port.id = 'stz-obhgtd';
port.dataset.timezone = 'Etc/GMT';
port.dataset.offset = 0;
document.documentElement.append(port);

self.update = reason => {
  port.dataset.timezone = self.prefs.timezone;
  port.dataset.offset = self.prefs.offset;

  port.dispatchEvent(new Event('change'));
};

if (typeof self.prefs === 'undefined') {
  try {
    if (self !== parent) {
      self.prefs = parent.prefs;
    }
  }
  catch (e) {}
}

// ask from bg (just as a backup)
if (typeof self.prefs === 'undefined') {
  setTimeout(() => {
    if (typeof self.prefs === 'undefined') {
      chrome.runtime.sendMessage({
        method: 'get-prefs'
      }, prefs => {
        self.prefs = prefs;
        self.update('ask from bg');
      });
    }
  }, 500);
}
else {
  self.update('top frame or committed');
}

// updates
chrome.storage.onChanged.addListener(ps => {
  if (ps.offset) {
    self.prefs.offset = ps.offset.newValue;
  }
  if (ps.timezone) {
    self.prefs.timezone = ps.timezone.newValue;
  }
  if (ps.offset || ps.timezone) {
    self.update('updated');
  }
});  

const win = {
  send(type, data) {
    // Relay settings to page context script
    window.postMessage({ type: type, data: data }, "*");
  },
  listen() {
    // Listen for messages from the main script
    window.addEventListener(
      "message",
      async function (e) {
        if (
          e.data &&
          e.data.type === "REQUEST_Chromeleon_DEFENDER_SETTINGS"
        ) {
          e.preventDefault();
          e.stopPropagation();
          settings = await chrome.storage.sync.get(SETTINGS_ARRAY);
          win.send("Chromeleon_DEFENDER_SETTINGS_RESPONSE", settings);
        }
      },
      false
    );
  },
};
win.listen();

// Load modules as web-accessible resources
async function loadModule(moduleName) {
  const url = chrome.runtime.getURL(`modules/${moduleName}.js`);
  const module = await import(url);
  return module;
}

async function loadSettingsAndLogger() {
  const settingsModule = await loadModule("settings");
  const loggerModule = await loadModule("logger");
  return {
    SETTINGS_ARRAY: settingsModule.SETTINGS_ARRAY,
    log: loggerModule.log
  };
}
(async () => {
  settings = await chrome.storage.sync.get(SETTINGS_ARRAY);
  const { SETTINGS_ARR, log } = await loadSettingsAndLogger();

  const background = {
    send(id, data, callback) {
      chrome.runtime.sendMessage(
        {
          action: id,
          data: data,
        },
        function (response) {
          if (chrome.runtime.lastError) {
            log.error("Error sending message:", chrome.runtime.lastError);
          } else {
            log.info("Message sent successfully:", response);
            callback && callback(response);
          }
        }
      );
    },
    listen() {
      chrome.runtime.onMessage.addListener(function (
        request,
        sender,
        sendResponse
      ) {
        log.info("Received message in content script:", request);
        // if (request.action === 'updateSettings') {
        //   settings = request.settings;
        //   loadSettings();
        // }
      });
    },
  };
  background.listen();

  log.info("WebGL Defender: Isolated script loaded and active");
})();
