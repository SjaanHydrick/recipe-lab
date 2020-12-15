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


}