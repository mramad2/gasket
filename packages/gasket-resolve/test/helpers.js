/* istanbul ignore file */

const isModulePath = /^[/.]|node_modules/;


function error(mod) {
  const err = new Error(`Cannot find module '${mod}' from 'mocked'`);
  err.code = 'MODULE_NOT_FOUND';
  return err;
}


function makeRequire(modules) {
  const _paths = {};
  const _modules = {};
  Object.keys(modules).forEach(name => {
    const pth = isModulePath.test(name) ? name : '/path/to/node_modules/' + name;
    const windowsPth = isModulePath.test(name) ? name : 'C:\\path\\to\\node_modules\\' + name.replace('/', '\\');
    _paths[name] = pth;
    _paths[pth] = pth;
    _paths[windowsPth] = pth;
    _modules[name] = modules[name];
    _modules[pth] = modules[name];
    _modules[windowsPth] = modules[name];
  });

  _paths.broken = '/path/to/node_modules/broken';
  Object.defineProperty(_modules, '/path/to/node_modules/broken', {
    get: function () { throw new Error('Bad things'); }
  });

  const _require = jest.fn(mod => {
    if (_modules[mod]) {
      return _modules[mod];
    }
    throw error(mod);
  });

  _require.resolve = jest.fn(mod => {
    if (_paths[mod]) {
      return _paths[mod];
    }
    throw error(mod);
  });

  return _require;
}

module.exports = {
  makeRequire
};
