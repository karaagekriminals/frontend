class MessageReceiver {
  constructor() {
    this.client = mqtt.connect(
      "ws://localhost:3001",
      {
        username: "admin",
        password: "secretpassword",
        connectTimeout: 10
      }
    );

    this.messageReceivedListeners = [];

    this.lastReceivedRot = {};
    this.lastReceivedQuat = {};

    this.client.on("connect", () => {
      this.client.subscribe("euler/98072d27a984");
      this.client.subscribe("quat/98072d27a984");
      this.client.subscribe("euler/c4be8471a302");
      this.client.subscribe("quat/c4be8471a302");
    });

    this.client.on("message", (topic, message) => {
      let payload = JSON.parse(message.toString());

      let tokens = topic.split("/");
      let topicTitle = tokens[0];
      let deviceId = tokens[1];

      if (topicTitle == "euler") {
        this.lastReceivedRot[deviceId] = new THREE.Euler(payload.pitch, payload.heading, payload.roll, "XYZ");
      } else if (topicTitle == "quat") {
        this.lastReceivedQuat[deviceId] = new THREE.Quaternion(payload.x, payload.y, payload.z, payload.w);
      }

      this.messageReceivedListeners.forEach(listener => {
        listener();
      });
    });
  }

  addMessageReceivedListener(fn) {
    this.messageReceivedListeners.push(fn);
  }
}
