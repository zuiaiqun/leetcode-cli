var _ = require('underscore');

var cache = require('./cache'),
    client = require('./leetcode_client');

var core = {};

core.getProblems = function(cb) {
  var cached = cache.get('all');
  if (cached) return cb(null, cached);

  client.getProblems(function(e, problems){
    cache.set('all', problems);
    return cb(e, problems);
  });
};

core.getProblem = function(keyword, cb) {
  this.getProblems(function(e, problems) {
    if (e) return cb(e);

    var problem = _.find(problems, function(x){
      return x.id == keyword || x.name == keyword || x.key == keyword;
    });
    if (!problem)
      return cb('Problem not found!');

    var cached = cache.get(problem.key);
    if (cached) return cb(null, cached);

    client.getProblem(problem, function(e, problem){
      cache.set(problem.key, problem);
      return cb(null, problem);
    });
  });
};

core.testProblem = function(problem, cb) {
  client.testProblem(problem, cb);
};

core.login = function(user, cb) {
  client.login(user, function(e, user){
    if (e) return cb(e);

    // FIXME: need expire all.json
    cache.set('.user', user);
    return cb(null, user);
  });
};

core.logout = function(user) {
  user = this.getUser();
  if (user) cache.del('.user');
  return user;
};

core.getUser = function() { return cache.get('.user'); };
core.isLogin = function() { return this.getUser() != null; };

module.exports = core;