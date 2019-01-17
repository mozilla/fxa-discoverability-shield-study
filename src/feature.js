/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(feature)" }]*/

const DEFAULT_AVATAR = 0;
const UNVERIFIED_AVATAR = 1;
const USER_AVATAR = 2;

const STANDARD_AVATARS = {
  [DEFAULT_AVATAR]: "icons/avatar.svg",
  [UNVERIFIED_AVATAR]: "icons/avatar_confirm.svg",
};

class FxABrowserFeature {
  constructor() {}

  configure(studyInfo) {
    this._variation = studyInfo.variation.name;
    this.updateState();
    browser.browserAction.setTitle({ title: "Firefox Account" });

    browser.fxa.listen();
    browser.fxa.onUpdate.addListener(() => {
      this.updateState();
    });

    if (studyInfo.isFirstRun) {
      this.sendTelemetry({
        pingType: "start",
        interactionType: "none",
        doorhangerActiveSeconds: "0",
      });
    }
  }

  async updateState() {
    // The stored sessionToken will always be the source of truth when checking
    // account state.
    const user = await browser.fxa.getSignedInUser();
    if (user) {
      if (user.verified) {
        this.verifiedUser(user);
      } else {
        this.unverifiedUser();
      }
    } else {
      this.noUser();
    }
  }

  noUser() {
    this._state = null;
    this.standardAvatar(DEFAULT_AVATAR);
    browser.browserAction.setPopup({ popup: "popup/sign_in/sign_in.html" });
  }

  standardAvatar(id) {
    this._avatarUrl = null;
    if (this._avatar !== id) {
      this._avatar = id;
      browser.browserAction.setIcon({ path: STANDARD_AVATARS[id] });
    }
  }

  unverifiedUser() {
    this._state = "unverified";
    this.standardAvatar(UNVERIFIED_AVATAR);
    browser.browserAction.setPopup({ popup: "popup/unverified/unverified.html" });
  }

  verifiedUser(user) {
    this._state = "verified";
    if (user.avatar) {
      this.userAvatar(user.avatar);
    } else {
      this.standardAvatar(DEFAULT_AVATAR);
    }

    browser.browserAction.setPopup({ popup: "popup/menu/menu.html" });
  }

  userAvatar(url) {
    if (this._avatar === USER_AVATAR && this._avatarUrl === url) {
      return;
    }

    this._avatar = USER_AVATAR;
    this._avatarUrl = url;

    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;

      const ctx = canvas.getContext("2d");

      // Create a circular avatar
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 2, 0, 2 * Math.PI);
      ctx.clip();

      ctx.drawImage(this, 0, 0);

      const imageData = ctx.getImageData(0, 0, 200, 200);

      browser.browserAction.setIcon({ imageData });
    };
    img.src = url;
  }

  sendTelemetry(data) {
    browser.study.sendTelemetry({
      ...data,
      addonId: "fxadisco",
      addonVersion: "1",
      branch: this._variation,
      startTime: `${Date.now()}`,
      fxaState: this._state || "none",
      hasAvatar: `${this._avatar === USER_AVATAR}`,
      uid: this._hashedUid || "none",
    });
  }

  cleanup() {
    this.sendTelemetry({
      pingType: "stop",
      interactionType: "none",
      doorhangerActiveSeconds: "0",
    });
  }
}

window.feature = new FxABrowserFeature();
