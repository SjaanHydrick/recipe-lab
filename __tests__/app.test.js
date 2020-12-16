const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');
const Log = require('../lib/models/log');

describe('recipe-lab routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('creates a recipe', () => {
    return request(app)
      .post('/api/v1/recipes')
      .send({
        name: 'cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ]
        });
      });
  });

  it('creates a log', async() => {
    const macnchs = await Recipe.insert({
      name: 'macaroni and cheese',
      directions: [
        'do some stuff',
        'do more stuff',
        'even more stuff'
      ]
    });

    return request(app)
      .post('/api/v1/logs')
      .send({
        recipeId: macnchs.id,
        dateOfEvent: '1/1/11',
        notes: 'gewd',
        rating: '11/10'
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: macnchs.id,
          dateOfEvent: '1/1/11',
          notes: 'gewd',
          rating: '11/10'
        });
      });
  });

  it('gets all recipes', async() => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [] },
      { name: 'cake', directions: [] },
      { name: 'pie', directions: [] }
    ].map(recipe => Recipe.insert(recipe)));

    return request(app)
      .get('/api/v1/recipes')
      .then(res => {
        recipes.forEach(recipe => {
          expect(res.body).toContainEqual(recipe);
        });
      });
  });

  it('gets all logs', async() => {
    const noodles = await Recipe.insert({
      name: 'buttered noodles',
      directions: [
        'put noodles in boiling water',
        'when soft, strain and then add butter'
      ]
    });
    const macnchs = await Recipe.insert({
      name: 'macaroni and cheese',
      directions:[
        'preheat oven to 350',
        'mix ingredients in big bowl',
        'bake for 1 hour'
      ]
    });

    const logs = await Promise.all([
      { recipeId: noodles.id, dateOfEvent: '12/5/20', notes: 'noodles', rating: '2/10' },
      { recipeId: macnchs.id, dateOfEvent: '2/4/16', notes: 'best meal ever', rating: '200/10' }
    ].map(log => Log.insert(log)));

    return request(app)
      .get('/api/v1/logs')
      .then(res => {
        logs.forEach(log => {
          expect(res.body).toContainEqual(log);
        });
      });
  });

  it('gets a recipe by id', async() => {
    const macnchs = await Recipe.insert({
      name: 'macaroni and cheese',
      directions:[
        'preheat oven to 350',
        'mix ingredients in big bowl',
        'bake for 1 hour'
      ]
    });

    return request(app)
      .get(`/api/v1/recipes/${macnchs.id}`)
      .then(res => {
        expect(res.body).toEqual(macnchs);
      });
  });

  it('gets a log by id', async() => {
    const macnchs = await Recipe.insert({
      name: 'macaroni and cheese',
      directions:[
        'preheat oven to 350',
        'mix ingredients in big bowl',
        'bake for 1 hour'
      ]
    });

    const macnchsLog = await Log.insert({
      recipeId: macnchs.id,
      dateOfEvent: '1/1/11',
      notes: 'gewd',
      rating: '11/10'
    });

    return request(app)
      .get(`/api/v1/logs/${macnchsLog.id}`)
      .then(res => {
        expect(res.body).toEqual(macnchsLog);
      });
  });

  it('updates a recipe by id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    return request(app)
      .put(`/api/v1/recipes/${recipe.id}`)
      .send({
        name: 'good cookies',
        directions: [
          'preheat oven to 375',
          'mix ingredients',
          'put dough on cookie sheet',
          'bake for 10 minutes'
        ]
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          name: 'good cookies',
          directions: [
            'preheat oven to 375',
            'mix ingredients',
            'put dough on cookie sheet',
            'bake for 10 minutes'
          ]
        });
      });
  });

  it('deletes a recipe', async() => {
    const noodles = await Recipe.insert({
      name: 'buttered noodles',
      directions: [
        'put noodles in boiling water',
        'when soft, strain and then add butter'
      ]
    });

    return request(app)
      .delete(`/api/v1/recipes/${noodles.id}`)
      .then(res => {
        expect(res.body).toEqual(noodles);
      });
  });
});

