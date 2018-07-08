import _            from "underscore";
import SingletonMap from "app/lib/di/SingletonMap";

/**
 * Dependency Injection
 */

function dependencyKey(cls) {
  return cls.injectionName + "--dependency";
}

function instanceKey(cls) {
  return cls.injectionName + "--instance";
}

const Inject = (dependencyObj = {}) => (cls) => {
  SingletonMap.set(dependencyKey(cls), dependencyObj);
  return cls;
};

const getInstance = (cls) => {
  const cachedInstance = SingletonMap.get(instanceKey(cls));
  if (cachedInstance) {
    return cachedInstance;
  } else {
    const dependencyObj = SingletonMap.get(dependencyKey(cls));
    const dependencyInstances = _.mapObject(dependencyObj, getInstance);
    const instance = new cls(dependencyInstances);
    SingletonMap.set(instanceKey(cls), instance);
    return instance;
  }
};

const mock = (mockDependencyObj) => (cls) => {
  const dependencyObj = _.omit(SingletonMap.get(dependencyKey(cls)), ...Object.keys(mockDependencyObj));
  const dependencyInstances = _.mapObject(dependencyObj, getInstance);
  const mockInstances = _.mapObject(mockDependencyObj, cls => new cls());

  return new cls(_.extend({}, dependencyInstances, mockInstances));
};

Inject.getInstance = getInstance;
Inject.mock = mock;

export default Inject;
