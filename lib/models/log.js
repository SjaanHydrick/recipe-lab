const pool = require('../utils/pool');

module.exports = class Log {
  recipeId;
  dateOfEvent;
  notes;
  rating;

  constructor(row) {
    this.recipeId = String(row.recipe_id);
    this.dateOfEvent = row.dateOfEvent;
    this.notes = row.notes;
    this.rating = row.rating;
  }

  static async insert(log) {
    const { rows } = await pool.query(
      'INSERT into logs (dateOfEvent, notes, rating) VALUES ($1, $2, $3) RETURNING *' [log.dateOfEvent, log.notes, log.rating]
    );

    return new Log(rows[0]);
  }

  static async find() {
    const { rows } = await pool.query(
      'SELECT * FROM logs'
    );

    return rows.map(row => new Log(row));
  }

  static async findById(recipeId) {
    const { rows } = await pool.query(
      `SELECT
        logs.*,
        array_to_json(array_agg(recipes.*)) AS recipes
       FROM
         logs
       JOIN recipes
       ON logs.recipe_id = recipes.id
       WHERE logs.recipe_id=$1
       GROUP BY logs.recipe_id
       `, [recipeId]
    );

    if(!rows[0]) throw new Error(`No log with id ${recipeId} found`);

    return {
      ...new Log(rows[0])
    };
  }

  static async update(recipeId, log) {
    const { rows } = await pool.query(
      `UPDATE logs
      SET recipe_id=$1,
      dateOfEvent=$2,
      notes=$3,
      rating=$4
      RETURNING *`, [recipeId, log.dateOfEvent, log.notes, log.rating]
    );

    if(!rows[0]) throw new Error(`No log with id ${recipeId} found`);

    return new Log(rows[0]);
  }

  static async delete(recipeId) {
    const { rows } = await pool.query(
      'DELETE FROM logs WHERE recipe_id=$1 RETURNING *', [recipeId]
    );

    if(!rows[0]) throw new Error(`No log with id ${recipeId} found`);

    return new Log(rows[0]);
  }
};
