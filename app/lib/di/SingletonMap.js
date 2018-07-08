class SingletonMap {
  constructor() {
    this.map = new Map;
  }

  set(key, value) {
    console.log("Set %s", key);
    this.map.set(key, value);
  }

  get(key) {
    return this.map.get(key);
  }
}

export default new SingletonMap();
