class BaseRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async query(sql, params = []) {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  async getOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  async insert(sql, params = []) {
    const [result] = await this.pool.execute(sql, params);
    return result.insertId;
  }

  async update(sql, params = []) {
    const [result] = await this.pool.execute(sql, params);
    return result.affectedRows;
  }

  async delete(sql, params = []) {
    const [result] = await this.pool.execute(sql, params);
    return result.affectedRows;
  }
}

module.exports = BaseRepository;