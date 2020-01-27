const MemoryStore = {
  games: new Map(),
  async set(gameId, gameState) {
    this.games.set(gameId, gameState);
    return Promise.resolve(gameState.id);
  },
  async get(gameId) {
    return Promise.resolve(this.games.get(gameId));
  },
  async del(gameId) {
    return Promise.resolve(this.games.delete(gameId));
  },
  async quit() {
    return Promise.resolve('OK');
  }
};

module.exports = MemoryStore;